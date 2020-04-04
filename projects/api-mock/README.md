# @ng-stack/api-mock

This module is an alternative of [angular-in-memory-web-api](https://github.com/angular/in-memory-web-api).

## Table of contents
- [Use cases](#use-cases)
- [Install](#install)
- [HTTP request handling](#http-request-handling)
- [Basic setup](#basic-setup)
- [Import the `@ng-stack/api-mock` module](#import-the-ng-stackapi-mock-module)

`@ng-stack/api-mock` for Angular demos and tests that emulates CRUD operations over a RESTy API.

It intercepts Angular `HttpClient` requests that would otherwise go to the remote server and redirects them to an `@ng-stack/api-mock` data store that you control.

## Use cases

- An angular application develops faster than the backend API for this application. That is, simulate operations against data collections that aren't yet implemented on your dev/test server. You can pass requests thru to the dev/test server for collections that are supported.

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

At minimum it must implement `getRoutes()` which creates an array whose items are collection routes to return or update. For example:

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

**_Notes_**
- `getDataCallback()` returns a callback that called:
  - once if HTTP requests go with `httpMethod == 'GET'`.
  - twice if HTTP requests go with `httpMethod != 'GET'`. The first call automatically come with `httpMethod == 'GET'` and with `items` as an empty array. Then the result returns in `items` array for the next calls that comes with the original method. For example, if you are requesting a backend with the `POST` method, then the callback is first called with the `GET` method and then with the `POST` method and with `items` returned from the first call.
  - if we have multi-level route like this:
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
  and if request come with URL like this `api/posts/123/comments`, the first will be called `firstCallback()` with `httpMethod == 'GET'`, then item with `postId == 123` will be searched. Then `secondCallback()` will be called according to the algorithm described above in the first two points, but `parents` array with one item, whose `postId == 123`, will be passed to the callback.

## Import the `@ng-stack/api-mock` module

Register your data store service implementation with the `ApiMockModule` in your root `AppModule.imports` calling the `forRoot` static method with this service class and an optional configuration object:

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

**_Notes_**
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
```

## Peer dependencies

Compatible with `@angular/core` >= v4.3.6 and `rxjs` > v6

