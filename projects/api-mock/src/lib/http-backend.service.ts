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
import { delay } from 'rxjs/operators';

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
  HttpResOpts,
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
    private config: ApiMockConfig,
    private xhrFactory: XhrFactory,
    private router: Router
  ) {}

  protected init() {
    const routeGroups = this.apiMockService.getRouteGroups();
    this.routeGroups = this.checkRouteGroups(routeGroups);
    this.rootRoutes = this.getRootPaths(this.routeGroups);

    let isLoadedApp = false;
    if (this.config.showLog && this.config.clearPrevLog) {
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
      this.logErrorResponse(req, 'Error 500: Internal Server Error', err);
      const internalErr = this.makeError(req, Status.INTERNAL_SERVER_ERROR, err.message);
      return throwError(internalErr);
    }
  }

  /**
   * Handles requests.
   */
  protected handleReq(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    if (!this.isInited) {
      // Merge with default configs.
      this.config = new ApiMockConfig(this.config);

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
    if (this.config.passThruUnknownUrl) {
      return new HttpXhrBackend(this.xhrFactory).handle(req);
    }

    const errMsg = 'Error 404: Not found; page not found';
    this.logErrorResponse(req, errMsg);
    const err = this.makeError(req, Status.NOT_FOUND, errMsg);

    return throwError(err);
  }

  protected logSuccessResponse(req: HttpRequest<any>, queryParams: Params, body: any) {
    if (!this.config.showLog) {
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
    if (!this.config.showLog) {
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
            for example "posts/:postId", where "postId" is a field name of primary key of collection "posts"`
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

  protected makeError(req: HttpRequest<any>, status: Status, errMsg: string) {
    return new HttpErrorResponse({
      url: req.urlWithParams,
      status,
      statusText: getStatusText(status),
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      error: errMsg,
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
  protected sendResponse(req: HttpRequest<any>, responseParams: ResponseParam[]): Observable<HttpResponse<any>> {
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

      if (isLastIteration && httpMethod != 'HEAD' && httpMethod != 'GET' && httpMethod != 'OPTIONS') {
        const httpResOpts = this.changeItem(req, param, mockData.writeableData);
        if (httpResOpts instanceof HttpErrorResponse) {
          return throwError(httpResOpts);
        }

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

        return this.getObservableResponse(req, responseParams, parents, queryParams, httpResOpts);
      }

      if (param.restId) {
        const primaryKey = param.primaryKey;
        const restId = param.restId;
        const item = mockData.writeableData.find(obj => obj[primaryKey] && obj[primaryKey] == restId);

        if (!item) {
          const message = `Error 404: Not found; item.${primaryKey}=${restId} not found, searched in:`;
          this.logErrorResponse(req, message, mockData.writeableData);

          const err = this.makeError(req, Status.NOT_FOUND, 'page not found');
          return throwError(err);
        }

        parents.push(isLastIteration ? [item] : item);
      } else {
        // No restId at the end of an URL.
        parents.push(mockData.readonlyData);
      }
    }

    return this.getObservableResponse(req, responseParams, parents, queryParams);
  }

  protected changeItem(req: HttpRequest<any>, responseParam: ResponseParam, writeableData: ObjectAny[]): HttpResOpts {
    const httpMethod = req.method as HttpMethod;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    switch (httpMethod) {
      case 'POST':
        return this.post(req, headers, responseParam, writeableData);
      case 'PUT':
        return this.put(req, headers, responseParam, writeableData);
      case 'PATCH':
        return this.patch(req, headers, responseParam, writeableData);
      case 'DELETE':
        return this.delete(req, headers, responseParam, writeableData);
      default:
        const errMsg = 'Error 405: Method not allowed';
        this.logErrorResponse(req, errMsg);
        return this.makeError(req, Status.METHOD_NOT_ALLOWED, errMsg);
    }
  }

  protected post(
    req: HttpRequest<any>,
    headers: HttpHeaders,
    responseParam: ResponseParam,
    writeableData: ObjectAny[]
  ): HttpResOpts {
    const item: ObjectAny = this.clone(req.body || {});
    const { primaryKey, restId } = responseParam;
    const resourceUrl = restId
      ? req.url
          .split('/')
          .slice(0, -1)
          .join('/')
      : req.url;

    if (restId != undefined) {
      const errMsg = `Error 405: Method not allowed; POST forbidder on this URI, try on "${resourceUrl}"`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.METHOD_NOT_ALLOWED, errMsg);
    }

    if (item[primaryKey] == undefined) {
      item[primaryKey] = this.genId(writeableData, primaryKey);
    }

    const id = item[primaryKey];
    const itemIndex = writeableData.findIndex((itm: any) => itm[primaryKey] == id);

    if (itemIndex == -1) {
      writeableData.push(item);
      const clonedHeaders = headers.set('Location', `${resourceUrl}/${id}`);
      return { headers: clonedHeaders, body: item, status: Status.CREATED };
    } else if (this.config.postUpdate409) {
      const errMsg = `Error 409: Conflict; item.${primaryKey}=${id} exists and may not be updated with POST; use PUT instead.`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.CONFLICT, errMsg);
    } else {
      writeableData[itemIndex] = item;
      return this.config.postReturn204
        ? { headers, status: Status.NO_CONTENT } // successful; no content
        : { headers, body: item, status: Status.OK }; // successful; return entity
    }
  }

  protected put(
    req: HttpRequest<any>,
    headers: HttpHeaders,
    responseParam: ResponseParam,
    writeableData: ObjectAny[]
  ): HttpResOpts {
    const item: ObjectAny = this.clone(req.body || {});
    const { primaryKey, restId } = responseParam;

    if (restId == undefined) {
      const errMsg = `Error 405: Method not allowed; PUT forbidder on this URI, try on "${req.url}/:${primaryKey}"`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.METHOD_NOT_ALLOWED, errMsg);
    }

    if (item[primaryKey] == undefined) {
      const errMsg = `Error 404: Not found; missing ${primaryKey} field`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.NOT_FOUND, errMsg);
    }

    if (restId != undefined && restId != item[primaryKey]) {
      const errMsg =
        `Error 400: Bad request; request with resource ID ` +
        `"${restId}" does not match item.${primaryKey}=${item[primaryKey]}`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.BAD_REQUEST, errMsg);
    }

    const itemIndex = writeableData.findIndex((itm: any) => itm[primaryKey] == restId);

    if (itemIndex != -1) {
      writeableData[itemIndex] = item;
      return this.config.putReturn204
        ? { headers, status: Status.NO_CONTENT } // successful; no content
        : { headers, body: item, status: Status.OK }; // successful; return entity
    } else if (this.config.putNotFound404) {
      const errMsg =
        `Error 404: Not found; item.${primaryKey}=${restId} ` +
        `not found and may not be created with PUT; use POST instead.`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.NOT_FOUND, errMsg);
    } else {
      // create new item for id that not found
      writeableData.push(item);
      return { headers, body: item, status: Status.CREATED };
    }
  }

  protected patch(
    req: HttpRequest<any>,
    headers: HttpHeaders,
    responseParam: ResponseParam,
    writeableData: ObjectAny[]
  ): HttpResOpts {
    const item: ObjectAny = this.clone(req.body || {});
    const { primaryKey, restId } = responseParam;

    if (restId == undefined) {
      const errMsg = `Error 405: Method not allowed; PATCH forbidder on this URI, try on "${req.url}/:${primaryKey}"`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.METHOD_NOT_ALLOWED, errMsg);
    }

    const itemIndex = writeableData.findIndex((itm: any) => itm[primaryKey] == restId);

    if (itemIndex == -1) {
      let errMsg = 'Error 404: Not found; ';
      errMsg += restId ? `item.${primaryKey}=${restId} not found` : `missing "${primaryKey}" field`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.NOT_FOUND, errMsg);
    }

    if (item[primaryKey] != undefined && restId != item[primaryKey]) {
      const errMsg =
        `Error 400: Bad request; ` +
        `request with resource ID "${restId}" does not match item.${primaryKey}=${item[primaryKey]}`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.BAD_REQUEST, errMsg);
    }

    Object.assign(writeableData[itemIndex], item);
    return { headers, status: Status.NO_CONTENT };
  }

  protected delete(
    req: HttpRequest<any>,
    headers: HttpHeaders,
    responseParam: ResponseParam,
    writeableData: ObjectAny[]
  ): HttpResOpts {
    const { primaryKey, restId: id } = responseParam;
    let itemIndex = -1;
    if (id != undefined) {
      itemIndex = writeableData.findIndex((itemLocal: any) => itemLocal[primaryKey] == id);
    }

    if (id == undefined || (itemIndex == -1 && this.config.deleteNotFound404)) {
      let errMsg = 'Error 404: Not found; ';
      errMsg += id ? `item.${primaryKey}=${id} not found` : `missing "${primaryKey}" field`;
      this.logErrorResponse(req, errMsg);
      return this.makeError(req, Status.NOT_FOUND, errMsg);
    }

    if (itemIndex != -1) {
      writeableData.splice(itemIndex, 1);
    }

    return { headers, status: Status.NO_CONTENT };
  }

  /**
   * @param resBody Response body.
   */
  protected getObservableResponse(
    req: HttpRequest<any>,
    responseParams: ResponseParam[],
    parents: ObjectAny[],
    queryParams: Params,
    httpResOpts?: HttpResOpts
  ): Observable<HttpResponse<any>> {
    const lastParam = responseParams[responseParams.length - 1];
    const lastRestId = lastParam.restId || '';
    const clonedParents = this.clone(parents);
    const httpMethod = req.method as HttpMethod;

    let clonedItems: ObjectAny[];
    if (httpMethod == 'GET') {
      clonedItems = this.clone(parents.pop());
    } else {
      clonedItems = [httpResOpts.body];
    }

    /**
     * Response error or value of a body for response.
     */
    const errOrBody = lastParam.route.callbackResponse(
      clonedItems,
      lastRestId,
      httpMethod,
      clonedParents,
      queryParams,
      req.body
    );

    let observable: Observable<HttpResponse<any>>;

    if (errOrBody instanceof HttpResponse) {
      const errMsg =
        'Error 500: Internal Server Error; forbidden to returns instance of HttpResponse from the callbackResponse';
      this.logErrorResponse(req, errMsg);
      const internalErr = this.makeError(req, Status.INTERNAL_SERVER_ERROR, errMsg);
      observable = throwError(internalErr);
    } else if (errOrBody instanceof HttpErrorResponse) {
      this.logErrorResponse(req, errOrBody);
      observable = throwError(errOrBody);
    } else {
      this.logSuccessResponse(req, queryParams, errOrBody);
      if (httpMethod == 'GET') {
        observable = of(new HttpResponse<any>({ status: Status.OK, url: req.urlWithParams, body: errOrBody }));
      } else {
        httpResOpts.body = errOrBody;
        observable = of(new HttpResponse(httpResOpts));
      }
    }

    return observable.pipe(delay(this.config.delay));
  }

  /**
   * Generator of the next available id for item in this collection.
   *
   * @param collection - collection of items
   * @param primaryKey - a primaryKey of the collection
   */
  protected genId(collection: ObjectAny[], primaryKey: string): number {
    let maxId: number;

    maxId = collection.reduce((prevId: number, item: ObjectAny) => {
      const currId = typeof item[primaryKey] == 'number' ? item[primaryKey] : prevId;
      return Math.max(prevId, currId);
    }, 0);

    return maxId + 1;
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
