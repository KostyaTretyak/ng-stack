import { Injectable } from '@angular/core';

export abstract class ApiMockService {
  abstract getRouteGroups(): MockRouteGroup[];
}

/**
 * Interface for InMemoryBackend configuration options
 */
@Injectable()
export class ApiMockConfig {
  showFakeApiLog? = true;
  /**
   * false (default) if search match should be case insensitive
   */
  caseSensitiveSearch? = false;
  /**
   * do NOT wrap content within an object with a `data` property
   *
   * false (default) put content directly inside the response body.
   * true: encapsulate content in a `data` property inside the response body, `{ data: ... }`.
   */
  dataEncapsulation? = false;
  /**
   * simulate latency by delaying response
   * delay (in ms) to simulate latency
   */
  delay? = 800;
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

export interface ObjectAny {
  [key: string]: any;
}

export class MockDataCache {
  [routeKey: string]: MockData;
}

export type MockCallbackData<P extends ObjectAny[] = ObjectAny[]> = (restId?: string, parents?: P) => MockData;

export class MockData {
  /**
   * Array of full version of REST resource,
   * it is a single resource of true for given REST resource.
   */
  writeableData: any[];
  /**
   * Array of composed objects with properties as getters (only read properties).
   */
  onlyreadData: any[];
}

export type MockCallbackResponse<P extends ObjectAny[] = ObjectAny[]> = (
  mockData: MockData,
  primaryKey?: string,
  restId?: string,
  parents?: P,
  queryParams?: ObjectAny
) => any;

export interface MockRoute {
  path: string;
  callbackData: MockCallbackData;
  callbackResponse: MockCallbackResponse;
}

export type MockRouteRoot = MockRoute & { host?: string };

export type MockRouteGroup = [MockRouteRoot, ...MockRoute[]];

export type MockRootRoutes = Array<{ path: string; length: number; index: number }>;

export interface GetDataReturns {
  routeIndex: number;
  mockData: MockData;
  parents: MockData[];
  primaryKey: string;
  lastRestId: string;
}

export class RouteDryMatch {
  splitedUrl: string[];
  splitedRoute: string[];
  hasLastRestId: boolean;
  route: MockRoute | MockRouteRoot;
  routeIndex: number;
}
