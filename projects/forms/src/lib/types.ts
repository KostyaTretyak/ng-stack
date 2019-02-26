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

export type ControlFormState<T> = T | { value: T; disable: boolean };

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

// Assertions type only.

export type Diff<T, X> = T extends X ? never : T;
export type Filter<T, X> = T extends X ? T : never;

export type hasType<T, U> = Diff<T, Filter<T, never>> & U;
export type Fn = (...args: any[]) => any;
export type NonFn<T> = Diff<T, Fn>;

export declare function isString<T>(value: hasType<T, string>): boolean;
export declare function isNumber<T>(value: hasType<T, number>): boolean;
export declare function isBoolean<T>(value: hasType<T, boolean>): boolean;
export declare function isSymbol<T>(value: hasType<T, symbol>): boolean;
export declare function isFunction<T>(value: hasType<T, Fn>): boolean;
export declare function isObject<T>(value: hasType<NonFn<T>, object>): boolean;
