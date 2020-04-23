import 'zone.js/dist/zone-patch-rxjs-fake-async';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';

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
  ApiMockDataCallback,
  ApiMockResponseCallback,
} from './types';
import { Status } from './http-status-codes';
import { catchError } from 'rxjs/operators';

describe('HttpBackendService', () => {
  describe('methods', () => {
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

      getResponse(
        req: HttpRequest<any>,
        chainParam: ChainParam,
        parents: ObjectAny[],
        queryParams: Params,
        responseOptions: ResponseOptions = {} as any
      ) {
        return super.getResponse(req, chainParam, parents, queryParams, responseOptions);
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

      putOrPatch(req: HttpRequest<any>, headers: HttpHeaders, chainParam: ChainParam, writeableData: ObjectAny[]) {
        return super.putOrPatch(req, headers, chainParam, writeableData);
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

      cacheDataWithGetMethod(
        chainParam: ChainParam,
        parents?: ObjectAny[],
        queryParams?: Params,
        body?: any,
        headers?: HttpHeaders
      ) {
        return super.cacheDataWithGetMethod(chainParam, parents, queryParams, body, headers);
      }

      getParents(req: HttpRequest<any>, chainParams: ChainParam[]) {
        return super.getParents(req, chainParams);
      }
    }

    class MyApiMockService implements ApiMockService {
      getRoutes() {
        return [];
      }
    }

    let service: MockHttpBackendService;
    function resetMock() {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, ApiMockModule.forRoot(MyApiMockService), RouterTestingModule],
        providers: [MockHttpBackendService],
      });

      service = TestBed.inject(MockHttpBackendService);

      // Merge with default configs.
      service.config = new ApiMockConfig(service.config);
      service.config.showLog = false;
    }

    beforeEach(resetMock);

    afterEach(() => {
      localStorage.clear();
    });

    describe('checkRouts()', () => {
      it('nested routes, without primary keys', () => {
        const route: ApiMockRoute = { path: 'api/posts', children: [{ path: 'comments' }] };
        expect(() => service.checkRoute(route)).toThrowError(/detected wrong nested routes/);
      });

      it('nested routes route paths, without route.dataCallback', () => {
        const route: ApiMockRoute = { path: 'api/posts/:postId', children: [{ path: 'comments' }] };
        expect(() => service.checkRoute(route)).toThrowError(/detected wrong nested routes/);
      });

      it('with dataCallback, but without a primary key', () => {
        const route: ApiMockRoute = { path: 'api/posts', dataCallback: () => [] };
        const regexpMsg = /If you have route.dataCallback, you should/;
        expect(() => service.checkRoute(route)).toThrowError(regexpMsg);
      });

      it('with a primary key, but without dataCallback', () => {
        const route: ApiMockRoute = { path: 'api/pre-account/:login' };
        const regexpMsg = /If you have route.dataCallback, you should/;
        expect(() => service.checkRoute(route)).toThrowError(regexpMsg);
      });

      const routesNotToThrow: [string, ApiMockRootRoute][] = [
        ['path with empty path', { path: '' }],
        ['path without slashes', { path: 'api' }],
        ['path with slashes and without primary keys', { path: 'api/sessions' }],
        ['with dataCallback and with a primary key', { path: 'api/posts/:postId', dataCallback: () => [] }],
        ['http protocol', { host: 'http://example.com', path: 'api' }],
        ['port', { host: 'http://localhost:4200', path: 'api' }],
        ['secure protocol', { host: 'https://example.com', path: 'api/sessions' }],
        ['ua host', { host: 'https://example.com.ua', path: 'api' }],
        ['cyrillic host', { host: 'https://приклад.укр', path: 'api' }],
        ['xn host', { host: 'https://xn--80aikifvh.xn--j1amh', path: 'api' }],
        [
          'responseCallback as a function',
          {
            path: 'api/posts/:postId',
            dataCallback: () => [],
            responseCallback: () => [],
          },
        ],
        [
          'responseCallback as a function, without path primary key',
          { path: 'api/pre-account/login', responseCallback: () => [] },
        ],
      ];

      routesNotToThrow.forEach(([msg, route]) => {
        it(msg, () => {
          expect(() => service.checkRoute(route)).not.toThrow();
        });
      });

      it('nested routes, with route.dataCallback and a primary key', () => {
        const route: ApiMockRoute = {
          path: 'api/posts/:postId',
          dataCallback: () => [],
          children: [{ path: 'comments' }],
        };
        expect(() => service.checkRoute(route)).not.toThrow();
      });

      it('route path with trailing slash', () => {
        const route: ApiMockRoute = { path: 'api/sessions/' };
        const regexpMsg = /route.path should not to have trailing slash/;
        expect(() => service.checkRoute(route)).toThrowError(regexpMsg);
      });

      it('dataCallback as an object', () => {
        const route: ApiMockRoute = { dataCallback: {} as any, path: 'api/posts/:postId' };
        expect(() => service.checkRoute(route)).toThrowError(/is not a function/);
      });

      it('responseCallback as an object', () => {
        const route: ApiMockRoute = { responseCallback: {} as any, dataCallback: () => [], path: 'api/posts/:postId' };
        expect(() => service.checkRoute(route)).toThrowError(/is not a function/);
      });

      it('wrong host with slash at the end', () => {
        const route: ApiMockRootRoute = { host: 'http://example.com/', path: 'api' };
        expect(() => service.checkRoute(route)).toThrowError(/detected wrong host/);
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
        const rootRoutes = service.getRootPaths(routesWithoutHost);
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
        const rootRoutes = service.getRootPaths(routesWithMixHost);
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
        const rootRoutes = service.getRootPaths(routesWithoutHost);
        let routeIndex = service.findRouteIndex(rootRoutes, 'one/two/three/four/primaryId');
        expect(routeIndex).toEqual(5);
        routeIndex = service.findRouteIndex(rootRoutes, 'one/two/primaryId');
        expect(routeIndex).toEqual(1);
        routeIndex = service.findRouteIndex(rootRoutes, 'one-other/primaryId');
        expect(routeIndex).toEqual(-1);
        routeIndex = service.findRouteIndex(rootRoutes, 'one/two/three/four/five/six/seven/primaryId');
        expect(routeIndex).toEqual(2);
        routeIndex = service.findRouteIndex(rootRoutes, 'one/two/three/four/five/six/primaryId');
        expect(routeIndex).toEqual(3);
        routeIndex = service.findRouteIndex(rootRoutes, 'one/two/three/four/five/primaryId');
        expect(routeIndex).toEqual(6);
        routeIndex = service.findRouteIndex(rootRoutes, 'api/login');
        expect(routeIndex).toEqual(7);
      });

      it('param: routes with a host', () => {
        const rootRoutes = service.getRootPaths(routesWithMixHost);
        let url = 'https://example2.com/one/two/primaryId';
        let routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(4);
        url = 'https://example4.com/one/two/three/four/primaryId';
        routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(5);
        url = 'https://example4.com/one/two/primaryId';
        routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(6);
        url = 'https://example1.com/one/two/primaryId';
        routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(2);
        url = 'https://example1.com/one/two-other/primaryId';
        routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(-1);
        url = 'https://example4.com/api/login';
        routeIndex = service.findRouteIndex(rootRoutes, url);
        expect(routeIndex).toEqual(11);
      });
    });

    describe('transformHeaders()', () => {
      it(`object`, () => {
        const obj = { 'Content-Type': 'application/json' };
        const headers = new HttpHeaders(obj);
        const result = service.transformHeaders(headers);
        expect(result).toEqual(obj);
      });

      it(`array`, () => {
        const obj = { other: ['one', 'two'] };
        const headers = new HttpHeaders(obj);
        const result = service.transformHeaders(headers);
        expect(result).toEqual(obj);
      });
    });

    describe('logRequest()', () => {
      it(`queryParams only`, () => {
        const params = new HttpParams({ fromObject: { one: '1', two: '2', arr: ['3', '4'] } });
        const req = new HttpRequest<any>('GET', 'any/url/here', { params });
        const result = service.logRequest(req);
        expect(result).toEqual({ queryParams: { one: '1', two: '2', arr: ['3', '4'] }, body: null });
      });

      it(`headers only`, () => {
        const req = new HttpRequest<any>('GET', 'any/url/here', { headers: new HttpHeaders({ one: '1', two: '2' }) });
        const result = service.logRequest(req);
        expect(result).toEqual({ headers: { one: '1', two: '2' }, body: null });
      });

      it(`body only`, () => {
        const req = new HttpRequest<any>('POST', 'any/url/here', { one: '1', two: '2' });
        const result = service.logRequest(req);
        expect(result).toEqual({ body: { one: '1', two: '2' } });
      });

      it(`headers and queryParams only`, () => {
        const params = new HttpParams({ fromObject: { one: '1', two: '2', arr: ['3', '4'] } });
        const headers = new HttpHeaders({ one: '1', two: '2' });
        const config = { headers, params };
        const req = new HttpRequest<any>('GET', 'any/url/here', config);
        const result = service.logRequest(req);
        expect(result).toEqual({
          headers: { one: '1', two: '2' },
          queryParams: { one: '1', two: '2', arr: ['3', '4'] },
          body: null,
        });
      });
    });

    describe('getRouteDryMatch()', () => {
      let url: string;
      let route: ApiMockRootRoute;

      function deleteChildren(routes: any[]) {
        return routes.map((r) => {
          delete r.children;
          return r;
        });
      }

      describe('one level of route.path nesting', () => {
        it('url with primary key', () => {
          url = 'one/two/three-other/123';
          const rootPath = 'one/two/three/:primaryId';
          route = { path: rootPath, children: [{ path: 'level-two/one/two' }] };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(1);
          expect(dryMatch[0].splitedRoute.join('/')).toBe(rootPath);
          expect(dryMatch[0].hasLastRestId).toBe(true);
          expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
          expect(deleteChildren(dryMatch[0].routes)).toEqual([{ path: rootPath }]);
        });

        it('url without primary key', () => {
          url = 'one/two/three-other';
          const rootPath = 'one/two/three/:primaryId';
          route = { path: rootPath, children: [{ path: 'level-two/one/two' }] };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(1);
          expect(dryMatch[0].splitedRoute.join('/')).toBe('one/two/three');
          expect(dryMatch[0].hasLastRestId).toBeUndefined();
          expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
          expect(deleteChildren(dryMatch[0].routes)).toEqual([{ path: rootPath }]);
        });

        it('should not match a long url to a short route', () => {
          url = 'one/two/three-other/four/123';
          const rootPath = 'one/two/three/:primaryId';
          const dryMatch = service.getRouteDryMatch(url, { path: rootPath });
          expect(dryMatch.length).toBe(0);
        });

        it('should not match a short url to a long route', () => {
          url = 'one/two/three-other/123';
          const rootPath = 'one/two/three/five/six/:primaryId';
          const dryMatch = service.getRouteDryMatch(url, { path: rootPath });
          expect(dryMatch.length).toBe(0);
        });

        it('url with host and with primary key', () => {
          url = 'https://example.com/one/two-other/123';
          route = {
            host: 'https://example.com',
            path: 'one/two/:primaryId',
            children: [{ path: 'level-two/one/two' }],
          };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(1);
          expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/one/two/:primaryId');
          expect(dryMatch[0].hasLastRestId).toBe(true);
          expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
          expect(deleteChildren(dryMatch[0].routes)).toEqual([
            { host: 'https://example.com', path: 'one/two/:primaryId' },
          ]);
        });

        it('url with host and without primary key', () => {
          url = 'https://example.com/one/two-other';
          route = {
            host: 'https://example.com',
            path: 'one/two/:primaryId',
            children: [{ path: 'level-two/one/two' }],
          };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(1);
          expect(dryMatch[0].hasLastRestId).toBeUndefined();
          expect(dryMatch[0].lastPrimaryKey).toBe('primaryId');
          expect(dryMatch[0].splitedRoute.join('/')).toBe('https://example.com/one/two');
          expect(deleteChildren(dryMatch[0].routes)).toEqual([
            { host: 'https://example.com', path: 'one/two/:primaryId' },
          ]);
        });
      });

      describe('nested routes', () => {
        let children: ApiMockRootRoute[];

        // This is required because deleteChildren() works mutable.
        beforeEach(() => {
          children = [
            { path: 'comments/:commentId', children: [{ path: 'one/two/:otherId' }] },
            { path: 'views/:userId' },
            { path: 'five', children: [{ path: 'six' }, { path: 'six/seven' }] },
            { path: 'six' },
          ];
        });

        it('url with primary key', () => {
          url = 'api/posts/123/comments-other/456';
          route = { path: 'api/posts/:postId', children };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(3);
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
          expect(deleteChildren(dryMatch[1].routes)).toEqual([
            { path: 'api/posts/:postId' },
            { path: 'views/:userId' },
          ]);

          expect(dryMatch[2].splitedRoute.join('/')).toBe('api/posts/:postId/five/six');
          expect(dryMatch[2].hasLastRestId).toBeUndefined();
          expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
          expect(deleteChildren(dryMatch[2].routes)).toEqual([
            { path: 'api/posts/:postId' },
            { path: 'five' },
            { path: 'six' },
          ]);
        });

        it('url without primary key', () => {
          url = 'api/posts/123/comments-other';
          route = { path: 'api/posts/:postId', children };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(4);
          expect(dryMatch[0].splitedRoute.join('/')).toBe('api/posts/:postId/comments');
          expect(dryMatch[0].hasLastRestId).toBeUndefined();
          expect(dryMatch[0].lastPrimaryKey).toBe('commentId');
          expect(deleteChildren(dryMatch[0].routes)).toEqual([
            { path: 'api/posts/:postId' },
            { path: 'comments/:commentId' },
          ]);

          expect(dryMatch[1].splitedRoute.join('/')).toBe('api/posts/:postId/views');
          expect(dryMatch[1].hasLastRestId).toBeUndefined();
          expect(dryMatch[1].lastPrimaryKey).toBe('userId');
          expect(deleteChildren(dryMatch[1].routes)).toEqual([
            { path: 'api/posts/:postId' },
            { path: 'views/:userId' },
          ]);

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
          url = 'api/one/two/three/four/five/six/seven';
          route = { path: 'api/posts/:postId', children: [{ path: 'comments/:commentId' }] };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBeFalsy();
        });

        it('should not match a short url to a long route', () => {
          url = 'api';
          route = { path: 'api/posts/:postId', children: [{ path: 'comments/:commentId' }] };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBeFalsy();
        });

        it('url with host and with primary key', () => {
          url = 'https://example.com/api/posts/123/comments-other/456';
          route = { host: 'https://example.com', path: 'api/posts/:postId', children };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(3);
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

          expect(dryMatch[2].splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/five/six');
          expect(dryMatch[2].hasLastRestId).toBeUndefined();
          expect(dryMatch[2].lastPrimaryKey).toBeUndefined();
          expect(deleteChildren(dryMatch[2].routes)).toEqual([
            { host: 'https://example.com', path: 'api/posts/:postId' },
            { path: 'five' },
            { path: 'six' },
          ]);
        });

        it('url with host and without primary key', () => {
          url = 'https://example.com/api/posts/123/comments-other';
          route = { host: 'https://example.com', path: 'api/posts/:postId', children };
          const dryMatch = service.getRouteDryMatch(url, route);
          expect(dryMatch.length).toBe(4);

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

          // Nested routes nesting of route paths
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

            const params = service.getChainParams(routeDryMatch);
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
            routes: [{ path: routePath }],
          };

          const params = service.getChainParams(routeDryMatch) as ChainParam[];
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

          const params = service.getChainParams(routeDryMatch) as ChainParam[];
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

          const params = service.getChainParams(routeDryMatch) as ChainParam[];
          expect(!!params).toBeTruthy('getChainParams() returns params');
          expect(params.length).toEqual(1);
          const param = params[0];
          expect(param.cacheKey).toBe(url);
          expect(param.primaryKey).toBeUndefined();
          expect(param.restId).toBeUndefined();
          expect(param.route).toEqual({ path: routePath });
        });
      });

      describe('Nested routes', () => {
        it(`URL with restId`, () => {
          const url = 'api/posts/123/comments/456';
          const routePath = 'api/posts/:postId/comments/:commentId';
          const routeDryMatch: RouteDryMatch = {
            splitedUrl: url.split('/'),
            splitedRoute: routePath.split('/'),
            hasLastRestId: true,
            routes: [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }],
          };

          const params = service.getChainParams(routeDryMatch) as ChainParam[];
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

          const params = service.getChainParams(routeDryMatch) as ChainParam[];
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

        service.cachedData = { [cacheKey]: { writeableData, readonlyData: [] } };
        service.bindReadonlyData(chainParam, writeableData);
        const readonlyData = service.cachedData[cacheKey].readonlyData as Example[];
        expect(readonlyData[1]).toEqual({ id: 2, body: 'content for id 2' });
        writeableData[1].body = 'changed content';
        expect(readonlyData[1]).toEqual({ id: 2, body: 'changed content' });
        expect(() => (readonlyData[1].body = '')).toThrowError(/which has only a getter/);
      });
    });

    describe('cacheDataWithGetMethod()', () => {
      it(`returned object have writeableData and readonlyData`, () => {
        const cacheKey = 'api/posts';
        const data = [{ one: 1, two: 2 }];
        const chainParam: ChainParam = {
          cacheKey,
          primaryKey: 'any-primary-key',
          route: { path: 'any-path', dataCallback: () => data },
        };

        let result = service.cacheDataWithGetMethod(chainParam);
        expect(result).toEqual({ writeableData: data, readonlyData: data });
        result = service.cacheDataWithGetMethod({ cacheKey } as ChainParam);
        expect(result).toEqual({ writeableData: data, readonlyData: data });
        resetMock();
        service.config.cacheFromLocalStorage = true;
        const errMsg = /dataCallback is not a function/;
        expect(() => service.cacheDataWithGetMethod({ cacheKey, route: {} } as ChainParam)).toThrowError(errMsg);
      });

      it(`get data from localStorage`, () => {
        const cacheKey = 'api/posts';
        const data = [{ one: 1, two: 2 }];
        const chainParam: ChainParam = {
          cacheKey,
          primaryKey: 'any-primary-key',
          route: { path: 'any-path', dataCallback: () => data },
        };

        service.config.cacheFromLocalStorage = true;
        let result = service.cacheDataWithGetMethod(chainParam);
        expect(result).toEqual({ writeableData: data, readonlyData: data });
        resetMock();
        service.config.cacheFromLocalStorage = true;
        result = service.cacheDataWithGetMethod({ cacheKey, route: {} } as ChainParam);
        expect(result).toEqual({ writeableData: data, readonlyData: data });
      });
    });

    describe('getParents()', () => {
      const req = new HttpRequest('GET', 'any-url');
      interface PostData {
        postId: number;
        postBody: string;
      }
      const postData: PostData[] = [
        { postId: 1, postBody: 'content for postId=1' },
        { postId: 2, postBody: 'content for postId=2' },
        { postId: 3, postBody: 'content for postId=3' },
        { postId: 4, postBody: 'content for postId=4' },
      ];

      it(`should found post with id=2`, () => {
        const chainParam1: ChainParam = {
          cacheKey: 'any-cache-key',
          route: { path: 'any-post-path', dataCallback: () => postData },
          primaryKey: 'postId',
          restId: '2',
        };
        const chainParam2 = {} as ChainParam;

        const parent = service.getParents(req, [chainParam1, chainParam2]);
        expect(parent).toEqual([{ postId: 2, postBody: 'content for postId=2' }]);
      });

      it(`should not found post with id=10`, () => {
        const chainParam1: ChainParam = {
          cacheKey: 'any-cache-key',
          route: { path: 'any-post-path', dataCallback: () => postData },
          primaryKey: 'postId',
          restId: '10',
        };
        const chainParam2 = {} as ChainParam;

        const parent = service.getParents(req, [chainParam1, chainParam2]);
        expect(parent instanceof HttpErrorResponse).toBe(true);
      });
    });

    describe('post()', () => {
      const reqHeaders = new HttpHeaders();
      it(`case 1: reqBody == undefined, primaryKey == 'postId'`, () => {
        const req = {} as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId' } as ChainParam;
        const writeableData = [];
        const response: ResponseOptions = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.CREATED);
        expect(resBody).toEqual({ postId: 1 });
        expect(headers.has('Location')).toBe(true, 'has header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 2: reqBody == undefined, primaryKey == undefined`, () => {
        const req = {} as HttpRequest<any>;
        const chainParam = {} as ChainParam;
        const writeableData = [];
        const response: ResponseOptions = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(true, 'update Errored');
        const { status, headers } = response;
        expect(status).toBe(Status.BAD_REQUEST);
        expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      });

      it(`case 3: request have reqBody and route have primaryKey`, () => {
        const reqBody = {};
        const req = { body: reqBody } as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId' } as ChainParam;
        const writeableData = [];
        const response: ResponseOptions = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.CREATED);
        expect(resBody).toEqual({ postId: 1, ...reqBody });
        expect(headers.has('Location')).toBe(true, 'has header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 4: in URI and in reqBody restId is different (123 and 456)`, () => {
        const reqBody = { postId: 123 };
        const req = { body: reqBody, url: '' } as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId', restId: '456' } as ChainParam;
        const writeableData = [];
        const response = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(true, 'update Errored');
        const { status, headers } = response;
        expect(status).toBe(Status.METHOD_NOT_ALLOWED);
        expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      });

      it(`case 5: reqBody updates existing ID`, () => {
        const reqBody = { postId: 123 };
        const req = { body: reqBody } as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId' } as ChainParam;
        const writeableData = [{ postId: 123 }];
        const response: ResponseOptions = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.NO_CONTENT);
        expect(resBody).toBeUndefined('should resBody to be undefined');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 6: reqBody updates existing ID and 'config.postUpdate204 = false'`, () => {
        const reqBody = { postId: 123 };
        const req = { body: reqBody } as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId' } as ChainParam;
        const writeableData = [{ postId: 123 }];
        service.config.postUpdate204 = false;
        const response: ResponseOptions = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.OK);
        expect(resBody).toEqual(reqBody);
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 7: reqBody updates existing ID and 'postUpdate409 = true'`, () => {
        const reqBody = { postId: 123 };
        const req = { body: reqBody } as HttpRequest<any>;
        const chainParam = { primaryKey: 'postId' } as ChainParam;
        const writeableData = [{ postId: 123 }];
        service.config.postUpdate409 = true;
        const response = service.post(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(true, 'update Errored');
        const { status, headers } = response;
        expect(status).toBe(Status.CONFLICT);
        expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      });
    });

    describe('putOrPatch()', () => {
      const reqHeaders = new HttpHeaders();
      it(`case 1: put non-existent item`, () => {
        const req = new HttpRequest<any>('PUT', 'any-url', {});
        const chainParam = { primaryKey: 'postId', restId: '1' } as ChainParam;
        const writeableData = [];
        const response: ResponseOptions = service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(true, 'update Errored');
        const { status, headers } = response;
        expect(status).toBe(Status.NOT_FOUND);
        expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      });

      it(`case 2: reqBody with existing ID and body`, () => {
        const sourceItem = { postId: 1 };
        const req = new HttpRequest<any>('PUT', 'any-url', sourceItem);
        const chainParam = { primaryKey: 'postId', restId: '1' } as ChainParam;
        const writeableData = [sourceItem];
        const response: ResponseOptions = service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.NO_CONTENT);
        expect(resBody).toBeUndefined();
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 3: ID from URL no equal to ID from body`, () => {
        const sourceItem = { postId: 123 };
        const req = new HttpRequest<any>('PUT', 'any-url', sourceItem);
        const chainParam = { primaryKey: 'postId', restId: '456' } as ChainParam;
        const writeableData = [sourceItem];
        const response = service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(true, 'update Errored');
        const { status, headers } = response;
        expect(status).toBe(Status.BAD_REQUEST);
        expect(headers.has('Content-Type')).toBe(true, 'has header "Content-Type"');
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      });

      it(`case 4: put item with existing ID and 'config.putUpdate204 = false'`, () => {
        const sourceItem = { postId: 123 };
        const req = new HttpRequest<any>('PUT', 'any-url', sourceItem);
        const chainParam = { primaryKey: 'postId', restId: '123' } as ChainParam;
        const writeableData = [sourceItem];
        service.config.putUpdate204 = false;
        const response: ResponseOptions = service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.OK);
        expect(resBody).toEqual(sourceItem);
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });

      it(`case 5: put should replace set properties of an old object`, () => {
        const sourceItem = { postId: 123, oldProperty: 1 };
        const req = new HttpRequest<any>('PUT', 'any-url', { postId: 123, newProperty: 2 });
        const chainParam = { primaryKey: 'postId', restId: '123' } as ChainParam;
        const writeableData = [sourceItem];
        service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(sourceItem as any).toEqual({ postId: 123, newProperty: 2 });
      });

      it(`case 6: patch should extends set properties of an old object`, () => {
        const sourceItem = { postId: 123, oldProperty: 1 };
        const req = new HttpRequest<any>('PATCH', 'any-url', { postId: 123, newProperty: 2 });
        const chainParam = { primaryKey: 'postId', restId: '123' } as ChainParam;
        const writeableData = [sourceItem];
        service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(sourceItem as any).toEqual({ postId: 123, oldProperty: 1, newProperty: 2 });
      });

      it(`case 7: reqBody put item with existing ID and 'config.putNotFound404 = false'`, () => {
        const sourceItem = { postId: 123 };
        const req = new HttpRequest<any>('PUT', 'any-url', sourceItem);
        const chainParam = { primaryKey: 'postId', restId: '123' } as ChainParam;
        const writeableData = [{ postId: 'no-existing-id' }];
        service.config.putUpdate404 = false;
        const response: ResponseOptions = service.putOrPatch(req, reqHeaders, chainParam, writeableData);
        expect(response instanceof HttpErrorResponse).toBe(false, 'update not Errored');
        const { status, body: resBody, headers } = response;
        expect(status).toBe(Status.CREATED);
        expect(resBody).toEqual(sourceItem);
        expect(headers.has('Location')).toBe(false, 'has not header "Location"');
        expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
      });
    });

    describe('sendResponse()', () => {
      it('should returns result of calling dataCallback()', fakeAsync(() => {
        const dataCallback: ApiMockDataCallback = () => [{ some: 1 }];
        const chainParam: ChainParam[] = [
          {
            cacheKey: 'anyCacheKey',
            primaryKey: '',
            route: { path: 'any/path', dataCallback },
          },
        ];
        const req = new HttpRequest<any>('GET', 'any/url/here');
        const res = service.sendResponse(req, chainParam);
        expect(res instanceof Observable).toBe(true);
        let result: HttpResponse<any> = null;
        res.subscribe((r) => (result = r));
        expect(result).toBeNull();

        tick(service.config.delay);

        expect(result instanceof HttpResponse).toBe(true);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body).toEqual(dataCallback());
      }));

      it('should returns searched item with given primaryKey and restId inside result of calling dataCallback()', fakeAsync(() => {
        const dataCallback: ApiMockDataCallback = () => [{ somePrimaryKey: 23, some: 1 }];
        const chainParam: ChainParam[] = [
          {
            cacheKey: 'anyCacheKey',
            primaryKey: 'somePrimaryKey',
            restId: '23',
            route: { path: '', dataCallback },
          },
        ];
        const req = new HttpRequest<any>('GET', 'any/url/here');
        const res = service.sendResponse(req, chainParam);
        expect(res instanceof Observable).toBe(true);
        let result: HttpResponse<any> = null;
        res.subscribe((r) => (result = r));
        expect(result).toBeNull();

        tick(service.config.delay);

        expect(result instanceof HttpResponse).toBe(true);
        expect(Array.isArray(result.body)).toBe(true);
        expect(result.body).toEqual(dataCallback());
      }));

      it('should returns undefined when search inside result of calling dataCallback()', fakeAsync(() => {
        const dataCallback = () => [{ some: 1 }];
        const chainParam: ChainParam[] = [
          {
            cacheKey: 'api/posts',
            primaryKey: 'somePrimaryKey',
            restId: 'someRestId',
            route: { path: '', dataCallback },
          },
        ];
        const req = new HttpRequest<any>('GET', 'any/url/here');
        const res = service.sendResponse(req, chainParam);
        expect(res instanceof Observable).toBe(true);
        let result: HttpResponse<any> = null;
        res.subscribe(
          (r) => fail,
          (err) => (result = err)
        );
        expect(result instanceof HttpErrorResponse).toBe(true);
        expect(result.status).toBe(Status.NOT_FOUND);
      }));
    });

    describe('genId()', () => {
      it('should returns 1 as new id', () => {
        const newId = service.genId([], 'id');
        expect(newId).toBe(1);
      });

      it('should ignore string id and returns 1 as new id', () => {
        const collection = [{ id: 'one' }];
        const newId = service.genId(collection, 'id');
        expect(newId).toBe(1);
      });

      it('should returns 10 as new id', () => {
        const collection = [{ id: 9 }];
        const newId = service.genId(collection, 'id');
        expect(newId).toBe(10);
      });

      it('should ignore string id and returns 100 as new id', () => {
        const collection = [{ id: 'one' }, { id: 99 }];
        const newId = service.genId(collection, 'id');
        expect(newId).toBe(100);
      });
    });
  });

  describe(`module`, () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    const posts = [{ postId: 1, body: 'content' }];
    const comments = [{ commentId: 2, body: 'content' }];
    let itemId2: string;
    let itemId3: string;

    class ApiMockServiceTest implements ApiMockService {
      getRoutes(): ApiMockRootRoute[] {
        return [
          {
            path: 'api/login',
            responseCallback: this.getResponseCallback1(),
          },
          {
            path: 'api/posts/:postId',
            dataCallback: this.getDataCallback2(),
            responseCallback: this.getResponseCallback2(),
            children: [
              {
                path: 'comments/:commentId',
                dataCallback: this.getDataCallback3(),
                responseCallback: this.getResponseCallback3(),
              },
            ],
          },
        ];
      }

      private getResponseCallback1(): ApiMockResponseCallback {
        return (opts) => {
          expect(opts).toEqual({
            items: [],
            itemId: undefined,
            httpMethod: 'GET',
            parents: undefined,
            queryParams: undefined,
            reqBody: null,
            reqHeaders: undefined,
            resBody: undefined,
          });

          return opts.resBody;
        };
      }

      private getDataCallback2(): ApiMockDataCallback {
        return (opts) => {
          expect(opts).toEqual({
            items: [],
            itemId: itemId2,
            httpMethod: 'GET',
            parents: undefined,
            queryParams: undefined,
            reqBody: null,
            reqHeaders: { auth: 'some-token' },
          });
          return posts;
        };
      }

      private getResponseCallback2(): ApiMockResponseCallback {
        return (opts) => {
          expect(opts).toEqual({
            items: posts,
            itemId: itemId2,
            httpMethod: 'GET',
            parents: undefined,
            queryParams: undefined,
            reqBody: null,
            reqHeaders: { auth: 'some-token' },
            resBody: posts,
          });

          return opts.resBody;
        };
      }

      private getDataCallback3(): ApiMockDataCallback {
        return (opts) => {
          expect(opts).toEqual({
            items: [],
            itemId: itemId3,
            httpMethod: 'GET',
            parents: posts,
            queryParams: undefined,
            reqBody: null,
            reqHeaders: { auth: 'some-token' },
          });
          return comments;
        };
      }

      private getResponseCallback3(): ApiMockResponseCallback {
        return (opts) => {
          expect(opts).toEqual({
            items: comments,
            itemId: itemId3,
            httpMethod: 'GET',
            parents: posts,
            queryParams: undefined,
            reqBody: null,
            reqHeaders: { auth: 'some-token' },
            resBody: comments,
          });

          return opts.resBody;
        };
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientTestingModule,
          ApiMockModule.forRoot(ApiMockServiceTest, { delay: 0 }),
          RouterTestingModule,
        ],
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it(`case 1`, (done) => {
      httpClient.get('/api/login').subscribe((data) => {
        expect(data).toBe(null);
        done();
      });
      httpTestingController.expectNone('/api/login', 'No request to a real server');
    });

    it(`case 2`, (done) => {
      itemId2 = undefined;
      httpClient.get('/api/posts', { headers: new HttpHeaders({ auth: 'some-token' }) }).subscribe((data) => {
        expect(data).toEqual(posts);
        done();
      });
      httpTestingController.expectNone('/api/posts', 'No request to a real server');
    });

    it(`case 3`, (done) => {
      itemId2 = '1';
      itemId3 = '2';
      httpClient
        .get('/api/posts/1/comments/2', { headers: new HttpHeaders({ auth: 'some-token' }) })
        .subscribe((data) => {
          expect(data).toEqual(comments);
          done();
        });
      httpTestingController.expectNone('/api/posts/1/comments/2', 'No request to a real server');
    });

    it(`case 4`, (done) => {
      itemId2 = '1';
      itemId3 = '123';
      httpClient
        .get('/api/posts/1/comments/123', { headers: new HttpHeaders({ auth: 'some-token' }) })
        .pipe(catchError((error) => of(error)))
        .subscribe((error) => {
          expect(error.status).toBe(404);
          done();
        });
      httpTestingController.expectNone('/api/posts/1/comments/123', 'No request to a real server');
    });
  });
});
