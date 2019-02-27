import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormGroup } from '@angular/forms';

import { Observable } from 'rxjs';

import { OnlyStringKeyOf, ControlOfFormGroup } from './types';

export class FormGroupTyped<T extends object = any> extends FormGroup {
  readonly value: T;
  readonly valueChanges: Observable<T>;

  /**
   * @todo Chechout how to respect optional and require properties modifyers for the controls.
   */
  constructor(
    public controls: { [K in OnlyStringKeyOf<T>]?: ControlOfFormGroup<T, K> },
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  registerControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlOfFormGroup<T, K>) {
    return super.registerControl(name, control) as ControlOfFormGroup<T, K>;
  }

  addControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlOfFormGroup<T, K>) {
    return super.addControl(name, control);
  }

  removeControl<K extends OnlyStringKeyOf<T>>(name: K) {
    return super.removeControl(name);
  }

  setControl<K extends OnlyStringKeyOf<T>>(name: K, control: ControlOfFormGroup<T, K>) {
    return super.setControl(name, control);
  }

  setValue(value: T, options?: object) {
    return super.setValue(value, options);
  }

  patchValue(value: Partial<T>, options?: object) {
    return super.patchValue(value, options);
  }

  reset(value?: T, options?: object) {
    return super.reset(value, options);
  }

  getRawValue() {
    return super.getRawValue() as T;
  }

  get<K extends OnlyStringKeyOf<T>>(path: K | Array<K | number>) {
    return super.get(path) as ControlOfFormGroup<T, K> | null;
  }
}
