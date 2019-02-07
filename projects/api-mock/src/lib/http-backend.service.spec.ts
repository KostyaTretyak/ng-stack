import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HttpBackendService } from './http-backend.service';
import { MockRouteGroup, MockData, ApiMockService } from './types';
import { ApiMockModule } from './api-mock.module';

describe('HttpBackendService', () => {
  /**
   * Make all properties this class with public data accessor.
   */
  @Injectable()
  class HttpBackendService2 extends HttpBackendService {
    getRootPaths(routeGroups: MockRouteGroup[]) {
      return super.getRootPaths(routeGroups);
    }

    checkRouteGroups(routes: MockRouteGroup[]) {
      return super.checkRouteGroups(routes);
    }

    getResponses(normalizedUrl: string, routeGroup: MockRouteGroup) {
      return super.getResponses(normalizedUrl, routeGroup);
    }
  }

  class MyApiMockService extends ApiMockService {
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

  const route = {
    path: 'one/two/three/:primaryId',
    callbackData: () => {
      return {} as MockData;
    },
    callbackResponse: () => {
      return;
    },
  };

  describe('call checkRouteGroups()', () => {
    it('with ampty array without throw error', () => {
      const routes: MockRouteGroup[] = [[{ ...route }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
      const result = httpBackendService.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    it('with good host as argument should not fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, host: 'https://example.com' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
      const result = httpBackendService.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    it('with bad host as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, host: 'fake host' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/detect wrong host "fake host"/);
    });

    it('with bad path as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, path: 'some' }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(/detect wrong route with path "some"/);
    });

    it('with bad callbackData as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, callbackData: {} as any }]];
      const msg = `Route callbackData with path "one/two/three/:primaryId" is not a function`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with bad callbackResponse as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, callbackResponse: {} as any }]];
      const msg = `Route callbackResponse with path "one/two/three/:primaryId" is not a function`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with correct arguments without fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route }]];
      expect(() => httpBackendService.checkRouteGroups(routes)).not.toThrow();
    });

    it('with duplicate root path as arguments with fail', () => {
      const routes: MockRouteGroup[] = [
        [{ ...route }],
        [{ ...route, path: 'four/five/six/:primaryId' }],
        [{ ...route }],
      ];
      const msg = `ApiMockModule detect duplicate route with path: "/one/two/three/"`;
      expect(() => httpBackendService.checkRouteGroups(routes)).toThrowError(msg);
    });
  });

  describe('call getRootPaths()', () => {
    it('should sort root path by length with revert order', () => {
      const routes: MockRouteGroup[] = [
        [{ ...route, path: 'one/:primaryId' }],
        [{ ...route, path: 'one/two/:primaryId' }],
        [{ ...route, path: 'one/two/three/four/five/six/seven/:primaryId' }],
        [{ ...route, path: 'one/two/three/four/five/six/:primaryId' }],
        [{ ...route, path: 'one/two/three/:primaryId' }],
        [{ ...route, path: 'one/two/three/four/:primaryId' }],
        [{ ...route, path: 'one/two/three/four/five/:primaryId' }],
      ];
      const rootRoutes = httpBackendService.getRootPaths(routes);
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
  });
});
