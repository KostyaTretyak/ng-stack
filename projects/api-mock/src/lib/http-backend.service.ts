import { Injectable } from '@angular/core';
import { Router, Params, NavigationStart, NavigationEnd } from '@angular/router';
import {
  HttpBackend,
  HttpErrorResponse,
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpXhrBackend,
  XhrFactory,
  HttpHeaders,
} from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';

import { pickAllPropertiesAsGetters } from './pick-properties';
import {
  ApiMockConfig,
  ApiMockService,
  CacheData,
  ApiMockRouteGroup,
  ApiMockRouteRoot,
  PartialRoutes,
  RouteDryMatch,
  ResponseParam,
  HttpMethod,
  ObjectAny,
} from './types';
import { Status, getStatusText } from './http-status-codes';

@Injectable()
export class HttpBackendService implements HttpBackend {
  private isInited: boolean;
  private cachedData: CacheData = {};
  private routeGroups: ApiMockRouteGroup[] = [];
  /**
   * Root route paths with host, but without restId. Has result of transformation:
   * - `part1/part2/:paramName` -> `part1/part2`
   * - or `https://example.com/part1/part2/:paramName` -> `https://example.com/part1/part2`
   *
   * Array of paths revert sorted by length.
   */
  private rootRoutes: PartialRoutes;

  constructor(
    private apiMockService: ApiMockService,
    private apiMockConfig: ApiMockConfig,
    private xhrFactory: XhrFactory,
    private router: Router
  ) {}

  protected init() {
    const routeGroups = this.apiMockService.getRouteGroups();
    this.routeGroups = this.checkRouteGroups(routeGroups);
    this.rootRoutes = this.getRootPaths(this.routeGroups);

    let isLoadedApp = false;
    if (this.apiMockConfig.showLog && this.apiMockConfig.clearPrevLog) {
      this.router.events.subscribe(event => {
        if (isLoadedApp && event instanceof NavigationStart) {
          console.clear();
        } else if (event instanceof NavigationEnd) {
          isLoadedApp = true;
        }
      });
    }
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    try {
      return this.handleReq(req);
    } catch (err) {
      this.logErrorResponse(req, err);
      return throwError(this.makeInternalError(req.urlWithParams, err));
    }
  }

  /**
   * Handles requests.
   */
  protected handleReq(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (!this.isInited) {
      // Merge with default configs.
      this.apiMockConfig = new ApiMockConfig(this.apiMockConfig);

      this.init();
      this.isInited = true;
    }

    const normalizedUrl = req.url.charAt(0) == '/' ? req.url.slice(1) : req.url;
    const routeGroupIndex = this.findRouteGroupIndex(this.rootRoutes, normalizedUrl);

    if (routeGroupIndex == -1) {
      return this.send404Error(req);
    }

    const routeDryMatch = this.getRouteDryMatch(normalizedUrl, this.routeGroups[routeGroupIndex]);
    let responseParams: ResponseParam[] | void;

    if (routeDryMatch) {
      const { splitedUrl, splitedRoute, hasLastRestId, routes } = routeDryMatch;
      responseParams = this.getResponseParams(splitedUrl, splitedRoute, hasLastRestId, routes);
      if (responseParams) {
        return this.sendResponse(req, responseParams);
      }
    }
    return this.send404Error(req);
  }

  protected send404Error(req: HttpRequest<any>) {
    if (this.apiMockConfig.passThruUnknownUrl) {
      return new HttpXhrBackend(this.xhrFactory).handle(req);
    }
    return throwError(this.make404Error(req.urlWithParams));
  }

  protected logSuccessResponse(req: HttpRequest<any>, queryParams: Params, body: any) {
    if (!this.apiMockConfig.showLog) {
      return;
    }

    console.log(`%creq: ${req.method} ${req.url}:`, 'color: green;', {
      body: req.body,
      queryParams,
      headers: this.getHeaders(req),
    });

    console.log(`%cres:`, 'color: blue;', body);
  }

  protected logErrorResponse(req: HttpRequest<any>, ...consoleArgs: any[]) {
    if (!this.apiMockConfig.showLog) {
      return;
    }

    let queryParams: ObjectAny = {};
    let headers: ObjectAny = {};
    try {
      queryParams = this.router.parseUrl(req.urlWithParams).queryParams;
      headers = this.getHeaders(req);
    } catch {}

    console.log(`%creq: ${req.method} ${req.url}:`, 'color: green;', {
      body: req.body,
      queryParams,
      headers,
    });
    console.log('%cres:', 'color: brown;', ...consoleArgs);
  }

