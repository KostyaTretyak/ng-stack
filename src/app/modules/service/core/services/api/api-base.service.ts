import { HttpClient } from '@angular/common/http';

import { ObjectAny } from 'src/app/types/mix';

export interface ApiResponse<T, M = ObjectAny> {
  data?: T[];
  error?: ObjectAny;
  meta?: M;
}

export abstract class ApiBaseService<T> {
  protected abstract apiBaseUrl = '';

  constructor(protected httpClient: HttpClient) {}

  get(queryParams: ObjectAny = {}) {
    return this.httpClient.get<ApiResponse<T>>(this.apiBaseUrl, { params: queryParams });
  }

  post(body: ObjectAny = {}, queryParams: ObjectAny = {}) {
    return this.httpClient.post<ApiResponse<T>>(this.apiBaseUrl, body, { params: queryParams });
  }

  put(id: number, body = {}, queryParams: ObjectAny = {}) {
    return this.httpClient.put<ApiResponse<T>>(`${this.apiBaseUrl}/${id}`, body, { params: queryParams });
  }

  patch(id: number, body = {}, queryParams: ObjectAny = {}) {
    return this.httpClient.patch<ApiResponse<T>>(`${this.apiBaseUrl}/${id}`, body, { params: queryParams });
  }

  delete(id: number, queryParams: ObjectAny = {}) {
    return this.httpClient.delete<ApiResponse<T>>(`${this.apiBaseUrl}/${id}`, { params: queryParams });
  }

  /**
   * Alias of the method `this.get(params)`.
   */
  findAll(queryParams: ObjectAny = {}) {
    return this.get(queryParams);
  }

  findOne(id: number, queryParams: ObjectAny = {}) {
    return this.httpClient.get<ApiResponse<T>>(`${this.apiBaseUrl}/${id}`, { params: queryParams });
  }
}
