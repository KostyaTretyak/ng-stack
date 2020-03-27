import 'zone.js/dist/zone-patch-rxjs-fake-async';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { HttpBackendService } from './http-backend.service';
import { ApiMockModule } from './api-mock.module';
import {
  ApiMockService,
  PartialRoutes,
  RouteDryMatch,
  ChainParam,
  ApiMockConfig,
  ObjectAny,
  ResponseOptions,
  ApiMockRootRoute,
  ApiMockRoute,
  MockData,
  CacheData,
} from './types';
import { Status } from './http-status-codes';

describe('HttpBackendService', () => {
  /**
   * Make all properties this class with public data modifier.
   */
  @Injectable()
  class MockHttpBackendService extends HttpBackendService {
    config: ApiMockConfig;
    cachedData: CacheData = {};

    checkRoute(route: ApiMockRoute, parentPath?: string) {
      return super.checkRoute(route, parentPath);
    }

    checkRootDuplicates(routes: ApiMockRoute[]) {
      return super.checkRootDuplicates(routes);
    }

    getRootPaths(routes: ApiMockRoute[]) {
      return super.getRootPaths(routes);
    }

    findRouteIndex(rootRoutes: PartialRoutes, url: string) {
      return super.findRouteIndex(rootRoutes, url);
    }

    getRouteDryMatch(normalizedUrl: string, routes: ApiMockRoute) {
      return super.getRouteDryMatch(normalizedUrl, routes);
    }

    getChainParams(routeDryMatch: RouteDryMatch) {
      return super.getChainParams(routeDryMatch);
    }

    sendResponse(req: HttpRequest<any>, chainParams: ChainParam[]) {
      return super.sendResponse(req, chainParams);
    }

    response(
      req: HttpRequest<any>,
      chainParam: ChainParam,
      parents: ObjectAny[],
      queryParams: Params,
      responseOptions: ResponseOptions = {} as any,
      items: ObjectAny[]
    ) {
      return super.response(req, chainParam, parents, queryParams, responseOptions, items);
    }

    callRequestMethod(req: HttpRequest<any>, chainParam: ChainParam, mockData: MockData): ResponseOptions {
      return super.callRequestMethod(req, chainParam, mockData);
    }

    genId(collection: ObjectAny[], primaryKey: string) {
      return super.genId(collection, primaryKey);
    }

    post(req: HttpRequest<any>, headers: HttpHeaders, chainParam: ChainParam, writeableData: ObjectAny[]) {
      return super.post(req, headers, chainParam, writeableData);
    }

    transformHeaders(headers: HttpHeaders) {
      return super.transformHeaders(headers);
    }

    logRequest(req: HttpRequest<any>) {
      return super.logRequest(req);
    }

    bindReadonlyData(chainParam: ChainParam, writeableData: ObjectAny[]) {
      return super.bindReadonlyData(chainParam, writeableData);
    }
  }

  class MyApiMockService implements ApiMockService {
    getRoutes() {
      return [];
    }
  }

  let httpBackendService: MockHttpBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApiMockModule.forRoot(MyApiMockService), RouterTestingModule],
      providers: [MockHttpBackendService],
    });

    httpBackendService = TestBed.inject(MockHttpBackendService);

    // Merge with default configs.
    httpBackendService.config = new ApiMockConfig(httpBackendService.config);
  });

  describe('checkRouts()', () => {
    it('multi level route paths, without primary keys', () => {
      const route: ApiMockRoute = { path: 'api/posts', children: [{ path: 'comments' }] };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/detected wrong multi level route/);
    });

    it('multi level route paths, without route.callbackData', () => {
      const route: ApiMockRoute = { path: 'api/posts/:postId', children: [{ path: 'comments' }] };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/detected wrong multi level route/);
    });

    it('with callbackData, but without a primary key', () => {
      const route: ApiMockRoute = { path: 'api/posts', callbackData: () => [] };
      const regexpMsg = /If you have route.callbackData, you should/;
      expect(() => httpBackendService.checkRoute(route)).toThrowError(regexpMsg);
    });

    it('with a primary key, but without callbackData', () => {
      const route: ApiMockRoute = { path: 'api/pre-account/:login' };
      const regexpMsg = /If you have route.callbackData, you should/;
      expect(() => httpBackendService.checkRoute(route)).toThrowError(regexpMsg);
    });

    const routesNotToThrow: [string, ApiMockRootRoute][] = [
      ['path with empty path', { path: '' }],
      ['path without slashes', { path: 'api' }],
      ['path with slashes and without primary keys', { path: 'api/sessions' }],
      ['with callbackData and with a primary key', { path: 'api/posts/:postId', callbackData: () => [] }],
      ['http protocol', { host: 'http://example.com', path: 'api' }],
      ['secure protocol', { host: 'https://example.com', path: 'api/sessions' }],
      ['ua host', { host: 'https://example.com.ua', path: 'api' }],
      ['cyrillic host', { host: 'https://приклад.укр', path: 'api' }],
      ['xn host', { host: 'https://xn--80aikifvh.xn--j1amh', path: 'api' }],
      [
        'callbackResponse as a function',
        {
          path: 'api/posts/:postId',
          callbackData: () => [],
          callbackResponse: () => [],
        },
      ],
      [
        'callbackResponse as a function, without path primary key',
        { path: 'api/pre-account/login', callbackResponse: () => [] },
      ],
    ];

    routesNotToThrow.forEach(([msg, route]) => {
      it(msg, () => {
        expect(() => httpBackendService.checkRoute(route)).not.toThrow();
      });
    });

    it('multi level route paths, with route.callbackData and a primary key', () => {
      const route: ApiMockRoute = {
        path: 'api/posts/:postId',
        callbackData: () => [],
        children: [{ path: 'comments' }],
      };
      expect(() => httpBackendService.checkRoute(route)).not.toThrow();
    });

    it('route path with trailing slash', () => {
      const route: ApiMockRoute = { path: 'api/sessions/' };
      const regexpMsg = /route.path should not to have trailing slash/;
      expect(() => httpBackendService.checkRoute(route)).toThrowError(regexpMsg);
    });

    it('callbackData as an object', () => {
      const route: ApiMockRoute = { callbackData: {} as any, path: 'api/posts/:postId' };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/is not a function/);
    });

    it('callbackResponse as an object', () => {
      const route: ApiMockRoute = { callbackResponse: {} as any, callbackData: () => [], path: 'api/posts/:postId' };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/is not a function/);
    });

    it('wrong host', () => {
      const route: ApiMockRootRoute = { host: 'fake host', path: 'api' };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/detected wrong host/);
    });

    it('wrong host without HTTP protocol', () => {
      const route: ApiMockRootRoute = { host: 'example.com', path: 'api' };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/detected wrong host/);
    });

    it('wrong host with slash at the end', () => {
      const route: ApiMockRootRoute = { host: 'http://example.com/', path: 'api' };
      expect(() => httpBackendService.checkRoute(route)).toThrowError(/detected wrong host/);
    });
  });

  const routesWithoutHost: ApiMockRoute[] = [
    { path: 'one/:primaryId' },
    { path: 'one/two/:primaryId' },
    { path: 'one/two/three/four/five/six/seven/:primaryId' },
    { path: 'one/two/three/four/five/six/:primaryId' },
    { path: 'one/two/three/:primaryId' },
    { path: 'one/two/three/four/:primaryId' },
    { path: 'one/two/three/four/five/:primaryId' },
    { path: 'api/login' },
  ];

  const routesWithMixHost: ApiMockRootRoute[] = [
    { host: 'https://example3.com', path: 'one/two/three/four/five/six/:primaryId' },
    { host: 'https://example2.com', path: 'one/two/three/four/five/six/:primaryId' },
    { host: 'https://example1.com', path: 'one/two/:primaryId' },
    { host: 'https://example1.com', path: 'one/two/three/four/five/six/:primaryId' },
    { host: 'https://example2.com', path: 'one/two/:primaryId' },
    { host: 'https://example4.com', path: 'one/two/three/four/:primaryId' },
    { host: 'https://example4.com', path: 'one/two/:primaryId' },
    { host: 'https://example2.com', path: 'one/two/three/four/:primaryId' },
    { host: 'https://example3.com', path: 'one/two/three/four/:primaryId' },
    { host: 'https://example1.com', path: 'one/two/three/four/:primaryId' },
    { host: 'https://example3.com', path: 'one/two/:primaryId' },
    { host: 'https://example4.com', path: 'api/login' },
  ];

  describe('getRootPaths()', () => {
    it('param: route.path only', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithoutHost);
      expect(rootRoutes[0].path).toBe('one/two/three/four/five/six/seven');
      expect(rootRoutes[0].index).toEqual(2);
      expect(rootRoutes[1].path).toBe('one/two/three/four/five/six');
      expect(rootRoutes[1].index).toEqual(3);
      expect(rootRoutes[2].path).toBe('one/two/three/four/five');
      expect(rootRoutes[2].index).toEqual(6);
      expect(rootRoutes[3].path).toBe('one/two/three/four');
      expect(rootRoutes[3].index).toEqual(5);
      expect(rootRoutes[4].path).toBe('one/two/three');
      expect(rootRoutes[4].index).toEqual(4);
      expect(rootRoutes[5].path).toBe('api/login');
      expect(rootRoutes[5].index).toEqual(7);
      expect(rootRoutes[6].path).toBe('one/two');
      expect(rootRoutes[6].index).toEqual(1);
      expect(rootRoutes[7].path).toBe('one');
      expect(rootRoutes[7].index).toEqual(0);
    });

    it('param: route.path and route.host', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithMixHost);
      expect(rootRoutes[0].path).toBe('https://example3.com/one/two/three/four/five/six');
      expect(rootRoutes[0].index).toEqual(0);
      expect(rootRoutes[2].path).toBe('https://example1.com/one/two/three/four/five/six');
      expect(rootRoutes[2].index).toEqual(3);
      expect(rootRoutes[3].path).toBe('https://example4.com/one/two/three/four');
      expect(rootRoutes[3].index).toEqual(5);
      expect(rootRoutes[5].path).toBe('https://example3.com/one/two/three/four');
      expect(rootRoutes[5].index).toEqual(8);
    });
  });

  describe('findRoutesIndex()', () => {
    it('param: routes without a host', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithoutHost);
      let routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one/two/three/four/primaryId');
      expect(routeIndex).toEqual(5);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one/two/primaryId');
      expect(routeIndex).toEqual(1);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one-other/primaryId');
      expect(routeIndex).toEqual(-1);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one/two/three/four/five/six/seven/primaryId');
      expect(routeIndex).toEqual(2);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one/two/three/four/five/six/primaryId');
      expect(routeIndex).toEqual(3);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'one/two/three/four/five/primaryId');
      expect(routeIndex).toEqual(6);
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, 'api/login');
      expect(routeIndex).toEqual(7);
    });

    it('param: routes with a host', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithMixHost);
      let url = 'https://example2.com/one/two/primaryId';
      let routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(4);
      url = 'https://example4.com/one/two/three/four/primaryId';
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(5);
      url = 'https://example4.com/one/two/primaryId';
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(6);
      url = 'https://example1.com/one/two/primaryId';
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(2);
      url = 'https://example1.com/one/two-other/primaryId';
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(-1);
      url = 'https://example4.com/api/login';
      routeIndex = httpBackendService.findRouteIndex(rootRoutes, url);
      expect(routeIndex).toEqual(11);
    });
  });

  describe('transformHeaders()', () => {
    it(`object`, () => {
      const obj = { 'Content-Type': 'application/json' };
      const headers = new HttpHeaders(obj);
      const result = httpBackendService.transformHeaders(headers);
      expect(result).toEqual(obj);
    });

    it(`array`, () => {
      const obj = { other: ['one', 'two'] };
      const headers = new HttpHeaders(obj);
      const result = httpBackendService.transformHeaders(headers);
      expect(result).toEqual(obj);
    });
  });

  describe('logRequest()', () => {
    it(`queryParams only`, () => {
      const req = new HttpRequest<any>('GET', 'any/url/here?one=1&two=2&arr=3&arr=4');
      const result = httpBackendService.logRequest(req);
      expect(result).toEqual({ queryParams: { one: '1', two: '2', arr: ['3', '4'] } });
    });

    it(`headers only`, () => {
      const req = new HttpRequest<any>('GET', 'any/url/here', { headers: new HttpHeaders({ one: '1', two: '2' }) });
      const result = httpBackendService.logRequest(req);
      expect(result).toEqual({ headers: { one: '1', two: '2' } });
    });

    it(`body only`, () => {
      const req = new HttpRequest<any>('POST', 'any/url/here', { one: '1', two: '2' });
      const result = httpBackendService.logRequest(req);
      expect(result).toEqual({ body: { one: '1', two: '2' } });
    });

    it(`headers and queryParams only`, () => {
      const headers = { headers: new HttpHeaders({ one: '1', two: '2' }) };
      const req = new HttpRequest<any>('GET', 'any/url/here?one=1&two=2&arr=3&arr=4', headers);
      const result = httpBackendService.logRequest(req);
      expect(result).toEqual({ headers: { one: '1', two: '2' }, queryParams: { one: '1', two: '2', arr: ['3', '4'] } });
    });
  });

  describe('getRouteDryMatch()', () => {
    let dryMatch: RouteDryMatch[] | void;
    let url: string;
    let routePath: string;
    let route: ApiMockRootRoute;
    let children: ApiMockRootRoute[];

    beforeEach(() => {
      children = [
        { path: 'comments/:commentId', children: [{ path: 'one/two/:otherId' }] },
        { path: 'views/:userId' },
        { path: 'five', children: [{ path: 'six' }, { path: 'six/seven' }] },
        { path: 'six' },
      ];
    });

    function deleteChildren(routes: any[]) {
      return routes.map(r => {
        delete r.children;
        return r;
      });
    }

    describe('one level of route.path nesting', () => {
      it('url with primary ID', () => {
        url = 'one/two/three-other/123';
        routePath = 'one/two/three/:primaryId';
        route = { path: routePath, children: [{ path: 'level-two/one/two' }] };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(dryMatch && dryMatch.length).toBe(1);
        expect(dryMatch[0].splitedRoute.join('/')).toBe(routePath);
        expect(dryMatch[0].hasLastRestId).toBe(true);
        expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([{ path: routePath }]);
      });

      it('url without primary ID', () => {
        url = 'one/two/three-other';
        routePath = 'one/two/three/:primaryId';
        route = { path: routePath, children: [{ path: 'level-two/one/two' }] };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(dryMatch[0].splitedRoute.join('/')).toBe('one/two/three');
        expect(dryMatch && dryMatch.length).toBe(1);
        expect(dryMatch[0].hasLastRestId).toBeUndefined();
        expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([{ path: routePath }]);
      });

      it('should not match a long url to a short route', () => {
        url = 'one/two/three-other/four/123';
        routePath = 'one/two/three/:primaryId';
        dryMatch = httpBackendService.getRouteDryMatch(url, { path: routePath });
        expect(!!dryMatch).toBeFalsy();
      });

      it('should not match a short url to a long route', () => {
        url = 'one/two/three-other/123';
        routePath = 'one/two/three/five/six/:primaryId';
        dryMatch = httpBackendService.getRouteDryMatch(url, { path: routePath });
        expect(!!dryMatch).toBeFalsy();
      });

      it('url with host and with primary ID', () => {
        url = 'https://example.com/one/two-other/123';
        route = {
          host: 'https://example.com',
          path: 'one/two/:primaryId',
          children: [{ path: 'level-two/one/two' }],
        };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(dryMatch && dryMatch.length).toBe(1);
        expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/one/two/:primaryId');
        expect(dryMatch[0].hasLastRestId).toBe(true);
        expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { host: 'https://example.com', path: 'one/two/:primaryId' },
        ]);
      });

      it('url with host and without primary ID', () => {
        url = 'https://example.com/one/two-other';
        route = {
          host: 'https://example.com',
          path: 'one/two/:primaryId',
          children: [{ path: 'level-two/one/two' }],
        };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(dryMatch && dryMatch.length).toBe(1);
        expect(dryMatch[0].hasLastRestId).toBeUndefined();
        expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
        expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/one/two');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { host: 'https://example.com', path: 'one/two/:primaryId' },
        ]);
      });
    });

    describe('multi level of route.path nesting', () => {
      it('url with primary ID', () => {
        url = 'api/posts/123/comments-other/456';
        route = { path: 'api/posts/:postId', children };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch && dryMatch.length).toBe(3);
        expect(dryMatch[0].splitedRoute.join('/')).toBe('api/posts/:postId/comments/:commentId');
        expect(dryMatch[0].hasLastRestId).toBe(true);
        expect(dryMatch[0].lastPrimaryKey).toBe('commentId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);

        expect(dryMatch[1].splitedRoute.join('/')).toBe('api/posts/:postId/views/:userId');
        expect(dryMatch[1].hasLastRestId).toBe(true);
        expect(dryMatch[1].lastPrimaryKey).toBe('userId');
        expect(deleteChildren(dryMatch[1].routes)).toEqual([{ path: 'api/posts/:postId' }, { path: 'views/:userId' }]);

        expect(dryMatch[2].splitedRoute.join('/')).toBe('api/posts/:postId/five/six');
        expect(dryMatch[2].hasLastRestId).toBeUndefined();
        expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[2].routes)).toEqual([
          { path: 'api/posts/:postId' },
          { path: 'five' },
          { path: 'six' },
        ]);
      });

      it('url without primary ID', () => {
        url = 'api/posts/123/comments-other';
        route = { path: 'api/posts/:postId', children };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(dryMatch[0].splitedRoute.join('/')).toBe('api/posts/:postId/comments');
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch && dryMatch.length).toBe(4);
        expect(dryMatch[0].hasLastRestId).toBeUndefined();
        expect(dryMatch[0].lastPrimaryKey).toBe('commentId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);

        expect(dryMatch[1].splitedRoute.join('/')).toBe('api/posts/:postId/views');
        expect(dryMatch[1].hasLastRestId).toBeUndefined();
        expect(dryMatch[1].lastPrimaryKey).toBe('userId');
        expect(deleteChildren(dryMatch[1].routes)).toEqual([{ path: 'api/posts/:postId' }, { path: 'views/:userId' }]);

        expect(dryMatch[2].splitedRoute.join('/')).toBe('api/posts/:postId/five');
        expect(dryMatch[2].hasLastRestId).toBeUndefined();
        expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[2].routes)).toEqual([{ path: 'api/posts/:postId' }, { path: 'five' }]);

        expect(dryMatch[3].splitedRoute.join('/')).toBe('api/posts/:postId/six');
        expect(dryMatch[3].hasLastRestId).toBeUndefined();
        expect(dryMatch[3].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[3].routes)).toEqual([{ path: 'api/posts/:postId' }, { path: 'six' }]);
      });

      it('should not match a long url to a short route', () => {
        url = 'one/two/three/four/five/six/seven';
        route = { path: 'api/posts/:postId', children: [{ path: 'comments/:commentId' }] };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(!!dryMatch).toBeFalsy();
      });

      it('should not match a short url to a long route', () => {
        url = 'one';
        route = { path: 'api/posts/:postId', children: [{ path: 'comments/:commentId' }] };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(!!dryMatch).toBeFalsy();
      });

      it('url with host and with primary ID', () => {
        url = 'https://example.com/api/posts/123/comments-other/456';
        route = { host: 'https://example.com', path: 'api/posts/:postId', children };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch && dryMatch.length).toBe(3);
        expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/comments/:commentId');
        expect(dryMatch[0].hasLastRestId).toBe(true);
        expect(dryMatch[0].lastPrimaryKey).toBe('commentId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);

        expect(dryMatch[1].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/views/:userId');
        expect(dryMatch[1].hasLastRestId).toBe(true);
        expect(dryMatch[1].lastPrimaryKey).toBe('userId');
        expect(deleteChildren(dryMatch[1].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'views/:userId' },
        ]);

        expect(dryMatch[1].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/views/:userId');
        expect(dryMatch[1].hasLastRestId).toBe(true);
        expect(dryMatch[1].lastPrimaryKey).toBe('userId');
        expect(deleteChildren(dryMatch[1].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'views/:userId' },
        ]);

        expect(dryMatch[2].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/five/six');
        expect(dryMatch[2].hasLastRestId).toBeUndefined();
        expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[2].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'five' },
          { path: 'six' },
        ]);
      });

      it('url with host and without primary ID', () => {
        url = 'https://example.com/api/posts/123/comments-other';
        route = { host: 'https://example.com', path: 'api/posts/:postId', children };
        dryMatch = httpBackendService.getRouteDryMatch(url, route);
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch && dryMatch.length).toBe(4);

        expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/comments');
        expect(dryMatch[0].hasLastRestId).toBeUndefined();
        expect(dryMatch[0].lastPrimaryKey).toBe('commentId');
        expect(deleteChildren(dryMatch[0].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);

        expect(dryMatch[1].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/views');
        expect(dryMatch[1].hasLastRestId).toBeUndefined();
        expect(dryMatch[1].lastPrimaryKey).toBe('userId');
        expect(deleteChildren(dryMatch[1].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'views/:userId' },
        ]);

        expect(dryMatch[2].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/five');
        expect(dryMatch[2].hasLastRestId).toBeUndefined();
        expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[2].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'five' },
        ]);

        expect(dryMatch[3].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/six');
        expect(dryMatch[3].hasLastRestId).toBeUndefined();
        expect(dryMatch[3].lastPrimaryKey).toBeUndefined();
        expect(deleteChildren(dryMatch[3].routes)).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'six' },
        ]);
      });
    });
  });

  describe('getChainParams()', () => {
    describe('URL not matched to a route path', () => {
      const badArgs = [
        // Route without primaryKey
        ['api/login', 'api/login-other'],
        ['api/login', 'api-other/login'],
        ['api/login-other', 'api/login'],
        ['api-other/login', 'api/login'],

        // URL with restId
        ['api/posts/123', 'api/posts-other/:postId'],
        ['api/posts/123', 'api-other/posts/:postId'],
        ['api/posts-other/123', 'api/posts/:postId'],
        ['api-other/posts/123', 'api/posts/:postId'],

        // Multi level nesting of route paths
        ['api/posts/123/comments/456', 'api/posts/:postId/comments-other/:commentId'],
        ['api/posts/123/comments/456', 'api-other/posts/:postId/comments/:commentId'],
        ['api/posts/123/comments-other/456', 'api/posts/:postId/comments/:commentId'],
        ['api-other/posts/123/comments/456', 'api/posts/:postId/comments/:commentId'],

        // URL without restId
        ['api/posts', 'api/posts-other/:postId'],
        ['api/posts', 'api-other/posts/:postId'],
        ['api/posts-other', 'api/posts/:postId'],
        ['api-other/posts', 'api/posts/:postId'],
      ];

      badArgs.forEach(([url, routePath], i) => {
        it(`"${url}" and "${routePath}"`, () => {
          const splitedUrl = url.split('/');
          const hasLastRestId = i >= 0 && i < 12 ? true : false;
          const splitedRoute = hasLastRestId ? routePath.split('/') : routePath.split('/').slice(0, -1);
          const routes = [{ path: routePath }] as ApiMockRoute[];

          const routeDryMatch: RouteDryMatch = {
            splitedUrl,
            splitedRoute,
            hasLastRestId,
            routes,
          };

          const params = httpBackendService.getChainParams(routeDryMatch);
          expect(!!params).toBeFalsy('getChainParams() not returns params');
        });
      });
    });

    describe('One level nesting of route paths', () => {
      it(`URL with restId`, () => {
        const url = 'api/posts/123';
        const routePath = 'api/posts/:postId';
        const routeDryMatch: RouteDryMatch = {
          splitedUrl: url.split('/'),
          splitedRoute: routePath.split('/'),
          hasLastRestId: true,
          lastPrimaryKey: 'anyKey',
          routes: [{ path: routePath }],
        };

        const params = httpBackendService.getChainParams(routeDryMatch) as ChainParam[];
        expect(!!params).toBeTruthy('getChainParams() returns params');
        expect(params.length).toEqual(1);
        const param = params[0];
        expect(param.cacheKey).toBe('api/posts');
        expect(param.primaryKey).toBe('postId');
        expect(param.restId).toBe('123');
        expect(param.route).toEqual({ path: routePath });
      });

      it(`URL without restId`, () => {
        const url = 'api/posts';
        const routePath = 'api/posts';
        const routeDryMatch: RouteDryMatch = {
          splitedUrl: url.split('/'),
          splitedRoute: routePath.split('/'),
          hasLastRestId: false,
          lastPrimaryKey: 'postId',
          routes: [{ path: 'api/posts/:postId' }],
        };

        const params = httpBackendService.getChainParams(routeDryMatch) as ChainParam[];
        expect(!!params).toBeTruthy('getChainParams() returns params');
        expect(params.length).toEqual(1);
        const param = params[0];
        expect(param.cacheKey).toBe('api/posts');
        expect(param.primaryKey).toBe('postId');
        expect(param.restId).toBeUndefined();
        expect(param.route).toEqual({ path: 'api/posts/:postId' });
      });

      it(`Route without primaryKey`, () => {
        const url = 'api/login';
        const routePath = 'api/login';
        const routeDryMatch: RouteDryMatch = {
          splitedUrl: url.split('/'),
          splitedRoute: routePath.split('/'),
          hasLastRestId: false,
          lastPrimaryKey: undefined,
          routes: [{ path: routePath }],
        };

        const params = httpBackendService.getChainParams(routeDryMatch) as ChainParam[];
        expect(!!params).toBeTruthy('getChainParams() returns params');
        expect(params.length).toEqual(1);
        const param = params[0];
        expect(param.cacheKey).toBe(url);
        expect(param.primaryKey).toBeUndefined();
        expect(param.restId).toBeUndefined();
        expect(param.route).toEqual({ path: routePath });
      });
    });

    describe('Multi level nesting of route paths', () => {
      it(`URL with restId`, () => {
        const url = 'api/posts/123/comments/456';
        const routePath = 'api/posts/:postId/comments/:commentId';
        const routeDryMatch: RouteDryMatch = {
          splitedUrl: url.split('/'),
          splitedRoute: routePath.split('/'),
          hasLastRestId: true,
          lastPrimaryKey: 'anyKey',
          routes: [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }],
        };

        const params = httpBackendService.getChainParams(routeDryMatch) as ChainParam[];
        expect(!!params).toBeTruthy('getChainParams() returns params');
        expect(params.length).toEqual(2);
        const param1 = params[0];
        expect(param1.cacheKey).toBe('api/posts');
        expect(param1.primaryKey).toBe('postId');
        expect(param1.restId).toBe('123');
        expect(param1.route).toEqual({ path: 'api/posts/:postId' });
        const param2 = params[1];
        expect(param2.cacheKey).toBe('api/posts/123/comments');
        expect(param2.primaryKey).toBe('commentId');
        expect(param2.restId).toBe('456');
        expect(param2.route).toEqual({ path: 'comments/:commentId' });
      });

      it(`URL without restId`, () => {
        const url = 'api/posts/123/comments';
        const routePath = 'api/posts/:postId/comments';
        const routeDryMatch: RouteDryMatch = {
          splitedUrl: url.split('/'),
          splitedRoute: routePath.split('/'),
          hasLastRestId: false,
          lastPrimaryKey: 'commentId',
          routes: [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }],
        };

        const params = httpBackendService.getChainParams(routeDryMatch) as ChainParam[];
        expect(!!params).toBeTruthy('getChainParams() returns params');
        expect(params.length).toEqual(2);
        const param1 = params[0];
        expect(param1.cacheKey).toBe('api/posts');
        expect(param1.primaryKey).toBe('postId');
        expect(param1.restId).toBe('123');
        expect(param1.route).toEqual({ path: 'api/posts/:postId' });
        const param2 = params[1];
        expect(param2.cacheKey).toBe('api/posts/123/comments');
        expect(param2.primaryKey).toBe('commentId');
        expect(param2.restId).toBeUndefined();
        expect(param2.route).toEqual({ path: 'comments/:commentId' });
      });
    });
  });

  describe('bindReadonlyData()', () => {
    it(`body of readonlyData as getter`, () => {
      const cacheKey = 'api/posts';
      const chainParam: ChainParam = {
        cacheKey,
        primaryKey: 'any-primary-key',
        route: { path: 'any-path' },
      };

      interface Example {
        id: number;
        body: string;
      }
      const writeableData: Example[] = [
        { id: 1, body: 'content for id 1' },
        { id: 2, body: 'content for id 2' },
        { id: 3, body: 'content for id 3' },
      ];

      httpBackendService.cachedData = { [cacheKey]: { writeableData, readonlyData: [] } };
      httpBackendService.bindReadonlyData(chainParam, writeableData);
      const readonlyData = httpBackendService.cachedData[cacheKey].readonlyData as Example[];
      expect(readonlyData[1]).toEqual({ id: 2, body: 'content for id 2' });
      writeableData[1].body = 'changed content';
      expect(readonlyData[1]).toEqual({ id: 2, body: 'changed content' });
    });
  });

  describe('cacheGetData()', () => {});
  describe('getParents()', () => {});

  describe('sendResponse()', () => {
    it('should returns result of calling callbackData()', fakeAsync(() => {
      const callbackData = () => [{ some: 1 }];
      const callbackResponse = clonedItems => clonedItems;
      const chainParam: ChainParam[] = [
        { cacheKey: 'api/posts', primaryKey: '', route: { path: '', callbackData, callbackResponse } },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, chainParam);
      expect(res instanceof Observable).toBe(true);
      let result: HttpResponse<any> = null;
      res.subscribe(r => (result = r));
      expect(result).toBeNull();

      tick(httpBackendService.config.delay);

      expect(result instanceof HttpResponse).toBe(true);
      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body).toEqual(callbackData());
    }));

    it('should returns searched item with given primaryKey and restId inside result of calling callbackData()', fakeAsync(() => {
      const callbackData = () => [{ somePrimaryKey: 23, some: 1 }];
      const callbackResponse = clonedItems => clonedItems;
      const chainParam: ChainParam[] = [
        {
          cacheKey: 'api/posts',
          primaryKey: 'somePrimaryKey',
          restId: '23',
          route: { path: '', callbackData, callbackResponse },
        },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, chainParam);
      expect(res instanceof Observable).toBe(true);
      let result: HttpResponse<any> = null;
      res.subscribe(r => (result = r));
      expect(result).toBeNull();

      tick(httpBackendService.config.delay);

      expect(result instanceof HttpResponse).toBe(true);
      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body).toEqual(callbackData());
    }));

    it('should returns undefined when search inside result of calling callbackData()', fakeAsync(() => {
      const callbackData = () => [{ some: 1 }];
      const callbackResponse = clonedItems => clonedItems;
      const chainParam: ChainParam[] = [
        {
          cacheKey: 'api/posts',
          primaryKey: 'somePrimaryKey',
          restId: 'someRestId',
          route: { path: '', callbackData, callbackResponse },
        },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, chainParam);
      expect(res instanceof Observable).toBe(true);
      let result: HttpResponse<any> = null;
      res.subscribe(
        r => fail,
        err => (result = err)
      );
      expect(result instanceof HttpErrorResponse).toBe(true);
      expect(result.status).toBe(Status.NOT_FOUND);
    }));
  });

  describe('response()', () => {});

  describe('changeItem()', () => {});

  describe('genId()', () => {
    it('should returns 1 as new id', () => {
      const newId = httpBackendService.genId([], 'id');
      expect(newId).toBe(1);
    });

    it('should ignore string id and returns 1 as new id', () => {
      const collection = [{ id: 'one' }];
      const newId = httpBackendService.genId(collection, 'id');
      expect(newId).toBe(1);
    });

    it('should returns 10 as new id', () => {
      const collection = [{ id: 9 }];
      const newId = httpBackendService.genId(collection, 'id');
      expect(newId).toBe(10);
    });

    it('should ignore string id and returns 100 as new id', () => {
      const collection = [{ id: 'one' }, { id: 99 }];
      const newId = httpBackendService.genId(collection, 'id');
      expect(newId).toBe(100);
    });
  });

  describe('post()', () => {
    it('case 1: reqBody == null', () => {
      const req = new HttpRequest<any>('POST', 'any/url/here', null);
      const update: ResponseOptions = httpBackendService.post(
        req,
        new HttpHeaders(),
        { primaryKey: 'postId', route: {} as any, cacheKey: '' },
        []
      );
      expect(update instanceof HttpErrorResponse).toBe(false, 'update not Errored');
      const { status, body: resBody, headers } = update;
      expect(status).toBe(Status.CREATED);
      expect(resBody).toEqual({ postId: 1 });
      expect(headers.has('Location')).toBe(true, 'has header "Location"');
      expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
    });

    it(`case 2: reqBody have some object`, () => {
      const reqBody = { other: 'some value here' };
      const req = new HttpRequest<any>('POST', 'any/url/here', reqBody);
      const update: ResponseOptions = httpBackendService.post(
        req,
        new HttpHeaders(),
        { primaryKey: 'postId', route: {} as any, cacheKey: '' },
        []
      );
      expect(update instanceof HttpErrorResponse).toBe(false, 'update not Errored');
      const { status, body: resBody, headers } = update;
      expect(status).toBe(Status.CREATED);
      expect(resBody).toEqual({ postId: 1, ...reqBody });
      expect(headers.has('Location')).toBe(true, 'has header "Location"');
      expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
    });

    it(`case 3: POST on URI with restId`, () => {
      const reqBody = { postId: 123, other: 'some value here' };
      const req = new HttpRequest<any>('POST', 'any/url/here', reqBody);
      const reqHeaders: HttpHeaders = new HttpHeaders();
      const chainParam: ChainParam = { primaryKey: 'postId', restId: '456', route: {} as any, cacheKey: '' };
      const writeableData: ObjectAny[] = [{ postId: 123 }];
      const update = httpBackendService.post(req, reqHeaders, chainParam, writeableData);

      expect(update instanceof HttpErrorResponse).toBe(true, 'update Errored');
      const { status, headers } = update;
      expect(status).toBe(Status.METHOD_NOT_ALLOWED);
      expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
      expect(headers.has('Location')).toBe(false, 'has not header "Location"');
    });

    it(`case 4: reqBody updates existing ID`, () => {
      const reqBody = { postId: 123, other: 'some value here' };
      const req = new HttpRequest<any>('POST', 'any/url/here', reqBody);
      const reqHeaders: HttpHeaders = new HttpHeaders();
      const chainParam: ChainParam = { primaryKey: 'postId', route: {} as any, cacheKey: '' };
      const writeableData: ObjectAny[] = [{ postId: 123 }];
      const update: ResponseOptions = httpBackendService.post(req, reqHeaders, chainParam, writeableData);

      expect(update instanceof HttpErrorResponse).toBe(false, 'update not Errored');
      const { status, body: resBody, headers } = update;
      expect(status).toBe(Status.NO_CONTENT);
      expect(resBody).toBeUndefined('should resBody to be undefined');
      expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
    });
  });
});
