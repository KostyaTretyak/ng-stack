/*
 * Public API Surface of api-mock
 */

export * from './lib/api-mock.module';
export * from './lib/http-status-codes';
export * from './lib/http-backend.service';
export * from './lib/pick-properties';
export {
  ApiMockService,
  ApiMockConfig,
  ApiMockData,
  ApiMockRoute,
  ApiMockRouteRoot,
  ApiMockRouteGroup,
  ApiMockCallbackData,
  ApiMockCallbackResponse,
  ObjectAny,
} from './lib/types';
