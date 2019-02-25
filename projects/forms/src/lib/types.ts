import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AbstractControlOptions,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

export interface ObjectAny {
  [key: string]: any;
}

export type ControlType<T, K extends Extract<keyof T, string>> = T[K] extends any[]
  ? FormArrayTyped<T[K]>
  : T[K] extends object
  ? FormGroupTyped<T[K]>
  : FormControlTyped<T[K]>;

export abstract class AbstractControlTyped<T = any> extends AbstractControl {
  readonly value: T;

  get<K extends Extract<keyof T, string>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
  }

  abstract setValue(value: T, options?: ObjectAny): void;
  abstract patchValue(value: Partial<T>, options?: ObjectAny): void;
  abstract reset(value?: T, options?: ObjectAny): void;
}

export class FormGroupTyped<T = any> extends FormGroup {
  readonly value: T;

  getRawValue() {
    return super.getRawValue();
  }

  get<K extends Extract<keyof T, string>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
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
}

export class FormArrayTyped<T = any> extends FormArray {
  getRawValue() {
    return super.getRawValue();
  }
}

export class FormControlTyped<T = any> extends FormControl {
  readonly value: T;

  get<K extends Extract<keyof T, string>>(path: K | Array<K | number>) {
    return super.get(path) as ControlType<T, K> | null;
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
}

export type ControlsConfig<T> = {
  [P in keyof T]:
    | T[P]
    | [T[P], (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
};

export type ControlFormState<T, K> = K extends keyof T ? T[K] | { value: T[K]; disabled: boolean } : any;

// Form builder control returns
export type FbControlReturns<T, K> = K extends keyof T ? T[K] : any;

@Injectable({ providedIn: 'root' })
export class FormBuilderTyped extends FormBuilder {
  group<T extends ObjectAny>(
    controlsConfig: ControlsConfig<T>,
    options: AbstractControlOptions | ObjectAny | null = null
  ) {
    return super.group(controlsConfig, options) as FormGroupTyped<T>;
  }

  control<T, K>(
    formState: ControlFormState<T, K>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    return super.control(formState, validatorOrOpts, asyncValidator) as FormControlTyped<FbControlReturns<T, K>>;
  }
}
