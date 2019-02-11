import {
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
  HttpResponseBase,
  HttpXhrBackend,
  XhrFactory,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { pickAllPropertiesAsGetters } from './pick-properties';
import {
  ApiMockConfig,
  ApiMockService,
  MockData,
  CacheData,
  ApiMockRouteGroup,
  ApiMockRouteRoot,
  PartialRoutes,
  RouteDryMatch,
  GetDataParams,
  HttpMethod,
  ObjectAny,
} from './types';

@Injectable()
export class HttpBackendService implements HttpBackend {
  private cachedData: CacheData = {};
  private routeGroups: ApiMockRouteGroup[] = [];
  /**
   * Root route paths with host, but without restId. Has result transformation:
   * - `part1/part2/:paramName` -> `part1/part2`
   * - or `https://example.com/part1/part2/:paramName` -> `https://example.com/part1/part2`
   *
   * Array of paths revert sorted by length.
   */
  private rootRoutes: PartialRoutes;

  constructor(
    private apiMockService: ApiMockService,
    private apiMockConfig: ApiMockConfig,
    private xhrFactory: XhrFactory
  ) {
    try {
      this.apiMockConfig = new ApiMockConfig(apiMockConfig);
      this.init();
    } catch (e) {
      console.log(e);
    }
  }

  protected createHeaders(headers: { [index: string]: string }): HttpHeaders {
    return new HttpHeaders(headers);
  }

  protected passThruBackend(req: HttpRequest<any>) {
    try {
      return new HttpXhrBackend(this.xhrFactory).handle(req);
    } catch (ex) {
      ex.message = 'Cannot create passThru404 backend; ' + (ex.message || '');
      throw ex;
    }
  }

  protected init() {
    const routeGroups = this.apiMockService.getRouteGroups();
    this.routeGroups = this.checkRouteGroups(routeGroups);
    this.rootRoutes = this.getRootPaths(this.routeGroups);
  }

  protected clone(data: any) {
    return JSON.parse(JSON.stringify(data));
  }

  protected getRootPaths(routeGroups: ApiMockRouteGroup[]): PartialRoutes {
    const rootRoutes = routeGroups.map((route, index) => {
      // Transformation: `https://example.com/part1/part2/part3/:paramName` -> `https://example.com/part1/part2/part3`
      const part = route[0].path.split('/:')[0];
      const host = route[0].host || '';
      const path = host ? `${host}/${part}` : part;
      const length = path.length;
      return { path, length, index };
    });

    // Revert sorting by path length.
    return rootRoutes.sort((a, b) => b.length - a.length);
  }

  protected checkRouteGroups(routeGroups: ApiMockRouteGroup[]) {
    routeGroups.forEach(routeGroup => {
      routeGroup.forEach(route => {
        const path = route.path;
        const host = (route as any).host;
        if (host && !/^https?:\/\/[^\/]+$/.test(host)) {
          throw new Error(
            `ApiMockModule detect wrong host "${host}".
            Every host should match regexp "^https?:\/\/[^\/]+$",
            for example "https://example.com" (without a trailing slash)`
          );
        }
        if (!/^(?:[\w-]+\/)+:\w+$/.test(path)) {
          throw new Error(
            `ApiMockModule detect wrong route with path "${path}".
            Every path should match regexp "^([a-zA-Z0-9_-]+\/)+:[a-zA-Z0-9_]+$",
            for example "posts/:postId", where "postId" is field name of primary key of collection "posts"`
          );
        }
        if (typeof route.callbackData != 'function') {
          throw new Error(`Route callbackData with path "${path}" is not a function`);
        }
        if (typeof route.callbackResponse != 'function') {
          throw new Error(`Route callbackResponse with path "${path}" is not a function`);
        }
      });
    });

    const incomingRoutes = routeGroups.map(getRootPath);
    const existingRoutes = this.routeGroups.map(getRootPath);

    incomingRoutes.forEach(incomingRoute => {
      if (existingRoutes.includes(incomingRoute)) {
        throw new Error(`ApiMockModule detect duplicate route with path: "${incomingRoute}"`);
      }
      existingRoutes.push(incomingRoute);
    });

    return routeGroups;

    function getRootPath(route: ApiMockRouteRoot[]) {
      const host = route[0].host || '';
      const rootPath = route[0].path.split(':')[0];
      return `${host}/${rootPath}`;
    }
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const normalizedUrl = req.url.charAt(0) == '/' ? req.url.slice(1) : req.url;
    const routeGroupIndex = this.findRouteGroupIndex(this.rootRoutes, normalizedUrl);

    if (routeGroupIndex == -1 && this.apiMockConfig.passThruUnknownUrl) {
      return this.passThruBackend(req);
    } else if (routeGroupIndex == -1) {
      return this.make404Error(req);
    }

    let body: any;
    let params: GetDataParams;
    try {
      const dryMatch = this.getRouteDryMatch(normalizedUrl, this.routeGroups[routeGroupIndex]);
      if (dryMatch) {
        const { splitedUrl, splitedRoute, hasLastRestId, routes } = dryMatch;
        params = this.getReponseParams(splitedUrl, splitedRoute, hasLastRestId, routes);
        if (params) {
          body = this.getResponse(req.method as HttpMethod, params);
        }
      }
      if ((!dryMatch || !params) && this.apiMockConfig.passThruUnknownUrl) {
        return this.passThruBackend(req);
      }
    } catch (err) {
      console.log(err);
    }

    if (!body) {
      return this.make404Error(req);
    }

    if (this.apiMockConfig.showApiMockLog) {
      console.log(`%c${req.method} ${req.url}:`, 'color: green;', body);
    }

    const responseConfig = { status: 200, url: req.urlWithParams, body };
    return of(new HttpResponse<any>(responseConfig)).pipe(delay(this.apiMockConfig.delay));
  }

  protected make404Error(req: HttpRequest<any>) {
    if (this.apiMockConfig.showApiMockLog) {
      console.log(`%c${req.method} ${req.url}:`, 'color: brown;');
      console.log('Error 404: The page not found');
    }
    return throwError(
      new HttpErrorResponse({
        status: 404,
        url: req.urlWithParams,
        statusText: 'page not found',
        error: 'page not found',
      })
    );
  }

  /**
   * @param url URL with host.
   */
  protected findRouteGroupIndex(rootRoutes: PartialRoutes, url: string): number {
    for (const rootRoute of rootRoutes) {
      // We have `rootRoute.length + 1` to avoid such case:
      // (url) `posts-other/123` == (route) `posts/123`
      const partUrl = url.substr(0, rootRoute.length + 1);
      if (partUrl == rootRoute.path || partUrl == `${rootRoute.path}/`) {
        return rootRoute.index;
      }
    }

    return -1;
  }

  /**
   * @param normalizedUrl If we have URL without host, removed slash from the start.
   * @param routeGroup Route group from `this.routes` that matched to a URL by root path (`route[0].path`).
   */
  protected getRouteDryMatch(normalizedUrl: string, routeGroup: ApiMockRouteGroup): RouteDryMatch | void {
    /**
     * `['posts', '123', 'comments', '456']` -> 4 parts of a URL.
     */
    const splitedUrl = normalizedUrl.split('/');
    const countPartOfUrl = splitedUrl.length;
    let pathOfRoute = routeGroup[0].host || '';
    let hasLastRestId = true;
    const routes: ApiMockRouteGroup = [] as any;

    for (const route of routeGroup) {
      routes.push(route);
      pathOfRoute += pathOfRoute ? `/${route.path}` : route.path;
      const splitedRoute = pathOfRoute.split('/');
      /**
       * `['posts', ':postId', 'comments', ':commentId']` -> 4 parts of a route.
       */
      const countPartOfRoute = splitedRoute.length;

      if (countPartOfUrl > countPartOfRoute) {
        continue;
      } else if (countPartOfUrl < countPartOfRoute - 1) {
        // URL not matched to defined route path.
        break;
      } else if (countPartOfUrl == countPartOfRoute - 1) {
        // At the end of the URL removed `:restId`, e.g. `['posts', '123']` -> `['posts']`
        splitedRoute.pop();
        hasLastRestId = false;
      } else {
        // countPartOfUrl == countPartOfRoute
      }
      return { splitedUrl, splitedRoute, hasLastRestId, routes };
    }
  }

  /**
   * Taken result of dry matching an URL to a route,
   * so length of `splitedUrl` is always must to be equal to length of `splitedRoute`.
   *
   * This function:
   * - checks that concated `splitedUrl` is matched to concated `splitedRoute`;
   * - calls `callbackData()` from apropriate route;
   * - calls `callbackResponse()` from matched route and returns a result.
   *
   * @param splitedUrl Result spliting of an URL by slash.
   * @param splitedRoute Result spliting of concated a route paths by slash.
   * @param hasLastRestId Whethe URL has last restId, e.g. `posts/123` or `posts/123/comments/456`.
   * @param routes Part or full of routes group, that have path matched to an URL.
   */
  protected getReponseParams(
    splitedUrl: string[],
    splitedRoute: string[],
    hasLastRestId: boolean,
    routes: ApiMockRouteGroup
  ): GetDataParams {
    const params: GetDataParams = [];
    const partsOfUrl: string[] = [];
    const partsOfRoute: string[] = [];

    splitedRoute.forEach((part, i) => {
      if (part.charAt(0) == ':') {
        const restId = splitedUrl[i];
        const primaryKey = part.slice(1);
        /**
         * cacheKey should be without a restId at the end of URL, e.g. `posts` or `posts/123/comments`,
         * but not `posts/123` or `posts/123/comments/456`.
         */
        const cacheKey = splitedUrl.slice(0, i).join('/');
        const route = routes[params.length];
        params.push({ cacheKey, primaryKey, restId, route });
      } else {
        /**
         * Have result of transformations like this:
         * - `posts/123` -> `posts`
         * - or `posts/123/comments/456` -> `posts/comments`.
         */
        partsOfUrl.push(splitedUrl[i]);
        /**
         * Have result of transformations like this:
         * - `posts/:postId` -> `posts`
         * - or `posts/:postId/comments/:commentId` -> `posts/comments`.
         */
        partsOfRoute.push(part);
      }
    });

    const lastRoute = routes[routes.length - 1];
    if (!hasLastRestId) {
      params.push({ cacheKey: splitedUrl.join('/'), route: lastRoute });
    }

    if (partsOfRoute.join('/') == partsOfUrl.join('/')) {
      return params;
    }
  }

  protected getResponse(httpMethod: HttpMethod, params: GetDataParams) {
    const items: ObjectAny[] = [];
    let currentMockData: MockData;

    // Signature of a route path is matched to an URL.
    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (!this.cachedData[param.cacheKey]) {
        const writeableData = param.route.callbackData(httpMethod, items);
        this.cachedData[param.cacheKey].writeableData = writeableData;
        let onlyreadData: any[];
        if (param.route.propertiesForList) {
          onlyreadData = writeableData.map(d => pickAllPropertiesAsGetters(param.route.propertiesForList, d));
        } else {
          onlyreadData = writeableData.map(d => pickAllPropertiesAsGetters(d));
        }
        this.cachedData[param.cacheKey].onlyreadData = onlyreadData;
      }

      const parentsMockData = this.cachedData[param.cacheKey];
      if (i < params.length - 1) {
        const parent = parentsMockData.writeableData.find(item => {
          return item[param.primaryKey] && item[param.primaryKey].toString() == param.restId;
        });

        if (!parent) {
          if (this.apiMockConfig.showApiMockLog) {
            console.log(
              `%cParent not found with Primary Key "%s" and ID "%s", searched in:`,
              'color: red',
              param.primaryKey,
              param.restId,
              parentsMockData.writeableData
            );
          }
          return;
        }

        items.push(parent);
      } else {
        currentMockData = parentsMockData;
      }
    }

    const lastParam = params[params.length - 1];
    const lastRestId = lastParam.restId || '';
    const primaryKey = lastParam.primaryKey || '';
    let currentItem: any;

    if (lastRestId) {
      currentItem = currentMockData.writeableData.find(
        item => item[primaryKey] && item[primaryKey].toString() == lastRestId
      );
      if (!currentItem) {
        if (this.apiMockConfig.showApiMockLog) {
          console.log(
            `%cData not found with Primary Key "%s" and ID "%s", searched in:`,
            'color: red',
            primaryKey,
            lastRestId,
            currentMockData.writeableData
          );
        }
        return;
      }
    } else {
      currentItem = currentMockData.onlyreadData;
    }
    items.push(this.clone(currentItem));

    return lastParam.route.callbackResponse(httpMethod, items);
  }
}
