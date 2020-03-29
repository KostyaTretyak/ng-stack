import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { Status } from './http-status-codes';
import { pickProperties } from './pick-properties';

export abstract class ApiMockService {
  abstract getRoutes(): ApiMockRootRoute[];
}

/**
 * Interface for `HttpBackendService` configuration options.
 */
@Injectable()
export class ApiMockConfig {
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
   * - `true` - Search match should be case insensitive.
   * - `false` - (default).
   */
  caseSensitiveSearch? = false;
  /**
   * Simulate latency by delaying response (in milliseconds).
   */
  delay? = 500;
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
  /**
   * - `true` - should pass unrecognized request URL through to original backend.
   * - `false` - (default) return 404 code.
   */
  passThruUnknownUrl? = false;
  /**
   * - `true` - (default) 204 code - should NOT return the item after a `POST`.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  postReturn204? = true;
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
   * - `true` - (default) 204 code - should NOT return the item after a `PUT`.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  putReturn204? = true;
  /**
   * - `true` - (default) 404 code - if `PUT` item with that ID not found.
   * - `false` - create new item.
   */
  putNotFound404? = true;

  constructor(apiMockConfig?: ApiMockConfig) {
    pickProperties(this, apiMockConfig as any);
  }
}

/**
 * It is just `{ [key: string]: any }` an object interface.
 */
export interface ObjectAny {
  [key: string]: any;
}

export type CallbackAny = (...params: any[]) => any;

/**
 * For more info, see [HTTP Request methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods)
 */
export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'OPTIONS' | 'CONNECT' | 'PATCH';

export type ApiMockCallbackData<I extends ObjectAny[] = ObjectAny[], P extends ObjectAny[] = ObjectAny[]> = (
  items?: I,
  itemId?: string,
  httpMethod?: HttpMethod,
  parents?: P,
  queryParams?: Params,
  /**
   * Request body.
   */
  reqBody?: any
) => ObjectAny[];

export type ApiMockCallbackResponse<I extends ObjectAny[] = ObjectAny[], P extends ObjectAny[] = ObjectAny[]> = (
  items?: I,
  itemId?: string,
  httpMethod?: HttpMethod,
  parents?: P,
  queryParams?: Params,
  /**
   * Request body.
   */
  reqBody?: any,
  /**
   * Response body.
   */
  resBody?: any
) => any;

export interface ApiMockRoute {
  path: string;
  callbackData?: ApiMockCallbackData;
  /**
   * Properties for a list items that returns from `callbackData()`.
   */
  propertiesForList?: ObjectAny;
  callbackResponse?: ApiMockCallbackResponse;
  refreshLocalStorage?: boolean;
  children?: ApiMockRoute[];
}

export interface ApiMockRootRoute extends ApiMockRoute {
  host?: string;
}

export class CacheData {
  [routeKey: string]: MockData;
}

export type PartialRoutes = Array<{ path: string; length: number; index: number }>;

export class RouteDryMatch {
  splitedUrl: string[];
  splitedRoute: string[];
  routes: ApiMockRoute[];
  hasLastRestId: boolean;
  lastPrimaryKey?: string;
}

/**
 * If we have URL `api/posts/123/comments/456`,
 * we have two "chain params" for `api/posts` and for `api/posts/123/comments`.
 */
export interface ChainParam {
  cacheKey: string;
  route: ApiMockRoute;
  primaryKey: string;
  restId?: string;
}

export class MockData {
  /**
   * Array of full version of items from REST resource,
   * it is a single resource of true for given REST resource.
   *
   * - If HTTP-request have `GET` method with restId, we returns item from this array.
   * - If HTTP-request have `POST`, `PUT`, `PATCH` or `DELETE` method,
   * this actions will be doing with item from this array.
   */
  writeableData: ObjectAny[];
  /**
   * Array of composed objects with properties as getters (readonly properties).
   *
   * - If HTTP-request have `GET` method without restId, we return this array,
   * where items may have reduce version of REST resource.
   */
  readonlyData: ObjectAny[];
}

/**
 * Http Response Options.
 */
export interface ResponseOptions {
  headers: HttpHeaders;
  status: number;
  body?: any;
  statusText?: string;
  url?: string;
}

export interface ResponseOptionsLog {
  status: Status;
  body: any;
  headers?: ObjectAny;
}

export function isFormData(formData: FormData): formData is FormData {
  return FormData !== undefined && formData instanceof FormData;
}
