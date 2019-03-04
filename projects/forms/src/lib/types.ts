import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormGroupTyped as FormGroup } from './form-group-typed';
import { FormControlTyped as FormControl } from './form-control-typed';

export interface ObjectAny {
  [key: string]: any;
}

export type StringKeys<T> = Extract<keyof T, string>;

export type ControlType<T> = T extends (infer Item)[]
  ? T extends [infer ControlModel, UniqToken]
    ? FormControl<ControlModel>
    : FormArray<Item>
  : T extends object
  ? FormGroup<T>
  : FormControl<T>;

export type FormBuilderControl<T> =
  | T
  | [T, (ValidatorFn | ValidatorFn[] | AbstractControlOptions)?, (AsyncValidatorFn | AsyncValidatorFn[])?]
  | FormControl<T>;

/**
 * Form builder control config.
 */
export type FbControlsConfig<T> = T extends (infer Item)[]
  ? FormArray<Item>
  : T extends object
  ? FormGroup<T>
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

/**
 * This type is intended to automatically detecting a property of a form model
 * if it have type that extends `object` and where needed to set `FormControl`.
 * 
 * ### Example:
 * 
```ts
import { Control, FormGroup, FormControl } from '@ng-stack/forms';

class Address {
  city: string;
  street: string;
}

class Other {
  children: number;
}

class Profile {
  firstName: string;
  address: Control<Address>;
  other: Other;
}

const formGroup = new FormGroup<Profile>({
  firstName: new FormControl('Kostia'),
  address: new FormControl({
    city: 'Kyiv',
    street: 'Khreshchatyk',
  }),
  other: new FormGroup({
    children: new FormControl(5),
  }),
});
```
 * 
 * Here property:
 * - `firstName` have value with FormControl, because it have a primitive type in form model `Profile`
 * - `address` have value with FormControl, because its form model marked as `Control<Address>`
 * - `other` have value with FormGroup, because it have type that extends `object` in form model `Profile`
 */
export type Control<T extends object> = [T, UniqToken];

const sym = Symbol();

interface UniqToken {
  [sym]: never;
}

/**
 * The validation status of the control. There are four possible
 * validation status values:
 *
 * * **VALID**: This control has passed all validation checks.
 * * **INVALID**: This control has failed at least one validation check.
 * * **PENDING**: This control is in the midst of conducting a validation check.
 * * **DISABLED**: This control is exempt from validation checks.
 *
 * These status values are mutually exclusive, so a control cannot be
 * both valid AND invalid or invalid AND disabled.
 */
export type Status = 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
