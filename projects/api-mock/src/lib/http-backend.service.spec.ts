import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HttpBackendService } from './http-backend.service';
import { MockRouteGroup, MockData, ApiMockService } from './types';
import { ApiMockModule } from './api-mock.module';

fdescribe('HttpBackendService', () => {
  /**
   * Make all properties this class with public data accessor.
   */
  @Injectable()
  class HttpBackendService2 extends HttpBackendService {
    init() {
      return super.init();
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

  let mockDataInterceptor: HttpBackendService2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApiMockModule.forRoot(MyApiMockService)],
      providers: [HttpBackendService2],
    });

    mockDataInterceptor = TestBed.get(HttpBackendService2);
  });

  it('should DI create instance of HttpBackendService', () => {
    expect(mockDataInterceptor instanceof HttpBackendService2).toBeTruthy();
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
    it('with no argument should fail', () => {
      const msg = `Cannot read property 'forEach' of undefined`;
      expect(() => (mockDataInterceptor as any).checkRouteGroups()).toThrowError(msg);
    });

    it('with ampty array and without throw error', () => {
      const routes: MockRouteGroup[] = [[{ ...route }]];
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).not.toThrow();
      const result = mockDataInterceptor.checkRouteGroups(routes);
      expect(result).toEqual(routes);
    });

    it('with good host as argument should not fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, host: 'https://example.com' }]];
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).not.toThrow();
    });

    it('with bad host as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, host: 'fake host' }]];
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).toThrowError(/detect wrong host "fake host"/);
    });

    it('with bad path as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, path: 'some' }]];
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).toThrowError(/detect wrong route with path "some"/);
    });

    it('with bad callbackData as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, callbackData: {} as any }]];
      const msg = `Route callbackData with path "one/two/three/:primaryId" is not a function`;
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with bad callbackResponse as argument should fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route, callbackResponse: {} as any }]];
      const msg = `Route callbackResponse with path "one/two/three/:primaryId" is not a function`;
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).toThrowError(msg);
    });

    it('with correct arguments without fail', () => {
      const routes: MockRouteGroup[] = [[{ ...route }]];
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).not.toThrow();
    });

    it('with duplicate root path as arguments with fail', () => {
      const routes: MockRouteGroup[] = [
        [{ ...route }],
        [{ ...route, path: 'four/five/six/:primaryId' }],
        [{ ...route }],
      ];
      const msg = `ApiMockModule detect duplicate route with path: "/one/two/three/"`;
      expect(() => mockDataInterceptor.checkRouteGroups(routes)).toThrowError(msg);
    });
  });

  describe('call init()', () => {
    it('with no argument should fail', () => {
      const msg = `Cannot read property 'forEach' of undefined`;
      expect(() => (mockDataInterceptor as any).checkRouteGroups()).toThrowError(msg);
    });
  });
});
