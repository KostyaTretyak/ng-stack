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
  showApiMockLog? = true;
  /**
   * false (default) if search match should be case insensitive
   */
  caseSensitiveSearch? = false;
  /**
   * simulate latency by delaying response
   * delay (in ms) to simulate latency
   */
  delay? = 500;
  /**
   * don't complain if can't find entity to delete
   * false (default) should 204 when object-to-delete not found; true: 404
   */
  delete404? = false;
  /**
   * 404 if can't process URL
   * false (default) should pass unrecognized request URL through to original backend; true: 404
   */
  passThruUnknownUrl? = false;
  /**
   * don't return the item after a POST
   * true (default) should NOT return the item (204) after a POST. false: return the item (200).
   */
  post204? = true;
  /**
   * don't update existing item with that ID
   * false (default) should NOT update existing item with POST. false: OK to update.
   */
  post409? = false;
  /**
   * don't return the item after a PUT
   * true (default) should NOT return the item (204) after a POST. false: return the item (200).
   */
  put204? = true;
  /**
   * create new item if PUT item with that ID not found
   * false (default) if item not found, create as new item; false: should 404.
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
  queryParams?: Params
) => ObjectAny[];

export type ApiMockCallbackResponse<I extends ObjectAny[] = ObjectAny[], P extends ObjectAny[] = ObjectAny[]> = (
  items?: I,
  itemId?: string,
  httpMethod?: HttpMethod,
  parents?: P,
  queryParams?: Params
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

export interface GetDataParam {
  cacheKey: string;
  primaryKey?: string;
  restId?: string;
  route: ApiMockRouteRoot | ApiMockRoute;
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
