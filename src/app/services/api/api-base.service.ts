import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiHeaders, ApiQueryParams } from 'src/app/types/api';
import { ObjectAny, PrimaryKeys } from 'src/app/types/mix';

export interface ApiResponse<T, M = ObjectAny> {
  data?: T[];
  error?: ObjectAny;
  meta?: M;
}

@Injectable()
export abstract class ApiBaseService<T> {
  protected abstract readonly routePath: string;

  constructor(protected httpClient: HttpClient) {}

  get(primaryKeys?: PrimaryKeys, queryParams?: ApiQueryParams, headers?: ApiHeaders) {
    const url = this.getUrl(primaryKeys);
    return this.httpClient.get<ApiResponse<T>>(url, { params: queryParams, headers });
  }

  post(primaryKeys: PrimaryKeys, body: ObjectAny, queryParams?: ApiQueryParams, headers?: ApiHeaders) {
    const url = this.getUrl(primaryKeys);
    return this.httpClient.post<ApiResponse<T>>(url, body, { params: queryParams, headers });
  }

  put(primaryKeys: PrimaryKeys, body: ObjectAny, queryParams?: ApiQueryParams, headers?: ApiHeaders) {
    const url = this.getUrl(primaryKeys);
    return this.httpClient.put<ApiResponse<T>>(url, body, { params: queryParams, headers });
  }

  patch(primaryKeys: PrimaryKeys, body: ObjectAny, queryParams?: ApiQueryParams, headers?: ApiHeaders) {
    const url = this.getUrl(primaryKeys);
    return this.httpClient.patch<ApiResponse<T>>(url, body, { params: queryParams, headers });
  }

  delete(primaryKeys: PrimaryKeys, queryParams?: ApiQueryParams, headers?: ApiHeaders) {
    const url = this.getUrl(primaryKeys);
    return this.httpClient.delete<ApiResponse<T>>(url, { params: queryParams, headers });
  }

  getUrl(primaryKeys: ObjectAny): string {
    this.checkRoutePath(this.routePath, primaryKeys);
    return this.makeUrl(this.routePath, primaryKeys);
  }

  protected checkRoutePath(routePath: string, primaryKeys: PrimaryKeys = {}): void {
    const noEmptyPks = {};
    for (const pk of Object.keys(primaryKeys)) {
      const value = primaryKeys[pk];
      if (value !== undefined) {
        noEmptyPks[pk] = value;
      }
    }
    const splitedRoutePath = routePath.split('/');
    if (splitedRoutePath[splitedRoutePath.length - 1].charAt(0) != ':') {
      throw new Error(`Last path in a route "${routePath}" must be a Primary Key`);
    }

    const arrPk = splitedRoutePath.filter(str => str.charAt(0) == ':').map(str => str.slice(1));
    for (let i = 0; i < arrPk.length; i++) {
      const isLastPk = i + 1 == arrPk.length;
      const pk = arrPk[i];
      const countOfParams = Object.keys(noEmptyPks).length;
      if (!noEmptyPks[pk] && (!isLastPk || countOfParams >= arrPk.length)) {
        const msg =
          `For route path "${routePath}" not found value with Primary Key "${pk}", ` +
          `searched in parameters: ${JSON.stringify(noEmptyPks)}`;
        throw new Error(msg);
      }
    }
  }

  protected makeUrl(routePath: string, primaryKeys: PrimaryKeys = {}): string {
    const url = routePath
      .split('/')
      .map(routeSegment => {
        for (const pk of Object.keys(primaryKeys)) {
          if (routeSegment == `:${pk}`) {
            return primaryKeys[pk];
          }
        }
        return routeSegment;
      })
      .join('/');

    const splitedRoutePath = url.split('/');

    // Remove last restId or "/" symbol.
    const lastChar = splitedRoutePath[splitedRoutePath.length - 1].charAt(0);
    if (lastChar == ':' || lastChar == '') {
      return splitedRoutePath.slice(0, -1).join('/');
    }
    return splitedRoutePath.join('/');
  }
}
