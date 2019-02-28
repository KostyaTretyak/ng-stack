import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped } from './form-array-typed';
import { FormGroupTyped } from './form-group-typed';
import { FormControlTyped } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlOfFormGroup<T extends object, K extends StringKeys<T>> = T[K] extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T[K] extends object
  ? FormGroupTyped<T[K]>
  : FormControlTyped<T[K]>;

export type ControlOfFormArray<T> = T extends (infer Item)[]
  ? FormArrayTyped<Item>
  : T extends object
  ? FormGroupTyped<T>
  : FormControlTyped<T>;

// Form builder control state
export type FbControlFormState<T, K> = K extends StringKeys<T> ? T[K] | { value: T[K]; disabled: boolean } : any;

// Form builder control config
export type FbControlsConfig<T> = {
  [P in StringKeys<T>]:
    | T[P]
    | [T[P], (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
};

// Form builder control returns
export type FbControlReturns<T, K> = K extends StringKeys<T> ? T[K] : any;

export interface UpdateValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}

// Assertions type only.

export type Diff<T, X> = T extends X ? never : T;

export type hasType<T, U> = Diff<T, Extract<T, never>> & U;
export type Fn = (...args: any[]) => any;
export type NonFn<T> = Diff<T, Fn>;
export type IsArray<T> = T extends (infer Item)[] ? Item : never;
export type NonArray<T> = Diff<T, IsArray<T>>;

export declare function isString<T>(value: hasType<T, string>): string;
export declare function isNumber<T>(value: hasType<T, number>): number;
export declare function isBoolean<T>(value: hasType<T, boolean>): boolean;
export declare function isSymbol<T>(value: hasType<T, symbol>): symbol;
export declare function isFunction<T>(value: hasType<T, Fn>): Fn;
export declare function isArray<T>(value: hasType<T, any[]>): any[];
export declare function isObject<T>(value: hasType<NonFn<T> & NonArray<T>, object>): object;
