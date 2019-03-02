import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped } from './form-array-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlOfFormGroup<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? FormGroupTyped<T>
  : FormControlTyped<T>;

export type ControlOfFormArray<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? FormGroupTyped<T>
  : FormControlTyped<T>;

export type FormBuilderControl<T> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControlTyped<T>;

/**
 * Form builder control config.
 */
export type FbControlsConfig<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? FormGroupTyped<T>
  : FormBuilderControl<T>;

/**
 * Form builder control state.
 */
export type FbControlFormState<T, K> = K extends StringKeys<T> ? T[K] | { value: T[K]; disabled: boolean } : any;

/**
 * Form builder control returns.
 */
export type FbControlReturns<T, K> = K extends StringKeys<T> ? T[K] : any;

export interface UpdateValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}

export interface LegacyControlOptions {
  validator: ValidatorFn | ValidatorFn[] | null;
  asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null;
}
