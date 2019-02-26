import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped } from './form-array-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type OnlyStringKeyOf<T> = Extract<keyof T, string>;

export type ControlType<T, K extends OnlyStringKeyOf<T>> = T[K] extends FormArrayTyped
  ? FormArrayTyped
  : T[K] extends FormGroupTyped
  ? FormGroupTyped<T[K]>
  : FormControlTyped<T[K]>;

export type ControlFormState<T> = T extends object ? { value: T; disable: boolean } : T;

// Form builder control state
export type FbControlFormState<T, K> = K extends OnlyStringKeyOf<T> ? T[K] | { value: T[K]; disabled: boolean } : any;

// Form builder control config
export type FbControlsConfig<T> = {
  [P in OnlyStringKeyOf<T>]:
    | T[P]
    | [T[P], (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
};

// Form builder control returns
export type FbControlReturns<T, K> = K extends OnlyStringKeyOf<T> ? T[K] : any;

export interface UpdateValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}
