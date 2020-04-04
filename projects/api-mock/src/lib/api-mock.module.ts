import { HttpBackend } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';

import { HttpBackendService } from './http-backend.service';
import { ApiMockConfig, ApiMockService } from './types';

@NgModule()
export class ApiMockModule {
  static forRoot(
    apiMockService: Type<ApiMockService>,
    apiMockConfig?: ApiMockConfig
  ): ModuleWithProviders<ApiMockModule> {
    return {
      ngModule: ApiMockModule,
      providers: [
        { provide: ApiMockService, useClass: apiMockService },
        { provide: ApiMockConfig, useValue: apiMockConfig },
        { provide: HttpBackend, useClass: HttpBackendService },
      ],
    };
  }

  /**
   * Enable and configure the `@ng-stack/api-mock` in a lazy-loaded feature module.
   * Same as `forRoot`.
   * This is a feel-good method so you can follow the Angular style guide for lazy-loaded modules.
   */
  static forFeature(
    apiMockService: Type<ApiMockService>,
    apiMockConfig?: ApiMockConfig
  ): ModuleWithProviders<ApiMockModule> {
    return ApiMockModule.forRoot(apiMockService, apiMockConfig);
  }
}
