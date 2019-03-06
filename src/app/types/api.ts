import { HttpHeaders, HttpParams } from '@angular/common/http';

export type ApiQueryParams =
  | HttpParams
  | {
      [param: string]: string | string[];
    };

export type ApiHeaders =
  | HttpHeaders
  | {
      [header: string]: string | string[];
    };
