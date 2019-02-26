import { FormArray } from '@angular/forms';

import { OnlyStringKeyOf, ControlType } from './types';

export class FormArrayTyped extends FormArray {
  at<T, K extends OnlyStringKeyOf<T>>(index: number) {
    return super.at(index) as ControlType<T, K>;
  }

  push<T, K extends OnlyStringKeyOf<T>>(control: ControlType<T, K>) {
    return super.push(control);
  }

  insert<T, K extends OnlyStringKeyOf<T>>(index: number, control: ControlType<T, K>) {
    return super.insert(index, control);
  }

  setControl<T, K extends OnlyStringKeyOf<T>>(index: number, control: ControlType<T, K>) {
    return super.setControl(index, control);
  }
}
