import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MdToHtmlPipe } from './md-to-html.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [MdToHtmlPipe],
  exports: [CommonModule, MdToHtmlPipe],
})
export class SharedModule {}
