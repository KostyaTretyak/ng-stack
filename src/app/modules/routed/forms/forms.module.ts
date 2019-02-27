import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormsRoutingModule } from './page/forms-routing.module';
import { FormsComponent } from './page/forms.component';

@NgModule({
  declarations: [FormsComponent],
  imports: [CommonModule, FormsRoutingModule, ReactiveFormsModule],
})
export class FormsModule {}
