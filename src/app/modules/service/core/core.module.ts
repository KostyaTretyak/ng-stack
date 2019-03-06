import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ApiMockModule } from '@ng-stack/api-mock';

import { environment } from 'src/environments/environment.prod';
import { ApiMockProxyService } from 'src/app/services/api/api-mock/api-mock-proxy.service';

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    !environment.production && environment.runApiMock
      ? ApiMockModule.forRoot(ApiMockProxyService, {
          delay: environment.httpDelayApiMock,
          showLog: environment.showLogApiMock,
          clearPrevLog: environment.clearPrevLogApiMock,
        })
      : [],
  ],
})
export class CoreModule {}
