import { HttpBackend } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpBackendService } from './http-backend.service';
import { ApiMockConfig, ApiMockService } from './types';

@NgModule({
  imports: [RouterModule],
})
export class ApiMockModule {
  static forRoot(apiMockService: Type<ApiMockService>, apiMockConfig?: ApiMockConfig): ModuleWithProviders {
    return {
      ngModule: ApiMockModule,
      providers: [
        { provide: ApiMockService, useClass: apiMockService },
        { provide: ApiMockConfig, useValue: apiMockConfig },
        { provide: HttpBackend, useClass: HttpBackendService },
      ],
    };
  }
}
