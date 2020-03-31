# @ng-stack/api-mock

This module is an alternative of [angular-in-memory-web-api](https://github.com/angular/in-memory-web-api).

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

## Usage

See example of usage in [simple service](https://github.com/KostyaTretyak/ng-stack/blob/master/src/app/services/api/api-mock/simple.service.ts)

## Peer dependencies

Compatible with `@angular/core` >= v4.3.6 and `rxjs` > v6

