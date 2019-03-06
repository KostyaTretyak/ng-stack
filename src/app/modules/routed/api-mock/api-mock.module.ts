import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiMockRoutingModule } from './api-mock-routing.module';
import { ApiMockComponent } from './pages/api-mock/api-mock.component';

@NgModule({
  declarations: [ApiMockComponent],
  imports: [CommonModule, ApiMockRoutingModule],
})
export class ApiMockModule {}
