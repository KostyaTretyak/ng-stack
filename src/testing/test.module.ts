import { NgModule } from '@angular/core';

import { ContenteditableModule } from '@ng-stack/contenteditable';
import { ApiMockModule } from '@ng-stack/api-mock';

@NgModule({
  imports: [ContenteditableModule, ApiMockModule],
  exports: [ContenteditableModule, ApiMockModule],
})
export class TestModule {}
