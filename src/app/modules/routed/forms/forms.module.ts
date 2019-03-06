import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgStackFormsModule } from '@ng-stack/forms';

import { FormsRoutingModule } from './forms-routing.module';
import { FormsComponent } from './pages/forms.component';

@NgModule({
  declarations: [FormsComponent],
  imports: [CommonModule, FormsRoutingModule, NgStackFormsModule],
})
export class FormsModule {}
