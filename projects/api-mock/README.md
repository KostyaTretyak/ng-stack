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
GET api/one/two/three         // endpoint without primary id
```

Supporting any level of nesting routes.

## Basic setup

Source code of this example see
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
        path: 'simple/:id',
        dataCallback: this.getDataCallback(),
      },
    ];
  }

  /**
   * The callback called when URL is like `/simple` or `/simple/3`.
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

### _Notes 1_
The `getDataCallback()` method returns a callback called:
- once if the HTTP request has `httpMethod == 'GET'`.
- twice if the HTTP request has `httpMethod != 'GET'`. The first call automatically comes with `httpMethod == 'GET'` and with an empty array in the `items` argument. The result from the first call is then passed to an array by the `items` argument for further calls with the original HTTP method. That is, for example, if the backend receives a request with the `POST` method, first the callback is called with the `GET` method and then with the `POST` method, and the `items` argument contains the result returned from the first call.
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

## Import the `@ng-stack/api-mock` module

Register `SimpleService` with the `ApiMockModule` in your root `imports` calling the `forRoot` static method with `SimpleService` and an optional configuration object:

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

### _Notes 2_
- Always import the `ApiMockModule` after the `HttpClientModule` to ensure that the `@ng-stack/api-mock` backend provider supersedes the Angular version.
- You can setup the `@ng-stack/api-mock` within a lazy loaded feature module by calling the `.forFeature()` method as you would `.forRoot()`.

## API

```ts
abstract class ApiMockService {
  abstract getRoutes(): ApiMockRootRoute[];
}

interface ApiMockRootRoute extends ApiMockRoute {
  host?: string;
}

interface ApiMockRoute {
  path: string;
  dataCallback?: ApiMockDataCallback;
  /**
   * Properties for a list items that returns from `dataCallback()`.
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

interface ApiMockDataCallbackOptions<I, P> {
  items?: I;
  itemId?: string;
  httpMethod?: HttpMethod;
  parents?: P;
  queryParams?: Params;
  /**
   * Request body.
   */
  reqBody?: any;
}

interface ApiMockResponseCallbackOptions<I, P> extends ApiMockDataCallbackOptions<I, P> {
  /**
   * Response body.
   */
  resBody?: any;
}

type ApiMockDataCallback<I, P> = (opts?: ApiMockDataCallbackOptions<I, P>) => I;

type ApiMockResponseCallback<I, P> = (opts?: ApiMockResponseCallbackOptions<I, P>) => any;
```

## Peer dependencies

Compatible with `@angular/core` >= v4.3.6 and `rxjs` > v6

