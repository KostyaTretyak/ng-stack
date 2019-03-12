import { Injectable } from '@angular/core';
import { Params } from '@angular/router';

export abstract class ApiMockService {
  abstract getRouteGroups(): ApiMockRouteGroup[];
}

/**
 * Interface for InMemoryBackend configuration options
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
   * - `true` - 404 code.
   * - `false` - (default) 204 code - when object-to-delete not found.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  delete404? = false;
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
   */
  post204? = true;
  /**
   * - `true` - should NOT update existing item with `POST`.
   * - `false` - (default) OK to update.
   *
   * Tip:
   * > **409 Conflict**
   *
   * > Indicates that the request could not be processed because of conflict in the current
   * > state of the resource, such as an edit conflict between multiple simultaneous updates.
   */
  post409? = false;
  /**
   * - `true` - (default) 204 code - should NOT return the item after a `POST`.
   * - `false` - 200 code - return the item.
   *
   * Tip:
   * > **204 No Content**
   *
   * > The server successfully processed the request and is not returning any content.
   */
  put204? = true;
  /**
   * - `true` - create new item if `PUT` item with that ID not found.
   * - `false` - (default) should return 404 code.
   */
  put404? = false;

  constructor(apiMockConfig?: ApiMockConfig) {
    Object.assign(this, apiMockConfig || {});
  }
}

/**
 * It is just `{ [key: string]: any }` an object interface.
 */
export interface ObjectAny {
  [key: string]: any;
}

export type CallbackAny = (...params: any[]) => any;

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiMockCallbackData<I extends ObjectAny[] = ObjectAny[], P extends ObjectAny[] = ObjectAny[]> = (
  items?: I,
  itemId?: string,
  httpMethod?: HttpMethod,
  parents?: P,
  queryParams?: Params,
  postBody?: ObjectAny
) => ObjectAny[];

export type ApiMockCallbackResponse<I extends ObjectAny[] = ObjectAny[], P extends ObjectAny[] = ObjectAny[]> = (
  items?: I,
  itemId?: string,
  httpMethod?: HttpMethod,
  parents?: P,
  queryParams?: Params,
  postBody?: ObjectAny
) => any;

export interface ApiMockRoute {
  path: string;
  callbackData: ApiMockCallbackData;
  /**
   * Properties for list items, that returns from `callbackData()`.
   */
  propertiesForList?: ObjectAny;
  callbackResponse: ApiMockCallbackResponse;
}

export type ApiMockRouteRoot = ApiMockRoute & { host?: string };

export type ApiMockRouteGroup = [ApiMockRouteRoot, ...ApiMockRoute[]];

export class CacheData {
  [routeKey: string]: MockData;
}

export type PartialRoutes = Array<{ path: string; length: number; index: number }>;

export class RouteDryMatch {
  splitedUrl: string[];
  splitedRoute: string[];
  hasLastRestId: boolean;
  routes: ApiMockRouteGroup;
}

export interface ResponseParam {
  cacheKey: string;
  route: ApiMockRouteRoot | ApiMockRoute;
  primaryKey?: string;
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
   * Array of composed objects with properties as getters (only read properties).
   *
   * - If HTTP-request have `GET` method without restId, we return this array.
   */
  onlyreadData: ObjectAny[];
}
