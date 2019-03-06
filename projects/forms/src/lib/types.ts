import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { FormArray } from './form-array';
import { FormGroup } from './form-group';
import { FormControl } from './form-control';

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
  ? T extends [infer ControlModel, UniqToken]
    ? FormBuilderControl<ControlModel>
    : FormArray<Item>
  : T extends object
  ? FormGroup<T>
  : FormBuilderControl<T>;

export interface LegacyControlOptions {
  validator: ValidatorFn | ValidatorFn[] | null;
  asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null;
}

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
