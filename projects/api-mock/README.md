# @ng-stack/api-mock

This module is an alternative of [angular-in-memory-web-api](https://github.com/angular/in-memory-web-api), it's intended for Angular demos and tests that simulates CRUD operations over a RESTy API. It intercepts Angular `HttpClient` requests that would otherwise go to the remote server and redirects them to an `@ng-stack/api-mock` data store that you control.

You can also view the [Ukrainian version of the documentation](./README.uk.md).

## Table of contents
- [Use cases](#use-cases)
- [Install](#install)
- [HTTP request handling](#http-request-handling)
- [Basic setup](#basic-setup)
- [Import the `@ng-stack/api-mock` module](#import-the-ng-stackapi-mock-module)
- [API](#api)
  - [ApiMockService and ApiMockRoute](#apimockservice-and-apimockroute)
  - [dataCallback](#datacallback)
  - [responseCallback](#responsecallback)
  - [ApiMockConfig](#apimockconfig)

## Use cases

- When Angular applications are developed faster than the API backend for these applications. This module allows you to simulate the data as if they were on the backend. Later, when the required functionality is implemented on a real dev/test server, this module can be switched off seamlessly, thus directing requests to the real backend.
- Demo apps that need to simulate CRUD data persistence operations without a real server. You won't have to build and start a test server.
- Whip up prototypes and proofs of concept.
- Share examples with the community in a web coding environment such as [StackBlitz](https://stackblitz.com/) or [CodePen](https://codepen.io/). Create Angular issues and StackOverflow answers supported by live code.
- Write unit test apps that read and write data. Avoid the hassle of intercepting multiple http calls and manufacturing sequences of responses. The `@ng-stack/api-mock` data store resets for each test so there is no cross-test data pollution.
- End-to-end tests. If you can toggle the app into test mode using the `@ng-stack/api-mock`, you won't disturb the real database. This can be especially useful for CI (continuous integration) builds.

## Install

```bash
npm i -D @ng-stack/api-mock
```

OR

```bash
yarn add -D @ng-stack/api-mock
```

where switch `-D` mean - "save to devDependencies in package.json".

## HTTP request handling

`@ng-stack/api-mock` processes an HTTP request and returns an `Observable` of HTTP `Response` object in the manner of a RESTy web api.

Examples:

```text
GET api/posts                 // all posts
GET api/posts/42              // the post with id=42
GET api/posts/42/comments     // all comments of post with id=42
GET api/authors/10/books/3    // a book with id=3 whose author has id=10
GET api/one/two/three         // endpoint without primary key
```

Supporting any level of nesting routes.

## Basic setup

> Source code of this example see
on [github](https://github.com/KostyaTretyak/angular-example-simple-service)
or on [stackblitz](https://stackblitz.com/github/KostyaTretyak/angular-example-simple-service)

Create `SimpleService` class that implements `ApiMockService`.

At minimum it must implement `getRoutes()` which returns an array whose items are collection routes to return or update.
For example:

```ts
import { ApiMockService, ApiMockDataCallback, ApiMockRootRoute } from '@ng-stack/api-mock';

interface Model {
  id: number;
  name: string;
}

export class SimpleService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/heroes/:id',
        dataCallback: this.getDataCallback(),
      },
    ];
  }

  /**
   * The callback called when URL is like `api/heroes` or `api/heroes/3`.
   */
  private getDataCallback(): ApiMockDataCallback<Model[]> {
    return ({ httpMethod, items }) => {
      if (httpMethod == 'GET') {
        return [
          { id: 1, name: 'Windstorm' },
          { id: 2, name: 'Bombasto' },
          { id: 3, name: 'Magneta' },
          { id: 4, name: 'Tornado' },
        ];
      } else {
        return items;
      }
    };
  }
}
```

## Import the `@ng-stack/api-mock` module

Register `SimpleService` with the `ApiMockModule` in your `imports` array calling the `forRoot` static method with `SimpleService` and an optional configuration object:

```ts
import { NgModule } from '@angular/core';
import { ApiMockModule } from '@ng-stack/api-mock';
import { environment } from '../environments/environment';
import { SimpleService } from './simple.service';

const apiMockModule = ApiMockModule.forRoot(SimpleService, { delay: 1000 });

@NgModule({
  // ...
  imports: [
    HttpClientModule,
    !environment.production ? apiMockModule : []
    // ...
  ],
  // ...
})
export class AppModule { }
```

### _Notes 1_
- Always import the `ApiMockModule` after the `HttpClientModule` to ensure that the `@ng-stack/api-mock` backend provider supersedes the Angular version.
- You can setup the `@ng-stack/api-mock` within a lazy loaded feature module by calling the `.forFeature()` method as you would `.forRoot()`.

## API

### ApiMockService and ApiMockRoute

```ts
abstract class ApiMockService {
  abstract getRoutes(): ApiMockRootRoute[];
}
```

The `ApiMockService` is an interface that must be implemented by any` @ng-stack/api-mock` service. For example:

```ts
class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [{ path: 'api/login' }];
  }
}
```

If we look at the definition of the `ApiMockRootRoute` interface,
we will see that it differs from the `ApiMockRoute` interface only by having the `host` property:

```ts
interface ApiMockRootRoute extends ApiMockRoute {
  host?: string;
}

interface ApiMockRoute {
  path: string;
  dataCallback?: ApiMockDataCallback;
  /**
   * Properties for a list items that returns from `dataCallback()`, but
   * you need init this properties: `propertiesForList: { firstProp: null, secondProp: null }`.
   */
  propertiesForList?: ObjectAny;
  responseCallback?: ApiMockResponseCallback;
  /**
   * You can store almost all mockData in localStorage, but with exception of store
   * from individual routes with `ignoreDataFromLocalStorage == true`.
   *
   * By default `ignoreDataFromLocalStorage == false`.
   */
  ignoreDataFromLocalStorage?: boolean;
  children?: ApiMockRoute[];
}
```

So, if you use all the possible properties for a route, it will look something like this:

```ts
class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        host: 'https://example.com',
        path: 'api/posts/:postId',
        dataCallback: ({ items }) => items.length ? items : [{ postId: 1, body: 'one' }, { postId: 2, body: 'two' }],
        propertiesForList: { body: null },
        responseCallback: ({ resBody }) => resBody,
        ignoreDataFromLocalStorage: false,
        children: []
      }
    ];
  }
}
```

Where `:postId` indicates that this key should be used as the "primary key" for the items returned from `dataCallback` function.
And `propertiesForList` contains an object with initialized properties,
it is used for the list of items returned from `dataCallback` function.

In the example above, the `dataCallback` function returns items with type `{ postId: number, body: string }`,
and if we have a request with a `URL == '/api/posts/1'`, the response returned in the `resBody` argument will have type `{ postId: number, body: string }`.

But if we have a request with a `URL == '/api/posts'` (without primary key),
the response returned in the `resBody` argument will have type `{ body: string }`
because we have `propertiesForList: { body: null }` in the route.

### dataCallback

The `dataCallback` it's property of `ApiMockRoute` that contains function, and it's called:
- once if the HTTP request has `httpMethod == 'GET'`.
- twice if the HTTP request has `httpMethod != 'GET'`. The first call automatically comes with `httpMethod == 'GET'` and with an empty array in the `items` argument. The result from the first call is then passed to an array by the `items` argument with **mutable** elements for further calls with the original HTTP method. That is, for example, if the backend receives a request with the `POST` method, first the callback is called with the `GET` method and then with the `POST` method, and the `items` argument contains the result returned from the first call.
- if we have a nesting route, for example:
  ```ts
  {
    path: 'api/posts/:postId',
    dataCallback: firstCallback,
    children: [
      {
        path: 'comments/:commentId',
        dataCallback: secondCallback
      }
    ]
  }
  ```
  and if the request comes with `URL == 'api/posts/123/comments'`, it will first call `firstCallback()` with `httpMethod == 'GET'`, then in result of this call will search for the item with `postId == 123`. Then `secondCallback()` will be called according to the algorithm described in the first two points, but with the `parents` argument, where there will be an array with one element `postId == 123`.

If your route does not have the `dataCallback` property and not have `responseCallback` property, and not have primary key in the `path`, you will always receive `{ status: 200 }` as response.

The `dataCallback` property must contain a function of the following type:

```ts
/**
 * Simplified version.
 */
type ApiMockDataCallback<I, P> = (opts?: ApiMockDataCallbackOptions<I, P>) => I;
/**
 * Simplified version.
 */
interface ApiMockDataCallbackOptions<I, P> {
  httpMethod?: HttpMethod;
  items?: I;
  itemId?: string;
  parents?: P;
  queryParams?: Params;
  /**
   * Request body.
   */
  reqBody?: any;
}
```

So, if you use all the possible properties for `ApiMockDataCallbackOptions`, it will look something like this:

```ts
export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/heroes/:id',
        dataCallback: ({ httpMethod, items, itemId, parents, queryParams, reqBody }) => [],
      },
    ];
  }
}
```

### responseCallback

The `responseCallback` it's property of `ApiMockRoute` that contains function, and it's called after call `dataCallback`.

This property must contain a function of the following type:

```ts
/**
 * Simplified version.
 */
type ApiMockResponseCallback<I, P> = (opts?: ApiMockResponseCallbackOptions<I, P>) => any;

/**
 * Simplified version.
 */
interface ApiMockResponseCallbackOptions<I, P> extends ApiMockDataCallbackOptions<I, P> {
  /**
   * Response body.
   */
  resBody?: any;
}
```

So, if you use all the possible properties for `ApiMockResponseCallbackOptions`, it will look something like this:

```ts
export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/login',
        responseCallback: ({ httpMethod, items, itemId, parents, queryParams, reqBody, resBody }) => [],
      },
    ];
  }
}
```

The data returned by the `responseCallback` function is then substituted as a `body` property in the HTTP response. The exception to this rule applies to data of type `HttpResponse` or `HttpErrorResponse`, this data return as is - without changes.

For example:

```ts
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiMockService, ApiMockRootRoute, ApiMockResponseCallback } from '@ng-stack/api-mock';

export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/login',
        responseCallback: this.getResponseCallback(),
      },
    ];
  }

  private getResponseCallback(): ApiMockResponseCallback {
    return ({ reqBody }) => {
      const { login, password } = reqBody;

      if (login != 'admin' || password != 'qwerty') {
        return new HttpErrorResponse({
          url: 'api/login',
          status: 400,
          statusText: 'some error message',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          error: 'other description',
        });
      }
    };
  }
}
```

### ApiMockConfig

The `ApiMockConfig` defines a set of options for `ApiMockModule`. Add them as the second `forRoot` argument:

```ts
ApiMockModule.forRoot(SimpleService, { delay: 1000 });
```

Read the `ApiMockConfig` class to learn about these options:

```ts
class ApiMockConfig {
  /**
   * - `true` - should pass unrecognized request URL through to original backend.
   * - `false` - (default) return 404 code.
   */
  passThruUnknownUrl? = false;
  /**
   * - Do you need to clear previous console logs?
   *
   * Clears logs between previous route `NavigationStart` and current `NavigationStart` events.
   */
  clearPrevLog? = false;
  showLog? = true;
  cacheFromLocalStorage? = false;
  /**
   * By default `apiMockCachedData`.
   */
  localStorageKey? = 'apiMockCachedData';
  /**
   * Simulate latency by delaying response (in milliseconds).
   */
  delay? = 500;
  /**
   * - `true` - (default) 204 code - should NOT return the item after a `POST` an item with existing ID.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  postUpdate204? = true;
  /**
   * - `true` - 409 code - should NOT update existing item with `POST`.
   * - `false` - (default) 200 code - OK to update.
   *
   * Tip:
   * > **409 Conflict**
   *
   * > Indicates that the request could not be processed because of conflict in the current
   * > state of the resource, such as an edit conflict between multiple simultaneous updates.
   */
  postUpdate409? = false;
  /**
   * - `true` - (default) 204 code - should NOT return the item after a `PUT` an item with existing ID.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  putUpdate204? = true;
  /**
   * - `true` - (default) 404 code - if `PUT` item with that ID not found.
   * - `false` - create new item.
   */
  putUpdate404? = true;
  /**
   * - `true` - (default) 204 code - should NOT return the item after a `PATCH` an item with existing ID.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  patchUpdate204? = true;
  /**
   * - `true` - (default) 404 code - if item with that ID not found.
   * - `false` - 204 code.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  deleteNotFound404? = true;
}
```

## Peer dependencies

Compatible with `@angular/core` >= v4.3.6 and `rxjs` > v6

