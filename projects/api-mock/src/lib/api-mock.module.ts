import { HttpBackend, XhrFactory } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';

import { HttpBackendService } from './http-backend.service';
import { ApiMockConfig, ApiMockService } from './types';

// Internal - Creates the in-mem backend for the HttpClient module
// AoT requires factory to be exported
export function httpBackendServiceFactory(
  apiMockService: ApiMockService,
  apiMockConfig: ApiMockConfig,
  xhrFactory: XhrFactory
): HttpBackend {
  return new HttpBackendService(apiMockService, apiMockConfig, xhrFactory);
}

@NgModule()
export class ApiMockModule {
  static forRoot(apiMockService: Type<ApiMockService>, apiMockConfig?: ApiMockConfig): ModuleWithProviders {
    return {
      ngModule: ApiMockModule,
      providers: [
        { provide: ApiMockService, useClass: apiMockService },
        { provide: ApiMockConfig, useValue: apiMockConfig },

        {
          provide: HttpBackend,
          useFactory: httpBackendServiceFactory,
          deps: [ApiMockService, ApiMockConfig, XhrFactory],
        },
      ],
    };
  }
}