  protected getHeaders(req: HttpRequest<any>) {
    return req.headers.keys().map(header => {
      let values: string | string[] = req.headers.getAll(header);
      values = values.length == 1 ? values[0] : values;
      return { [header]: values };
    });
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

  protected make404Error(urlWithParams: string) {
    return new HttpErrorResponse({
      status: Status.NOT_FOUND,
      url: urlWithParams,
      statusText: getStatusText(Status.NOT_FOUND),
      error: 'page not found',
    });
  }

  protected makeInternalError(url: string, error: Error) {
    return new HttpErrorResponse({
      url,
      status: Status.INTERNAL_SERVER_ERROR,
      statusText: getStatusText(Status.INTERNAL_SERVER_ERROR),
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      error: error.message,
    });
  }

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
   * This method should accepts an URL that matched to a route path by a root segment, for example:
   * - `root-segment/segment` and `root-segment/:routeId`
   * - `root-segment/segment` and `root-segment/other/:routeId`.
   *
   * Then it splites them by `/` and compares length of `splitedUrl` with length of `splitedRoute` and if
   * they are equal, returns that route with some metadata.
   *
   * @param normalizedUrl If we have URL without host, here should be url with removed slash from the start.
   * @param routeGroup Route group from `this.routes` that matched to a URL by root path (`route[0].path`).
   */
  protected getRouteDryMatch(normalizedUrl: string, routeGroup: ApiMockRouteGroup): RouteDryMatch | void {
    const splitedUrl = normalizedUrl.split('/');
    /**
     * `['posts', '123', 'comments', '456']` -> 4 parts of a URL.
     */
    const countPartOfUrl = splitedUrl.length;
    const routes: ApiMockRouteGroup = [] as any;
    let pathOfRoute = routeGroup[0].host || '';
    let hasLastRestId = true;

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
   * Takes result of dry matching an URL to a route path,
   * so length of `splitedUrl` is always must to be equal to length of `splitedRoute`.
   *
   * This method checks that concated `splitedUrl` is matched to concated `splitedRoute`;
   *
   * @param splitedUrl Result spliting of an URL by slash.
   * @param splitedRoute Result spliting of concated a route paths by slash.
   * @param hasLastRestId Whethe URL has last restId, e.g. `posts/123` or `posts/123/comments/456`.
   * @param routes Part or full of routes group, that have path matched to an URL.
   */
  protected getResponseParams(
    splitedUrl: string[],
    splitedRoute: string[],
    hasLastRestId: boolean,
    routes: ApiMockRouteGroup
  ): ResponseParam[] | void {
    const responseParams: ResponseParam[] = [];
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
        const route = routes[responseParams.length];
        responseParams.push({ cacheKey, primaryKey, restId, route });
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

    if (!hasLastRestId) {
      const lastRoute = routes[routes.length - 1];
      responseParams.push({ cacheKey: splitedUrl.join('/'), route: lastRoute });
    }

    if (partsOfRoute.join('/') == partsOfUrl.join('/')) {
      // Signature of a route path is matched to an URL.
      return responseParams;
    }
  }

  /**
   * This function:
   * - calls `callbackData()` from apropriate route;
   * - calls `callbackResponse()` from matched route and returns a result.
   */
  protected sendResponse(req: HttpRequest<any>, responseParams: ResponseParam[]) {
    const queryParams = this.router.parseUrl(req.urlWithParams).queryParams;
    const httpMethod = req.method as HttpMethod;
    const parents: ObjectAny[] = [];

    for (let i = 0; i < responseParams.length; i++) {
      const isLastIteration = i + 1 == responseParams.length;
      const param = responseParams[i];
      if (!this.cachedData[param.cacheKey]) {
        const writeableData = param.route.callbackData([], param.restId, 'GET', parents, queryParams, req.body);
        this.cachedData[param.cacheKey] = { writeableData, readonlyData: [] };
        this.setReadonlyData(param, writeableData);
      }

      const mockData = this.cachedData[param.cacheKey];
      if (httpMethod != 'GET') {
        const writeableData = param.route.callbackData(
          mockData.writeableData,
          param.restId,
          httpMethod,
          parents,
          queryParams,
          req.body
        );

        mockData.writeableData = writeableData;
        this.setReadonlyData(param, writeableData);
      }

      if (param.restId) {
        const primaryKey = param.primaryKey;
        const restId = param.restId;
        const item = mockData.writeableData.find(obj => obj[primaryKey] && obj[primaryKey].toString() == restId);

        if (!item) {
          if (this.apiMockConfig.showLog) {
            const message = `Item with primary key "${primaryKey}" and ID "${restId}" not found, searched in:`;
            this.logErrorResponse(req, message, mockData.writeableData);
          }

          return throwError(this.make404Error(req.urlWithParams));
        }

        parents.push(isLastIteration ? [item] : item);
      } else {
        // No restId at the end of an URL.
        parents.push(mockData.readonlyData);
      }
    }

    const items = parents.pop() as ObjectAny[];
    const lastParam = responseParams[responseParams.length - 1];
    const lastRestId = lastParam.restId || '';

    const clonedParents = this.clone(parents);
    const clonedItems = this.clone(items);

    /**
     * Response or a body of response.
     */
    const resOrBody = lastParam.route.callbackResponse(
      clonedItems,
      lastRestId,
      httpMethod,
      clonedParents,
      queryParams,
      req.body
    );

    let observable: Observable<HttpResponse<any>>;

    if (resOrBody instanceof Observable) {
      observable = resOrBody;
    } else {
      observable = of(new HttpResponse<any>({ status: Status.OK, url: req.urlWithParams, body: resOrBody }));
    }

    return observable.pipe(
      delay(this.apiMockConfig.delay),
      tap(res => {
        this.logSuccessResponse(req, queryParams, res.body);
      }),
      catchError(err => {
        this.logErrorResponse(req, err);
        return throwError(err);
      })
    );
  }

  /**
   * Setting readonly data to `this.cachedData[cacheKey].readonlyData`
   */
  protected setReadonlyData(responseParam: ResponseParam, writeableData: ObjectAny[]) {
    let readonlyData: ObjectAny[];
    const pickObj = responseParam.route.propertiesForList;
    if (pickObj) {
      readonlyData = writeableData.map(d => pickAllPropertiesAsGetters(this.clone(pickObj), d));
    } else {
      readonlyData = writeableData.map(d => pickAllPropertiesAsGetters(d));
    }
    this.cachedData[responseParam.cacheKey].readonlyData = readonlyData;
  }
}
