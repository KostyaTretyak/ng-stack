import { ApiResponse } from 'src/app/modules/service/core/services/api/api-base.service';

export function makeResponse<D, M = any>(data: D[], meta?: M, error?: any): ApiResponse<D, M> {
  const res: any = {};
  if (data) {
    res.data = data;
  }
  if (meta) {
    res.meta = meta;
  }
  if (error) {
    res.error = error;
  }
  return res;
}
