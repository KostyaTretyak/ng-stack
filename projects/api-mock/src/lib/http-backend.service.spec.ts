import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HttpBackendService } from './http-backend.service';
import { ApiMockRouteGroup, ApiMockService, PartialRoutes, RouteDryMatch, ApiMockRoute } from './types';
import { ApiMockModule } from './api-mock.module';

describe('HttpBackendService', () => {
  /**
   * Make all properties this class with public data accessor.
   */
  @Injectable()
  class HttpBackendService2 extends HttpBackendService {
    getRootPaths(routeGroups: ApiMockRouteGroup[]) {
      return super.getRootPaths(routeGroups);
    }

    checkRouteGroups(routes: ApiMockRouteGroup[]) {
      return super.checkRouteGroups(routes);
    }

    findRouteGroupIndex(rootRoutes: PartialRoutes, url: string) {
      return super.findRouteGroupIndex(rootRoutes, url);
    }

    getRouteDryMatch(normalizedUrl: string, routeGroup: ApiMockRouteGroup) {
      return super.getRouteDryMatch(normalizedUrl, routeGroup);
    }

    getResponse(splitedUrl: string[], splitedRoute: string[], hasLastRestId: boolean, routes: ApiMockRouteGroup) {
      return super.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
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
      imports: [HttpClientTestingModule, ApiMockModule.forRoot(MyApiMockService)],
      providers: [HttpBackendService2],
    });

    httpBackendService = TestBed.get(HttpBackendService2);
  });

  it('should DI create instance of HttpBackendService', () => {
    expect(httpBackendService instanceof HttpBackendService2).toBeTruthy();
  });

  const route: ApiMockRoute = {
    path: 'one/two/three/:primaryId',
    callbackData: () => {
      return {
        writeableData: [],
        onlyreadData: [],
      };
    },
    callbackResponse: () => {
      return {};
    },
  };

  describe('call checkRouteGroups()', () => {
    it('with ampty array without throw error', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
      const result = httpBackendService.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    it('with good host as argument should not fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, host: 'https://example.com' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
      const result = httpBackendService.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    it('with bad host as argument should fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, host: 'fake host' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/detect wrong host "fake host"/);
    });

    it('with bad path as argument should fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, path: 'some' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/detect wrong route with path "some"/);
    });

    it('with bad callbackData as argument should fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, callbackData: {} as any }]];
      const msg = `Route callbackData with path "one/two/three/:primaryId" is not a function`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with bad callbackResponse as argument should fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route, callbackResponse: {} as any }]];
      const msg = `Route callbackResponse with path "one/two/three/:primaryId" is not a function`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with correct arguments without fail', () => {
      const routes: ApiMockRouteGroup[] = [[{ ...route }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
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

  describe('call getRootPaths() and findRouteGroupIndex()', () => {
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

  describe('call getRouteDryMatch()', () => {
    let dryMatch: RouteDryMatch | void;
    let routeGroup: ApiMockRouteGroup;
    let url: string;
    let splitedUrl: string[];
    let splitedRoute: string[];
    it('should match an url with primary ID to a route', () => {
      url = 'one/two/three-other/123';
      routeGroup = [{ ...route, path: 'one/two/three/:primaryId' }];
      splitedUrl = ['one', 'two', 'three-other', '123'];
      splitedRoute = ['one', 'two', 'three', ':primaryId'];
      dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
      expect(!!dryMatch).toBeTruthy();
      expect(dryMatch.hasLastRestId).toBeTruthy();
      expect(dryMatch.splitedUrl.toString()).toBe(splitedUrl.toString());
      expect(dryMatch.splitedRoute.toString()).toBe(splitedRoute.toString());
    });

    it('should match an url without primary ID to a route', () => {
      url = 'one/two/three-other';
      routeGroup = [{ ...route, path: 'one/two/three/:primaryId' }];
      splitedUrl = ['one', 'two', 'three-other'];
      splitedRoute = ['one', 'two', 'three'];
      dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
      expect(!!dryMatch).toBeTruthy();
      expect(dryMatch.hasLastRestId).toBeFalsy();
      expect(dryMatch.splitedUrl.toString()).toBe(splitedUrl.toString());
      expect(dryMatch.splitedRoute.toString()).toBe(splitedRoute.toString());
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
      url = 'https://example.com/one/two/123';
      routeGroup = [{ ...route, host: 'https://example.com', path: 'one/two/:primaryId' }];
      splitedUrl = ['https:', '', 'example.com', 'one', 'two', '123'];
      splitedRoute = ['https:', '', 'example.com', 'one', 'two', ':primaryId'];
      dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
      expect(!!dryMatch).toBeTruthy();
      expect(dryMatch.hasLastRestId).toBeTruthy();
      expect(dryMatch.splitedUrl.toString()).toBe(splitedUrl.toString());
      expect(dryMatch.splitedRoute.toString()).toBe(splitedRoute.toString());
    });

    it('should match an url with host and without primary ID to a route', () => {
      url = 'https://example.com/one/two-other';
      routeGroup = [{ ...route, host: 'https://example.com', path: 'one/two/:primaryId' }];
      splitedUrl = ['https:', '', 'example.com', 'one', 'two-other'];
      splitedRoute = ['https:', '', 'example.com', 'one', 'two'];
      dryMatch = httpBackendService.getRouteDryMatch(url, routeGroup) as RouteDryMatch;
      expect(!!dryMatch).toBeTruthy();
      expect(dryMatch.hasLastRestId).toBeFalsy();
      expect(dryMatch.splitedUrl.toString()).toBe(splitedUrl.toString());
      expect(dryMatch.splitedRoute.toString()).toBe(splitedRoute.toString());
    });
  });

  describe('call getResponse()', () => {
    let normalizedUrl: string;
    let pathOfRoute: string;
    let splitedUrl: string[];
    let splitedRoute: string[];
    let hasLastRestId: boolean;
    let routes: ApiMockRouteGroup;
    let data: any;

    describe('url without a host', () => {
      it('should match an url with restId to a route', () => {
        normalizedUrl = 'posts/123';
        pathOfRoute = 'posts/:postId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: pathOfRoute }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('postId');
        expect(data.lastRestId).toBe('123');
        expect(data.parents.length).toBe(0);
      });

      it('should not match an url with restId to a route', () => {
        normalizedUrl = 'posts-other/123';
        pathOfRoute = 'posts/:postId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: pathOfRoute }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });

      it('should match an url without restId to a route', () => {
        normalizedUrl = 'posts';
        pathOfRoute = 'posts';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = false;
        routes = [{ ...route, path: pathOfRoute }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('');
        expect(data.lastRestId).toBe('');
        expect(data.parents.length).toBe(0);
      });

      it('should not match an url without restId to a route', () => {
        normalizedUrl = 'posts-other';
        pathOfRoute = 'posts';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = false;
        routes = [{ ...route, path: pathOfRoute }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });
    });

    describe('url with multi nesting a route path', () => {
      it('should match an url with restId to a route', () => {
        normalizedUrl = 'posts/123/comments/456';
        pathOfRoute = 'posts/:postId/comments/:commentId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('commentId');
        expect(data.lastRestId).toBe('456');
        expect(data.parents.length).toBe(1);
      });

      it('should not match an url with restId to a route', () => {
        normalizedUrl = 'posts/123/comments-other/456';
        pathOfRoute = 'posts/:postId/comments/:commentId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });

      it('should match an url without restId to a route', () => {
        normalizedUrl = 'posts/123/comments';
        pathOfRoute = 'posts/:postId/comments';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = false;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('');
        expect(data.lastRestId).toBe('');
        expect(data.parents.length).toBe(1);
      });

      it('should not match an url without restId to a route', () => {
        normalizedUrl = 'posts/123/comments-other';
        pathOfRoute = 'posts/:postId/comments';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });
    });

    describe('url with host and multi nesting a route path', () => {
      it('should match an url with restId to a route', () => {
        normalizedUrl = 'posts/123/comments/456';
        pathOfRoute = 'posts/:postId/comments/:commentId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('commentId');
        expect(data.lastRestId).toBe('456');
        expect(data.parents.length).toBe(1);
      });

      it('should not match an url with restId to a route', () => {
        normalizedUrl = 'posts/123/comments-other/456';
        pathOfRoute = 'posts/:postId/comments/:commentId';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });

      it('should match an url without restId to a route', () => {
        normalizedUrl = 'posts/123/comments';
        pathOfRoute = 'posts/:postId/comments';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = false;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeTruthy();
        expect(data.primaryKey).toBe('');
        expect(data.lastRestId).toBe('');
        expect(data.parents.length).toBe(1);
      });

      it('should not match an url without restId to a route', () => {
        normalizedUrl = 'posts/123/comments-other';
        pathOfRoute = 'posts/:postId/comments';
        splitedUrl = normalizedUrl.split('/');
        splitedRoute = pathOfRoute.split('/');
        hasLastRestId = true;
        routes = [{ ...route, path: 'posts/:postId' }, { ...route, path: 'comments/:commentId' }];
        data = httpBackendService.getResponse(splitedUrl, splitedRoute, hasLastRestId, routes);
        expect(!!data).toBeFalsy();
      });
    });
  });
});
