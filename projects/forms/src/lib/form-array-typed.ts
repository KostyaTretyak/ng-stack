import { FormArray, ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from '@angular/forms';

import { ControlOfFormArray, OnlyIndexOf } from './types';
import { Observable } from 'rxjs';

export class FormArrayTyped<T extends object = any> extends FormArray {
  value: T[];
  valueChanges: Observable<T[]>;

  constructor(
    public controls: ControlOfFormArray<T, OnlyIndexOf<T>>[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  at(index: number) {
    return super.at(index) as ControlOfFormArray<T, OnlyIndexOf<T>>;
  }

  push(control: ControlOfFormArray<T, OnlyIndexOf<T>>) {
    return super.push(control);
  }

  insert(index: number, control: ControlOfFormArray<T, OnlyIndexOf<T>>) {
    return super.insert(index, control);
  }

  setControl(index: number, control: ControlOfFormArray<T, OnlyIndexOf<T>>) {
    return super.setControl(index, control);
  }
}
