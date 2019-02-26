import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { OnlyStringKeyOf, ControlType, ObjectAny } from './types';

export class FormGroupTyped<T = ObjectAny> extends FormGroup {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  constructor(
    public controls: { [K in OnlyStringKeyOf<T>]: ControlType<T, Extract<K, string>> },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  registerControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.registerControl(name, control) as ControlType<T, K>;
  }

  addControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.addControl(name, control);
  }

  removeControl<K extends OnlyStringKeyOf<T>>(name: K) {
    return super.removeControl(name);
  }

  setControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlType<T, K>) {
    return super.setControl(name, control);
  }

  setValue(value: T, options?: ObjectAny) {
    return super.setValue(value, options);
  }

  patchValue(value: Partial<T>, options?: ObjectAny) {
    return super.patchValue(value, options);
  }

  reset(value?: T, options?: ObjectAny) {
    return super.reset(value, options);
  }

  getRawValue() {
    return super.getRawValue() as T;
  }

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }
}
