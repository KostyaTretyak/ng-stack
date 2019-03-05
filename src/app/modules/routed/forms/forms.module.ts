import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NgStackFormsModule } from '@ng-stack/forms';

import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './page/forms.component';

@NgModule({
  declarations: [FormsComponent],
  imports: [CommonModule, FormsRoutingModule, ReactiveFormsModule, NgStackFormsModule],
})
export class FormsModule {}
