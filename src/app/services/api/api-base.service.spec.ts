import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ObjectAny } from 'src/app/types/mix';
import { ApiBaseService, ApiResponse } from './api-base.service';

interface RestResource {
  id: number;
  name: string;
}

const apiBaseUrl = '/api/api-base-service';

@Injectable()
class TestService extends ApiBaseService<RestResource> {
  routePath = `${apiBaseUrl}/:id`;

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  checkRoutePath(routePath: string, params: ObjectAny = {}) {
    return super.checkRoutePath(routePath, params);
  }

  makeUrl(routePath: string, primaryKeys: ObjectAny = {}) {
    return super.makeUrl(routePath, primaryKeys);
  }
}

describe('ApiBaseService', () => {
  let testService: TestService;
  let httpTestingController: HttpTestingController;
  let expectedData: RestResource[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TestService],
    });

    testService = TestBed.inject(TestService);
    httpTestingController = TestBed.inject(HttpTestingController);
    expectedData = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ];
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('checkRoutePath', () => {
    it('should to throw error when route path not have last restId', () => {
      const routePath = '/api/posts/:postId/comments';
      expect(() => testService.checkRoutePath(routePath)).toThrowError(
        'Last path in a route "/api/posts/:postId/comments" must be a Primary Key'
      );
    });

    it('should to throw error when not passing first param and when exists second param', () => {
      const routePath = '/api/posts/:postId/comment/:commentIds';
      const msg =
        'For route path "/api/posts/:postId/comment/:commentIds" not found value ' +
        'with Primary Key "postId", searched in parameters: {"commentId":1}';
      expect(() => testService.checkRoutePath(routePath, { commentId: 1 })).toThrowError(msg);
    });

    it('should to throw error when not passing last param', () => {
      const routePath = '/api/posts/:postId/comment/:commentIds';
      const msg =
        'For route path "/api/posts/:postId/comment/:commentIds" not found value ' +
        'with Primary Key "commentIds", searched in parameters: {"postId":1,"someElse":2}';
      expect(() => testService.checkRoutePath(routePath, { postId: 1, someElse: 2 })).toThrowError(msg);
    });

    it('should not to throw error during passing correct one param', () => {
      const routePath = '/api/posts/:postId/comments/:commentId';
      expect(() => testService.checkRoutePath(routePath, { postId: 1 })).not.toThrow();
    });

    it('should not to throw error during passing correct one param and one level route path', () => {
      const routePath = '/api/posts/:postId';
      expect(() => testService.checkRoutePath(routePath, { postId: 1 })).not.toThrow();
    });

    it('should not to throw error during passing one param with undefined value and one level route path', () => {
      const routePath = '/api/posts/:postId';
      expect(() => testService.checkRoutePath(routePath, { postId: undefined })).not.toThrow();
    });

    it('should not to throw error during not passing param and one level route path', () => {
      const routePath = '/api/posts/:postId';
      expect(() => testService.checkRoutePath(routePath)).not.toThrow();
    });
  });

  describe('makeUrl()', () => {
    it('case 1', () => {
      const routePath = '/api/posts/:postId/comments/:commentId';
      const url = testService.makeUrl(routePath);
      expect(url).toEqual('/api/posts/:postId/comments');
    });

    it('case 2', () => {
      const routePath = '/api/posts/:postId/comments/:commentId';
      const url = testService.makeUrl(routePath, { postId: 1 });
      expect(url).toEqual('/api/posts/1/comments');
    });

    it('case 3', () => {
      const routePath = '/api/posts/:postId/comments/:commentId';
      const url = testService.makeUrl(routePath, { postId: 1, commentId: 2 });
      expect(url).toEqual('/api/posts/1/comments/2');
    });

    it('case 4', () => {
      const routePath = '/api/posts/:postId/comments/:commentId';
      const url = testService.makeUrl(routePath, { postId: 1, otherId: 2 });
      expect(url).toEqual('/api/posts/1/comments');
    });

    it('case 5', () => {
      const routePath = '/api/posts/:postId';
      const url = testService.makeUrl(routePath, { postId: undefined });
      expect(url).toEqual('/api/posts');
    });
  });

  it('should DI create instance of TestService', () => {
    expect(testService instanceof TestService).toBeTruthy();
  });

  it(`should get() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    testService.get().subscribe(res => {
      expect(res.data).toEqual(expectedData, 'should return expected data');
      expect(res.error).toEqual(undefined, 'should not have error property');
    }, fail);

    // testService should have made one request to GET data from expected URL
    const req = httpTestingController.expectOne({ url: apiBaseUrl, method: 'GET' });

    // Respond with the mock data
    const apiResponse: ApiResponse<RestResource> = { data: expectedData };
    req.flush(apiResponse);
  });

  it(`should get() return expected queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    testService.get({}, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res.data).toEqual(expectedData, 'should return expected data');
      expect(res.error).toEqual(undefined, 'should not have error property');
    }, fail);

    // testService should have made one request to GET data from expected URL
    const url = `${apiBaseUrl}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'GET' });

    // Respond with the mock data
    const apiResponse: ApiResponse<RestResource> = { data: expectedData };
    req.flush(apiResponse);
  });

  it(`should get() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.get().subscribe(
      () => fail(`should get() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: apiBaseUrl, method: 'GET' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });

  it(`should post() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    testService.post({}, expectedData).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to POST data from expected URL
    const req = httpTestingController.expectOne({ url: apiBaseUrl, method: 'POST' });
    expect(req.request.body).toEqual(expectedData);

    req.flush(null);
  });

  it(`should post() return expected body and queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const body = { bodyData: 'some data' };

    testService.post({}, body, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to POST data from expected URL
    const url = `${apiBaseUrl}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'POST' });

    expect(req.request.body).toEqual(body);
    req.flush(null);
  });

  it(`should post() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.post({}, {}).subscribe(
      () => fail(`should post() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: apiBaseUrl, method: 'POST' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });

  it(`should put() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 4;

    testService.put({ id }, expectedData).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to PUT data from expected URL
    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'PUT' });

    expect(req.request.body).toEqual(expectedData);
    req.flush(null);
  });

  it(`should put() return expected body and queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 3;
    const body = { bodyData: 'some data' };

    testService.put({ id }, body, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to PUT data from expected URL
    const url = `${apiBaseUrl}/${id}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'PUT' });

    expect(req.request.body).toEqual(body);
    req.flush(null);
  });

  it(`should put() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 2;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.put({ id }, {}).subscribe(
      () => fail(`should put() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'PUT' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });

  it(`should patch() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 4;

    testService.patch({ id }, expectedData).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to PATCH data from expected URL
    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'PATCH' });

    expect(req.request.body).toEqual(expectedData);
    req.flush(null);
  });

  it(`should patch() return expected body and queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 3;
    const body = { bodyData: 'some data' };

    testService.patch({ id }, body, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res).toEqual(null, 'should return expected data');
    }, fail);

    // testService should have made one request to PATCH data from expected URL
    const url = `${apiBaseUrl}/${id}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'PATCH' });

    expect(req.request.body).toEqual(body);
    req.flush(null);
  });

  it(`should patch() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 2;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.patch({ id }, {}).subscribe(
      () => fail(`should patch() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'PATCH' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });

  it(`should delete() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 4;

    testService.delete({ id }).subscribe(res => {
      expect(res).toEqual(null, 'should return null');
    }, fail);

    // testService should have made one request to DELETE data from expected URL
    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'DELETE' });

    req.flush(null);
  });

  it(`should delete() return expected body and queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 3;

    testService.delete({ id }, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res).toEqual(null, 'should return null');
    }, fail);

    // testService should have made one request to DELETE data from expected URL
    const url = `${apiBaseUrl}/${id}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'DELETE' });

    req.flush(null);
  });

  it(`should delete() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 2;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.delete({ id }).subscribe(
      () => fail(`should delete() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'DELETE' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });

  it(`should get() return expected data (called once)`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 4;

    testService.get({ id }).subscribe(res => {
      expect(res.data).toEqual(expectedData, 'should return expected data');
      expect(res.error).toEqual(undefined, 'should not have error property');
    }, fail);

    // testService should have made one request to GET data from expected URL
    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'GET' });

    // Respond with the mock data
    const apiResponse: ApiResponse<RestResource> = { data: expectedData };
    req.flush(apiResponse);
  });

  it(`should get() return expected body and queryParams`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 3;

    testService.get({ id }, { some: 'test-data', other: 'test2' }).subscribe(res => {
      expect(res.data).toEqual(expectedData, 'should return expected data');
      expect(res.error).toEqual(undefined, 'should not have error property');
    }, fail);

    // testService should have made one request to GET data from expected URL
    const url = `${apiBaseUrl}/${id}?some=test-data&other=test2`;
    const req = httpTestingController.expectOne({ url, method: 'GET' });

    // Respond with the mock data
    const apiResponse: ApiResponse<RestResource> = { data: expectedData };
    req.flush(apiResponse);
  });

  it(`should get() return 404 error`, () => {
    testService.routePath = `${apiBaseUrl}/:id`;
    const id = 2;
    const mockError = { status: 404, statusText: 'Not Found' };
    const apiResponse = { message: 'deliberate 404 error' };

    testService.get({ id }).subscribe(
      () => fail(`should get() have failed with the 404 error`),
      (res: HttpErrorResponse) => {
        expect(res.status).toEqual(mockError.status, 'status');
        expect(res.statusText).toEqual(mockError.statusText, 'statusText');
        expect(res.error).toEqual(apiResponse, 'error');
      }
    );

    const req = httpTestingController.expectOne({ url: `${apiBaseUrl}/${id}`, method: 'GET' });

    // Respond with mock error
    req.flush(apiResponse, mockError);
  });
});
