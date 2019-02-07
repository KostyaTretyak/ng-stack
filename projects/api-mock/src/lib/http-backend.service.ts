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

import {
  ApiMockConfig,
  ApiMockService,
  GetResponseReturns,
  MockData,
  MockDataCache,
  MockRouteGroup,
  MockRouteRoot,
  MockRootRoutes,
} from './types';

@Injectable()
export class HttpBackendService implements HttpBackend {
  private cachedData: MockDataCache = {};
  private routeGroups: MockRouteGroup[] = [];
  /**
   * Root route paths with host, but without restId. Has result transformation:
   * - `part1/part2/:paramName` -> `part1/part2`
   * - or `https://example.com/part1/part2/:paramName` -> `https://example.com/part1/part2`
   *
   * Array of paths revert sorted by length.
   */
  private rootRoutes: MockRootRoutes;

  constructor(
    private apiMockService: ApiMockService,
    private apiMockConfig: ApiMockConfig,
    private xhrFactory: XhrFactory
  ) {
    try {
      this.init();
    } catch (e) {
      console.log(e);
    }
  }

  protected createHeaders(headers: { [index: string]: string }): HttpHeaders {
    return new HttpHeaders(headers);
  }

  protected createPassThruBackend(req: HttpRequest<any>) {
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

  protected getRootPaths(routeGroups: MockRouteGroup[]): MockRootRoutes {
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

  protected checkRouteGroups(routeGroups: MockRouteGroup[]) {
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

    function getRootPath(route: MockRouteRoot[]) {
      const host = route[0].host || '';
      const rootPath = route[0].path.split(':')[0];
      return `${host}/${rootPath}`;
    }
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const normalizedUrl = req.url.charAt(0) == '/' ? req.url.slice(1) : req.url;
    const routeGroupIndex = this.findRouteGroupIndex(this.rootRoutes, normalizedUrl);
    let getResponseReturns: GetResponseReturns;

    if (routeGroupIndex != -1) {
      try {
        getResponseReturns = this.getResponses(normalizedUrl, this.routeGroups[routeGroupIndex]);
      } catch (err) {
        console.log(err);
      }
    }

    if (req.method !== 'GET' || routeGroupIndex == -1 || !getResponseReturns) {
      return this.createPassThruBackend(req);
    }

    const lastRestId: string = getResponseReturns.lastRestId;
    const primaryKey: string = getResponseReturns.primaryKey;
    const clonedCache: MockData = JSON.parse(JSON.stringify(getResponseReturns.mockData));
    const routeIndex: number = getResponseReturns.routeIndex;
    const parents: MockData[] = getResponseReturns.parents;
    const callbackResponse = this.routeGroups[routeGroupIndex][routeIndex].callbackResponse;
    const body = callbackResponse(clonedCache, primaryKey, lastRestId, parents);

    if (lastRestId && !body) {
      if (this.apiMockConfig.showFakeApiLog) {
        console.log(`%c${req.method} ${req.url}:`, 'color: red;');
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

    if (this.apiMockConfig.showFakeApiLog) {
      console.log(`%c${req.method} ${req.url}:`, 'color: red;');
      console.log(body);
    }

    const responseConfig = { status: 200, url: req.urlWithParams, body };
    return of(new HttpResponse<any>(responseConfig)).pipe(delay(this.apiMockConfig.delay));
  }

  /**
   * @param url URL with host.
   */
  protected findRouteGroupIndex(rootRoutes: MockRootRoutes, url: string): number {
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

  protected searchItemById(primaryKey: string, lastRestId: string): any {
    return;
  }

  /**
   * @param normalizedUrl If we have URL without host, removed slash from the start.
   * @param routeGroup Route group from `this.routes` that matched to a URL by root path (`route[0].path`).
   */
  protected getResponses(normalizedUrl: string, routeGroup: MockRouteGroup): GetResponseReturns {
    /**
     * `['posts', '123', 'comments', '456']` -> 4 parts of a URL.
     */
    const splitedUrl = normalizedUrl.split('/');
    const countPartOfUrl = splitedUrl.length;
    let pathOfRoute = routeGroup[0].host || '';
    let hasLastRestId = true;

    for (let i = 0; i < routeGroup.length; i++) {
      const route = routeGroup[i];
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

      let restId = '';
      let primaryKey = '';
      const params: Array<{ cacheKey: string; primaryKey?: string; restId?: string }> = [];

      /**
       * Have result of transformations like this:
       * - `posts/:postId` -> `posts`
       * - or `posts/:postId/comments/:commentId` -> `posts/comments`
       */
      const partsOfRoute: string[] = [];
      /**
       * Have result of transformations like this:
       * - `posts/123` -> `posts`
       * - or `posts/123/comments/456` -> `posts/comments`
       */
      const partsOfUrl: string[] = [];

      const parents: MockData[] = [];

      splitedRoute.forEach((part, j) => {
        if (part.charAt(0) == ':') {
          restId = splitedUrl[j];
          primaryKey = part.slice(1);
          /**
           * cacheKey should be without a restId, e.g. `posts` or `posts/123/comments`,
           * but not `posts/123` or `posts/123/comments/456`.
           */
          const cacheKey = splitedUrl.slice(0, j - 1).join('/');
          params.push({ cacheKey, primaryKey, restId });
        } else {
          partsOfRoute.push(part);
          partsOfUrl.push(splitedUrl[j]);
        }
      });

      if (!hasLastRestId) {
        const cacheKey = splitedUrl.join('/');
        params.push({ cacheKey });
      }

      if (partsOfRoute.join('/') == partsOfUrl.join('/')) {
        // Signature of the route path is matched the URL.
        params.forEach(param => {
          if (!this.cachedData[param.cacheKey]) {
            this.cachedData[param.cacheKey] = route.callbackData(restId, parents);
          }
          parents.push(this.cachedData[param.cacheKey]);
        });

        const mockData = parents.pop() || null;
        return { routeIndex: i, mockData, parents, primaryKey, lastRestId: restId };
      }
      break;
    }
  }
}
