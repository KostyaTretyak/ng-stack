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
  ApiMockRoute,
  ResponseParam,
  ApiMockConfig,
  ObjectAny,
  HttpResOpts,
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

    getResponseParams(splitedUrl: string[], splitedRoute: string[], hasLastRestId: boolean, routes: ApiMockRouteGroup) {
      return super.getResponseParams(splitedUrl, splitedRoute, hasLastRestId, routes);
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

  it('should DI create instance of HttpBackendService', () => {
    expect(httpBackendService instanceof HttpBackendService2).toBeTruthy();
  });

  const route: ApiMockRoute = {
    path: 'one/two/three/:primaryId',
    callbackData: () => {
      return [];
    },
    callbackResponse: () => {
      return {};
    },
  };

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

    fdescribe('param: route.callbackData and route.callbackResponse', () => {
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

    it('with bad callbackResponse as argument should fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, callbackResponse: {} as any }]];
      const msg = `Route callbackResponse with path "one/two/three/:primaryId" is not a function`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with duplicate root path as arguments with fail', () => {
      const routes: ApiMockRouteGroup[] = [
        [{ ...route }],
        [{ ...route, path: 'four/five/six/:primaryId' }],
        [{ ...route }],
      ];
      const msg = `ApiMockModule detect duplicate route with path: "/one/two/three/"`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });
  });

  describe('getRootPaths()', () => {
    const routesWithoutHost: ApiMockRouteGroup[] = [
      [{ ...route, path: 'one/:primaryId' }],
      [{ ...route, path: 'one/two/:primaryId' }],
      [{ ...route, path: 'one/two/three/four/five/six/seven/:primaryId' }],
      [{ ...route, path: 'one/two/three/four/five/six/:primaryId' }],
      [{ ...route, path: 'one/two/three/:primaryId' }],
      [{ ...route, path: 'one/two/three/four/:primaryId' }],
      [{ ...route, path: 'one/two/three/four/five/:primaryId' }],
    ];

    const routesWithMixHost: ApiMockRouteGroup[] = [
      [{ ...route, host: 'https://example3.com', path: 'one/two/three/four/five/six/:primaryId' }],
      [{ ...route, host: 'https://example2.com', path: 'one/two/three/four/five/six/:primaryId' }],
      [{ ...route, host: 'https://example1.com', path: 'one/two/:primaryId' }],
      [{ ...route, host: 'https://example1.com', path: 'one/two/three/four/five/six/:primaryId' }],
      [{ ...route, host: 'https://example2.com', path: 'one/two/:primaryId' }],
      [{ ...route, host: 'https://example4.com', path: 'one/two/three/four/:primaryId' }],
      [{ ...route, host: 'https://example4.com', path: 'one/two/:primaryId' }],
      [{ ...route, host: 'https://example2.com', path: 'one/two/three/four/:primaryId' }],
      [{ ...route, host: 'https://example3.com', path: 'one/two/three/four/:primaryId' }],
      [{ ...route, host: 'https://example1.com', path: 'one/two/three/four/:primaryId' }],
      [{ ...route, host: 'https://example3.com', path: 'one/two/:primaryId' }],
    ];

    describe('getRootPaths()', () => {
      it('without host should sort root path by length with revert order', () => {
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
        expect(rootRoutes[5].path).toBe('one/two');
        expect(rootRoutes[5].index).toEqual(1);
        expect(rootRoutes[6].path).toBe('one');
        expect(rootRoutes[6].index).toEqual(0);
      });

      it('with host should sort root path by length with revert order', () => {
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
      it('without host should find right routeIndex', () => {
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
      });

      it('with host should find right routeIndex', () => {
        const rootRoutes = httpBackendService.getRootPaths(routesWithMixHost);
        let host = 'https://example2.com/one/two/primaryId';
        let routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, host);
        expect(routeIndex).toEqual(4);
        host = 'https://example4.com/one/two/three/four/primaryId';
        routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, host);
        expect(routeIndex).toEqual(5);
        host = 'https://example4.com/one/two/primaryId';
        routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, host);
        expect(routeIndex).toEqual(6);
        host = 'https://example1.com/one/two/primaryId';
        routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, host);
        expect(routeIndex).toEqual(2);
        host = 'https://example1.com/one/two-other/primaryId';
        routeIndex = httpBackendService.findRouteGroupIndex(rootRoutes, host);
        expect(routeIndex).toEqual(-1);
      });
    });
  });

  describe('getRouteDryMatch()', () => {
    let dryMatch: RouteDryMatch | void;
    let routeGroup: ApiMockRouteGroup;
    let url: string;
    let splitedUrl: string[];
    let splitedRoute: string[];

    describe('one level of nesting', () => {
      it('should match an url with primary ID to a route', () => {
        url = 'one/two/three-other/123';
        routeGroup = [{ ...route, path: 'one/two/three/:primaryId' }];
        splitedUrl = ['one', 'two', 'three-other', '123'];
        splitedRoute = ['one', 'two', 'three', ':primaryId'];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy();
        expect(dryMatch.hasLastRestId).toBeTruthy();
        expect(dryMatch.splitedUrl.join('/')).toBe(splitedUrl.join('/'));
        expect(dryMatch.splitedRoute.join('/')).toBe(splitedRoute.join('/'));
      });

      it('should match an url without primary ID to a route', () => {
        url = 'one/two/three-other';
        routeGroup = [{ ...route, path: 'one/two/three/:primaryId' }];
        splitedUrl = ['one', 'two', 'three-other'];
        splitedRoute = ['one', 'two', 'three'];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy();
        expect(dryMatch.hasLastRestId).toBeFalsy();
        expect(dryMatch.splitedUrl.join('/')).toBe(splitedUrl.join('/'));
        expect(dryMatch.splitedRoute.slice(0, -1).join('/')).toBe(splitedRoute.join('/'));
      });

      it('should not match an long url with primary ID to a short route', () => {
        url = 'one/two/three-other/four/123';
        routeGroup = [{ ...route, path: 'one/two/three/:primaryId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup);
        expect(!!dryMatch).toBeFalsy();
      });

      it('should not match an short url with primary ID to a long route', () => {
        url = 'one/two/three-other/123';
        routeGroup = [{ ...route, path: 'one/two/three/five/six/:primaryId' }];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup);
        expect(!!dryMatch).toBeFalsy();
      });

      it('should match an url with host and with primary ID to a route', () => {
        url = 'https://example.com/one/two-other/123';
        routeGroup = [{ ...route, host: 'https://example.com', path: 'one/two/:primaryId' }];
        splitedUrl = ['https:', '', 'example.com', 'one', 'two-other', '123'];
        splitedRoute = ['https:', '', 'example.com', 'one', 'two', ':primaryId'];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy();
        expect(dryMatch.hasLastRestId).toBeTruthy();
        expect(dryMatch.splitedUrl.join('/')).toBe(splitedUrl.join('/'));
        expect(dryMatch.splitedRoute.join('/')).toBe(splitedRoute.join('/'));
      });

      it('should match an url with host and without primary ID to a route', () => {
        url = 'https://example.com/one/two-other';
        routeGroup = [{ ...route, host: 'https://example.com', path: 'one/two/:primaryId' }];
        splitedUrl = ['https:', '', 'example.com', 'one', 'two-other'];
        splitedRoute = ['https:', '', 'example.com', 'one', 'two'];
        dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
        expect(!!dryMatch).toBeTruthy();
        expect(dryMatch.hasLastRestId).toBeFalsy();
        expect(dryMatch.splitedUrl.join('/')).toBe(splitedUrl.join('/'));
        expect(dryMatch.splitedRoute.slice(0, -1).join('/')).toBe(splitedRoute.join('/'));
      });
    });

    describe('many level of nesting', () => {});
  });

  describe('getReponseParams()', () => {
    let badArgs: Map<string, string>;
    let goodArgs: Map<string, string>;
    describe('with last restId', () => {
      describe('without host', () => {
        describe('one level nesting', () => {
          badArgs = new Map([
            ['api/posts/123', 'api/posts-other/:postId'],
            ['api/posts/123', 'api-other/posts/:postId'],
            ['api/posts-other/123', 'api/posts/:postId'],
            ['api-other/posts/123', 'api/posts/:postId'],
          ]);
          goodArgs = new Map([['api/posts/123', 'api/posts/:postId']]);

          badArgs.forEach((routePath, url) => {
            it(`should not matched "${url}" to "${routePath}"`, () => {
              const splitedUrl = url.split('/');
              const splitedRoute = routePath.split('/');
              const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
              const params = httpBackendService.getResponseParams(splitedUrl, splitedRoute, true, routes);
              expect(!!params).toBeFalsy();
            });
          });

          goodArgs.forEach((routePath, url) => {
            it(`should matched "${url}" to "${routePath}"`, () => {
              const splitedUrl = url.split('/');
              const splitedRoute = routePath.split('/');
              const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
              const params = httpBackendService.getResponseParams(
                splitedUrl,
                splitedRoute,
                true,
                routes
              ) as ResponseParam[];
              expect(!!params).toBeTruthy();
              expect(params.length).toEqual(1);
              const param = params[0];
              expect(param.cacheKey).toBe('api/posts');
              expect(param.primaryKey).toBe('postId');
              expect(param.restId).toBe('123');
              expect(param.route === routes[0]).toBeTruthy();
            });
          });
        });

        describe('multi level nesting', () => {
          badArgs = new Map([
            ['api/posts/123/comments/456', 'api/posts/:postId/comments-other/:commentId'],
            ['api/posts/123/comments/456', 'api-other/posts/:postId/comments/:commentId'],
            ['api/posts/123/comments-other/456', 'api/posts/:postId/comments/:commentId'],
            ['api-other/posts/123/comments/456', 'api/posts/:postId/comments/:commentId'],
          ]);
          goodArgs = new Map([['api/posts/123/comments/456', 'api/posts/:postId/comments/:commentId']]);

          badArgs.forEach((routePath, url) => {
            it(`should not matched "${url}" to "${routePath}"`, () => {
              const splitedUrl = url.split('/');
              const splitedRoute = routePath.split('/');
              const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
              const params = httpBackendService.getResponseParams(splitedUrl, splitedRoute, true, routes);
              expect(!!params).toBeFalsy();
            });
          });

          goodArgs.forEach((routePath, url) => {
            it(`should matched "${url}" to "${routePath}"`, () => {
              const splitedUrl = url.split('/');
              const splitedRoute = routePath.split('/');
              const routes: ApiMockRouteGroup = [
                { ...route, path: 'posts/:postId' },
                { ...route, path: 'comments/:commentId' },
              ];
              const params = httpBackendService.getResponseParams(
                splitedUrl,
                splitedRoute,
                true,
                routes
              ) as ResponseParam[];
              expect(!!params).toBeTruthy();
              expect(params.length).toEqual(2);
              const param1 = params[0];
              expect(param1.route === routes[0]).toBeTruthy();
              const param2 = params[1];
              expect(param2.cacheKey).toBe('api/posts/123/comments');
              expect(param2.primaryKey).toBe('commentId');
              expect(param2.restId).toBe('456');
              expect(param2.route === routes[1]).toBeTruthy();
            });
          });
        });
      });

      describe('with host', () => {
        badArgs = new Map([
          ['https://example.com/api/posts/123', 'https://example.com/api/posts-other/:postId'],
          ['https://example.com/api/posts/123', 'https://example.com/api-other/posts/:postId'],
          ['https://example.com/api/posts-other/123', 'https://example.com/api/posts/:postId'],
          ['https://example.com/api-other/posts/123', 'https://example.com/api/posts/:postId'],
          ['https://example1.com/api/posts/123', 'https://example.com/api/posts/:postId'],
        ]);
        goodArgs = new Map([['https://example.com/api/posts/123', 'https://example.com/api/posts/:postId']]);

        badArgs.forEach((routePath, url) => {
          it(`should not matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [{ ...route, path: routePath, host: 'https://example.com' }];
            const params = httpBackendService.getResponseParams(splitedUrl, splitedRoute, true, routes);
            expect(!!params).toBeFalsy();
          });
        });

        goodArgs.forEach((routePath, url) => {
          it(`should matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [{ ...route, path: 'posts/:postId', host: 'https://example.com' }];
            const params = httpBackendService.getResponseParams(
              splitedUrl,
              splitedRoute,
              true,
              routes
            ) as ResponseParam[];
            expect(!!params).toBeTruthy();
            expect(params.length).toEqual(1);
            const param = params[0];
            expect(param.cacheKey).toBe('https://example.com/api/posts');
            expect(param.primaryKey).toBe('postId');
            expect(param.restId).toBe('123');
            expect(param.route === routes[0]).toBeTruthy();
          });
        });
      });
    });

    describe('without last restId', () => {
      describe('one level nesting', () => {
        badArgs = new Map([
          ['api/posts', 'api/posts-other'],
          ['api/posts', 'api-other/posts'],
          ['api/posts-other', 'api/posts'],
          ['api-other/posts', 'api/posts'],
        ]);
        goodArgs = new Map([['api/posts', 'api/posts']]);

        badArgs.forEach((routePath, url) => {
          it(`should not matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
            const params = httpBackendService.getResponseParams(splitedUrl, splitedRoute, false, routes);
            expect(!!params).toBeFalsy();
          });
        });

        goodArgs.forEach((routePath, url) => {
          it(`should matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
            const params = httpBackendService.getResponseParams(
              splitedUrl,
              splitedRoute,
              false,
              routes
            ) as ResponseParam[];
            expect(!!params).toBeTruthy();
            expect(params.length).toEqual(1);
            const param = params[0];
            expect(param.cacheKey).toBe('api/posts');
            expect(param.primaryKey).toBeUndefined();
            expect(param.restId).toBeUndefined();
            expect(param.route === routes[0]).toBeTruthy();
          });
        });
      });

      describe('multi level nesting', () => {
        badArgs = new Map([
          ['api/posts/123/comments', 'api/posts/:postId/comments-other'],
          ['api/posts/123/comments', 'api-other/posts/:postId/comments'],
          ['api/posts/123/comments-other', 'api/posts/:postId/comments'],
          ['api-other/posts/123/comments', 'api/posts/:postId/comments'],
        ]);
        goodArgs = new Map([['api/posts/123/comments', 'api/posts/:postId/comments']]);

        badArgs.forEach((routePath, url) => {
          it(`should not matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [{ ...route, path: routePath }];
            const params = httpBackendService.getResponseParams(splitedUrl, splitedRoute, true, routes);
            expect(!!params).toBeFalsy();
          });
        });

        goodArgs.forEach((routePath, url) => {
          it(`should matched "${url}" to "${routePath}"`, () => {
            const splitedUrl = url.split('/');
            const splitedRoute = routePath.split('/');
            const routes: ApiMockRouteGroup = [
              { ...route, path: 'posts/:postId' },
              { ...route, path: 'comments/:commentId' },
            ];
            const params = httpBackendService.getResponseParams(
              splitedUrl,
              splitedRoute,
              false,
              routes
            ) as ResponseParam[];
            expect(!!params).toBeTruthy();
            expect(params.length).toEqual(2);
            const param1 = params[0];
            expect(param1.route === routes[0]).toBeTruthy();
            const param2 = params[1];
            expect(param2.cacheKey).toBe('api/posts/123/comments');
            expect(param2.primaryKey).toBeUndefined();
            expect(param2.restId).toBeUndefined();
            expect(param2.route === routes[1]).toBeTruthy();
          });
        });
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
