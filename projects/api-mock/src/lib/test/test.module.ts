import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ApiMockModule } from '@ng-stack/api-mock';

import { MyApiMockService } from './api-mock.service';

@NgModule({
  declarations: [],
  imports: [HttpClientModule, ApiMockModule.forRoot(MyApiMockService, { delay: 800 })],
})
export class TestModule {}
