import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ApiMockModule } from '@ng-stack/api-mock';

import { environment } from 'src/environments/environment';
import { ApiMockProxyService } from 'src/app/services/api/api-mock/api-mock-proxy.service';
import { SimpleService } from 'src/app/services/api/api-mock/simple.service';
import { PostsCommentsService } from 'src/app/services/api/api-mock/posts-comments.service';

const apiMockModule = ApiMockModule.forRoot(ApiMockProxyService, {
  delay: environment.apiMockHttpDelay,
  showLog: environment.apiMockShowLog,
  clearPrevLog: environment.apiMockClearPrevLog,
  passThruUnknownUrl: environment.apiMockPassThruUnknownUrl,
});

@NgModule({
  declarations: [],
  imports: [HttpClientModule, !environment.production && environment.apiMockRun ? apiMockModule : []],
  providers: [SimpleService, PostsCommentsService],
})
export class CoreModule {}
