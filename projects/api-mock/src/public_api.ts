/*
 * Public API Surface of api-mock
 */

export * from './lib/api-mock.module';
export * from './lib/http-status-codes';
export * from './lib/http-backend.service';
export {
  ApiMockService,
  ApiMockConfig,
  ApiMockCallbackData,
  ApiMockData,
  ApiMockRoute,
  ApiMockRouteRoot,
  ApiMockRouteGroup,
  ObjectAny,
} from './lib/types';
