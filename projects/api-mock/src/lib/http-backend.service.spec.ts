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
  ApiMockRouteGroup,
  ApiMockService,
  PartialRoutes,
  RouteDryMatch,
  ResponseParam,
  ApiMockConfig,
  ObjectAny,
  HttpResOpts,
  ApiMockRouteRoot,
  ApiMockRoute,
} from './types';
import { Status } from './http-status-codes';

describe('HttpBackendService', () => {
  /**
   * Make all properties this class with public data accessor.
   */
  @Injectable()
  class HttpBackendService2 extends HttpBackendService {
    config: ApiMockConfig;

    checkRouteGroups(routes: ApiMockRouteGroup[]) {
      return super.checkRouteGroups(routes);
    }

    getRootPaths(routeGroups: ApiMockRouteGroup[]) {
      return super.getRootPaths(routeGroups);
    }

    findRouteGroupIndex(rootRoutes: PartialRoutes, url: string) {
      return super.findRouteGroupIndex(rootRoutes, url);
    }

    getRouteDryMatch(normalizedUrl: string, routeGroup: ApiMockRouteGroup) {
      return super.getRouteDryMatch(normalizedUrl, routeGroup);
    }

    getResponseParams(routeDryMatch: RouteDryMatch) {
      return super.getResponseParams(routeDryMatch);
    }

    sendResponse(req: HttpRequest<any>, responseParams: ResponseParam[]) {
      return super.sendResponse(req, responseParams);
    }

    getObservableResponse(
      req: HttpRequest<any>,
      responseParams: ResponseParam[],
      parents: ObjectAny[],
      queryParams: Params
    ) {
      return super.getObservableResponse(req, responseParams, parents, queryParams);
    }

    changeItem(req: HttpRequest<any>, responseParam: ResponseParam, writeableData: ObjectAny[]): HttpResOpts {
      return super.changeItem(req, responseParam, writeableData);
    }

    genId(collection: ObjectAny[], primaryKey: string) {
      return super.genId(collection, primaryKey);
    }

    post(req: HttpRequest<any>, headers: HttpHeaders, responseParam: ResponseParam, writeableData: ObjectAny[]) {
      return super.post(req, headers, responseParam, writeableData);
    }
  }

  class MyApiMockService implements ApiMockService {
    getRouteGroups() {
      return [];
    }
  }

  let httpBackendService: HttpBackendService2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApiMockModule.forRoot(MyApiMockService), RouterTestingModule],
      providers: [HttpBackendService2],
    });

    httpBackendService = TestBed.get(HttpBackendService2);

    // Merge with default configs.
    httpBackendService.config = new ApiMockConfig(httpBackendService.config);
  });

  describe('checkRouteGroups()', () => {
    it('route with emty route group', () => {
      const routes: ApiMockRouteGroup[] = [];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
      const result = httpBackendService.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    describe('param: route.path', () => {
      it('path without slashes', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });

      it('path with slashes and without primary keys', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/sessions' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });

      it('route path with trailing slash', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/sessions/' }]];
        const regexpMsg = /route.path should not to have trailing slash/;
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(regexpMsg);
      });

      it('multi level route paths, without primary keys', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/posts' }, { path: 'comments' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(/detect wrong multi level route/);
      });
    });

    describe('param: route.path and route.callbackData', () => {
      it('multi level route paths, without route.callbackData', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/posts/:postId' }, { path: 'comments' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(/detect wrong multi level route/);
      });

      it('multi level route paths, with route.callbackData and a primary key', () => {
        const routeGroups: ApiMockRouteGroup[] = [
          [
            // Multi level route paths, with callbackData
            { path: 'api/posts/:postId', callbackData: () => [] },
            { path: 'comments' },
          ],
        ];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });

      it('with callbackData, but without a primary key', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/posts', callbackData: () => [] }]];
        const regexpMsg = /If you have route.callback, you should/;
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(regexpMsg);
      });

      it('with callbackData and with a primary key', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ path: 'api/posts/:postId', callbackData: () => [] }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });
    });

    describe('param: route.callbackData and route.callbackResponse', () => {
      it('callbackData as an object', () => {
        const routes: ApiMockRouteGroup[] = [[{ callbackData: {} as any, path: 'api/posts/:postId' }]];
        expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/is not a function/);
      });

      it('callbackData as a function', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ callbackData: () => [], path: 'api/posts/:postId' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });

      it('callbackResponse as an object', () => {
        const routes: ApiMockRouteGroup[] = [[{ callbackResponse: {} as any, path: 'api/posts/:postId' }]];
        expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/is not a function/);
      });

      it('callbackResponse as a function', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ callbackResponse: () => [], path: 'api/posts/:postId' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });

      it('callbackResponse as a function, without path primary key', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ callbackResponse: () => [], path: 'api/pre-account/login' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });
    });

    describe('param: route.host', () => {
      it('wrong host', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ host: 'fake host', path: 'api' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(/detect wrong host/);
      });

      it('wrong host without HTTP protocol', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ host: 'example.com', path: 'api' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(/detect wrong host/);
      });

      it('wrong host with slash at the end', () => {
        const routeGroups: ApiMockRouteGroup[] = [[{ host: 'http://example.com/', path: 'api' }]];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).toThrowError(/detect wrong host/);
      });

      it('right hosts', () => {
        const routeGroups: ApiMockRouteGroup[] = [
          [{ host: 'http://example.com', path: 'api' }],
          [{ host: 'https://example.com', path: 'api' }],
          [{ host: 'https://example.com.ua', path: 'api' }],
          [{ host: 'https://приклад.укр', path: 'api' }],
          [{ host: 'https://xn--80aikifvh.xn--j1amh', path: 'api' }],
        ];
        expect(() => httpBackendService.checkRouteGroups(routeGroups)).not.toThrow();
        const result = httpBackendService.checkRouteGroups(routeGroups);
        expect(result).toEqual(routeGroups);
      });
    });
  });

  const routesWithoutHost: ApiMockRouteGroup[] = [
    [{ path: 'one/:primaryId' }],
    [{ path: 'one/two/:primaryId' }],
    [{ path: 'one/two/three/four/five/six/seven/:primaryId' }],
    [{ path: 'one/two/three/four/five/six/:primaryId' }],
    [{ path: 'one/two/three/:primaryId' }],
    [{ path: 'one/two/three/four/:primaryId' }],
    [{ path: 'one/two/three/four/five/:primaryId' }],
    [{ path: 'api/login' }],
  ];

  const routesWithMixHost: ApiMockRouteGroup[] = [
    [{ host: 'https://example3.com', path: 'one/two/three/four/five/six/:primaryId' }],
    [{ host: 'https://example2.com', path: 'one/two/three/four/five/six/:primaryId' }],
    [{ host: 'https://example1.com', path: 'one/two/:primaryId' }],
    [{ host: 'https://example1.com', path: 'one/two/three/four/five/six/:primaryId' }],
    [{ host: 'https://example2.com', path: 'one/two/:primaryId' }],
    [{ host: 'https://example4.com', path: 'one/two/three/four/:primaryId' }],
    [{ host: 'https://example4.com', path: 'one/two/:primaryId' }],
    [{ host: 'https://example2.com', path: 'one/two/three/four/:primaryId' }],
    [{ host: 'https://example3.com', path: 'one/two/three/four/:primaryId' }],
    [{ host: 'https://example1.com', path: 'one/two/three/four/:primaryId' }],
    [{ host: 'https://example3.com', path: 'one/two/:primaryId' }],
    [{ host: 'https://example4.com', path: 'api/login' }],
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

  describe('findRouteGroupIndex()', () => {
    it('param: routes without a host', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithoutHost);
      let routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one/two/three/four/primaryId');
      expect(routeIndex).toEqual(5);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one/two/primaryId');
      expect(routeIndex).toEqual(1);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one-other/primaryId');
      expect(routeIndex).toEqual(-1);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one/two/three/four/five/six/seven/primaryId');
      expect(routeIndex).toEqual(2);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one/two/three/four/five/six/primaryId');
      expect(routeIndex).toEqual(3);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'one/two/three/four/five/primaryId');
      expect(routeIndex).toEqual(6);
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, 'api/login');
      expect(routeIndex).toEqual(7);
    });

    it('param: routes with a host', () => {
      const rootRoutes = httpBackendService.getRootPaths(routesWithMixHost);
      let url = 'https://example2.com/one/two/primaryId';
      let routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(4);
      url = 'https://example4.com/one/two/three/four/primaryId';
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(5);
      url = 'https://example4.com/one/two/primaryId';
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(6);
      url = 'https://example1.com/one/two/primaryId';
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(2);
      url = 'https://example1.com/one/two-other/primaryId';
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(-1);
      url = 'https://example4.com/api/login';
      routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, url);
      expect(routeIndex).toEqual(11);
    });
  });

  describe('getRouteDryMatch()', () => {
    let dryMatch: RouteDryMatch | void;
    let url: string;
    let routePath: string;
    let routeGroup: ApiMockRouteGroup;

    describe('one level of route.path nesting', () => {
      it('url with primary ID', () => {
        url = 'one/two/three-other/123';
        routePath = 'one/two/three/:primaryId';
        routeGroup = [{ path: routePath }, { path: 'level-two/one/two' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(true);
        expect(dryMatch.lastPrimaryKey).toBe('primaryId');
        expect(dryMatch.splitedRoute.join('/')).toBe(routePath);
        expect(dryMatch.routes).toEqual([{ path: routePath }]);
      });

      it('url without primary ID', () => {
        url = 'one/two/three-other';
        routePath = 'one/two/three/:primaryId';
        routeGroup = [{ path: routePath }, { path: 'level-two/one/two' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(false);
        expect(dryMatch.lastPrimaryKey).toBe('primaryId');
        expect(dryMatch.splitedRoute.join('/')).toBe('one/two/three');
        expect(dryMatch.routes).toEqual([{ path: routePath }]);
      });

      it('should not match a long url to a short route', () => {
        url = 'one/two/three-other/four/123';
        routePath = 'one/two/three/:primaryId';
        dryMatch = httpBackendService.getRouteDryMatch(url, [{ path: routePath }]);
        expect(!!dryMatch).toBeFalsy();
      });

      it('should not match a short url to a long route', () => {
        url = 'one/two/three-other/123';
        routePath = 'one/two/three/five/six/:primaryId';
        dryMatch = httpBackendService.getRouteDryMatch(url, [{ path: routePath }]);
        expect(!!dryMatch).toBeFalsy();
      });

      it('url with host and with primary ID', () => {
        url = 'https://example.com/one/two-other/123';
        routeGroup = [{ host: 'https://example.com', path: 'one/two/:primaryId' }, { path: 'level-two/one/two' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(true);
        expect(dryMatch.lastPrimaryKey).toBe('primaryId');
        expect(dryMatch.splitedRoute.join('/')).toBe('https://example.com/one/two/:primaryId');
        expect(dryMatch.routes).toEqual([{ host: 'https://example.com', path: 'one/two/:primaryId' }]);
      });

      it('url with host and without primary ID', () => {
        url = 'https://example.com/one/two-other';
        routeGroup = [{ host: 'https://example.com', path: 'one/two/:primaryId' }, { path: 'level-two/one/two' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(false);
        expect(dryMatch.lastPrimaryKey).toBe('primaryId');
        expect(dryMatch.splitedRoute.join('/')).toBe('https://example.com/one/two');
        expect(dryMatch.routes).toEqual([{ host: 'https://example.com', path: 'one/two/:primaryId' }]);
      });
    });

    describe('multi level of route.path nesting', () => {
      it('url with primary ID', () => {
        url = 'api/posts/123/comments-other/456';
        routeGroup = [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }, { path: 'one/two/:otherId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(true);
        expect(dryMatch.lastPrimaryKey).toBe('commentId');
        expect(dryMatch.splitedRoute.join('/')).toBe('api/posts/:postId/comments/:commentId');
        expect(dryMatch.routes).toEqual([{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }]);
      });

      it('url without primary ID', () => {
        url = 'api/posts/123/comments-other';
        routeGroup = [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }, { path: 'one/two/:otherId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(false);
        expect(dryMatch.lastPrimaryKey).toBe('commentId');
        expect(dryMatch.splitedRoute.join('/')).toBe('api/posts/:postId/comments');
        expect(dryMatch.routes).toEqual([{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }]);
      });

      it('should not match a long url to a short route', () => {
        url = 'one/two/three/four/five/six/seven';
        routeGroup = [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup);
        expect(!!dryMatch).toBeFalsy();
      });

      it('should not match a short url to a long route', () => {
        url = 'one';
        routeGroup = [{ path: 'api/posts/:postId' }, { path: 'comments/:commentId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup);
        expect(!!dryMatch).toBeFalsy();
      });

      it('url with host and with primary ID', () => {
        url = 'https://example.com/api/posts/123/comments-other/456';
        routeGroup = [
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
          { path: 'one/two/:otherId' },
        ];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(true);
        expect(dryMatch.lastPrimaryKey).toBe('commentId');
        expect(dryMatch.splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/comments/:commentId');
        expect(dryMatch.routes).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);
      });

      it('url with host and without primary ID', () => {
        url = 'https://example.com/api/posts/123/comments-other';
        routeGroup = [
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
          { path: 'one/two/:otherId' },
        ];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy('dryMatch has a value');
        expect(dryMatch.hasLastRestId).toBe(false);
        expect(dryMatch.lastPrimaryKey).toBe('commentId');
        expect(dryMatch.splitedRoute.join('/')).toBe('https://example.com/api/posts/:postId/comments');
        expect(dryMatch.routes).toEqual([
          { host: 'https://example.com', path: 'api/posts/:postId' },
          { path: 'comments/:commentId' },
        ]);
      });
    });
  });

  fdescribe('getReponseParams()', () => {
    const badArgs = [
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
      it(`"${url}" not matched to "${routePath}"`, () => {
        const splitedUrl = url.split('/');
        const hasLastRestId = i >= 0 && i < 8 ? true : false;
        const splitedRoute = hasLastRestId ? routePath.split('/') : routePath.split('/').slice(0, -1);
        const routes = [{ path: routePath }] as [ApiMockRouteRoot, ...ApiMockRoute[]];

        const routeDryMatch: RouteDryMatch = {
          splitedUrl,
          splitedRoute,
          hasLastRestId,
          routes,
        };

        const params = httpBackendService.getResponseParams(routeDryMatch);
        if (!!params) {
          console.log(params);
        }
        expect(!!params).toBeFalsy('getResponseParams() not returns params');
      });
    });

    const goodArgs = [
      // URL with restId
      ['api/posts/123', 'api/posts/:postId'],
      ['api/comments/456', 'api/comments/:commentId'],

      // Multi level nesting of route paths
      ['api/posts/123/comments/456', 'api/posts/:postId/comments/:commentId'],

      // URL without restId
      ['api/posts', 'api/posts/:postId'],
      ['api/comments', 'api/comments/:commentId'],
    ];

    goodArgs.forEach(([url, routePath], i) => {
      it(`"${url}" matched to "${routePath}"`, () => {
        const splitedUrl = url.split('/');
        const routes = [{ path: routePath }, { path: routePath }] as [ApiMockRouteRoot, ...ApiMockRoute[]];
        const paramsLength = splitedUrl.length == 5 ? 2 : 1;
        const lastPrimaryKey = routePath
          .split('/')
          .slice(-1)[0]
          .slice(1);
        let hasLastRestId: boolean;
        let splitedRoute: string[];
        let cacheKey: string;
        let restId: string;

        if (i >= 0 && i < 3) {
          hasLastRestId = true;
          splitedRoute = routePath.split('/');
          cacheKey = splitedUrl.slice(0, -1).join('/');
          restId = splitedUrl.slice(-1)[0];
        } else {
          hasLastRestId = false;
          splitedRoute = routePath.split('/').slice(0, -1);
          cacheKey = splitedUrl.join('/');
          restId = undefined;
        }

        const routeDryMatch: RouteDryMatch = {
          splitedUrl,
          splitedRoute,
          hasLastRestId,
          lastPrimaryKey,
          routes,
        };

        const params = httpBackendService.getResponseParams(routeDryMatch) as ResponseParam[];
        expect(!!params).toBeTruthy('getResponseParams() returns params');
        expect(params.length).toEqual(paramsLength);
        const param = params[params.length - 1];
        expect(param.cacheKey).toBe(cacheKey);
        expect(param.primaryKey).toBe(lastPrimaryKey);
        expect(param.restId).toBe(restId);
        expect(param.route).toEqual({ path: routePath });
      });
    });
  });

  describe('sendResponse()', () => {
    it('should returns result of calling callbackData()', fakeAsync(() => {
      const callbackData = () => [{ some: 1 }];
      const callbackResponse = clonedItems => clonedItems;
      const responseParam: ResponseParam[] = [
        { cacheKey: 'api/posts', primaryKey: '', route: { path: '', callbackData, callbackResponse } },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, responseParam);
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
      const responseParam: ResponseParam[] = [
        {
          cacheKey: 'api/posts',
          primaryKey: 'somePrimaryKey',
          restId: '23',
          route: { path: '', callbackData, callbackResponse },
        },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, responseParam);
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
      const responseParam: ResponseParam[] = [
        {
          cacheKey: 'api/posts',
          primaryKey: 'somePrimaryKey',
          restId: 'someRestId',
          route: { path: '', callbackData, callbackResponse },
        },
      ];
      const req = new HttpRequest<any>('GET', 'any/url/here');
      const res: Observable<HttpResponse<any>> = httpBackendService.sendResponse(req, responseParam);
      expect(res instanceof Observable).toBe(true);
      let result: HttpResponse<any> = null;
      res.subscribe(r => fail, err => (result = err));
      expect(result instanceof HttpErrorResponse).toBe(true);
      expect(result.status).toBe(Status.NOT_FOUND);
    }));
  });

  describe('getObservableResponse()', () => {});

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
      const update = httpBackendService.post(
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
      const update = httpBackendService.post(
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
      const responseParam: ResponseParam = { primaryKey: 'postId', restId: '456', route: {} as any, cacheKey: '' };
      const writeableData: ObjectAny[] = [{ postId: 123 }];
      const update = httpBackendService.post(req, reqHeaders, responseParam, writeableData);

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
      const responseParam: ResponseParam = { primaryKey: 'postId', route: {} as any, cacheKey: '' };
      const writeableData: ObjectAny[] = [{ postId: 123 }];
      const update = httpBackendService.post(req, reqHeaders, responseParam, writeableData);

      expect(update instanceof HttpErrorResponse).toBe(false, 'update not Errored');
      const { status, body: resBody, headers } = update;
      expect(status).toBe(Status.NO_CONTENT);
      expect(resBody).toBeUndefined('should resBody to be undefined');
      expect(headers.has('Location')).toBe(false, 'has not header "Location"');
      expect(headers.has('Content-Type')).toBe(false, 'has not header "Content-Type"');
    });
  });
});
