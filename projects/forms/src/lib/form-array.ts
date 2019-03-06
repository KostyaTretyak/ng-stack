import { FormArray as AliasFormArray, ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from '@angular/forms';

import { Observable } from 'rxjs';

import { ControlType, Status } from './types';

export class FormArray<Item = any> extends AliasFormArray {
  readonly value: Item[];
  readonly valueChanges: Observable<Item[]>;
  readonly status: Status;
  readonly statusChanges: Observable<Status>;

  /**
   * Creates a new `FormArray` instance.
   *
   * @param controls An array of child controls. Each child control is given an index
   * where it is registered.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(
    public controls: ControlType<Item>[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);
  }

  /**
   * Get the Control at the given `index` in the array.
   *
   * @param index Index in the array to retrieve the control
   */
  at(index: number) {
    return super.at(index) as ControlType<Item>;
  }

  /**
   * Insert a new Control at the end of the array.
   *
   * @param control Form control to be inserted
   */
  push(control: ControlType<Item>) {
    return super.push(control);
  }

  /**
   * Insert a new Control at the given `index` in the array.
   *
   * @param index Index in the array to insert the control
   * @param control Form control to be inserted
   */
  insert(index: number, control: ControlType<Item>) {
    return super.insert(index, control);
  }

  /**
   * Replace an existing control.
   *
   * @param index Index in the array to replace the control
   * @param control The Control control to replace the existing control
   */
  setControl(index: number, control: ControlType<Item>) {
    return super.setControl(index, control);
  }

  /**
   * Sets the value of the `FormArray`. It accepts an array that matches
   * the structure of the control.
   *
   * This method performs strict checks, and throws an error if you try
   * to set the value of a control that doesn't exist or if you exclude the
   * value of a control.
   *
   * ### Set the values for the controls in the form array
   *
```ts
const arr = new FormArray([
  new FormControl(),
  new FormControl()
]);
console.log(arr.value);   // [null, null]

arr.setValue(['Nancy', 'Drew']);
console.log(arr.value);   // ['Nancy', 'Drew']
```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   */
  setValue(value: Required<Item>[], options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
    return super.setValue(value, options);
  }

  /**
   * Patches the value of the `FormArray`. It accepts an array that matches the
   * structure of the control, and does its best to match the values to the correct
   * controls in the group.
   *
   * It accepts both super-sets and sub-sets of the array without throwing an error.
   *
   * ### Patch the values for controls in a form array
   *
```ts
const arr = new FormArray([
   new FormControl(),
   new FormControl()
]);
console.log(arr.value);   // [null, null]

arr.patchValue(['Nancy']);
console.log(arr.value);   // ['Nancy', null]
```
   *
   * @param value Array of latest values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   */
  patchValue(value: Partial<Item>[], options: { onlySelf?: boolean; emitEvent?: boolean } = {}) {
    return super.patchValue(value, options);
  }

  /**
   * Resets the `FormArray` and all descendants are marked `pristine` and `untouched`, and the
   * value of all descendants to null or null maps.
   *
   * You reset to a specific form state by passing in an array of states
   * that matches the structure of the control. The state is a standalone value
   * or a form state object with both a value and a disabled status.
   *
   * ### Reset the values in a form array
   *
```ts
const arr = new FormArray([
   new FormControl(),
   new FormControl()
]);
arr.reset(['name', 'last name']);

console.log(this.arr.value);  // ['name', 'last name']
```
   *
   * ### Reset the values in a form array and the disabled status for the first control
   *
```
this.arr.reset([
  {value: 'name', disabled: true},
  'last'
]);

console.log(this.arr.value);  // ['name', 'last name']
console.log(this.arr.get(0).status);  // 'DISABLED'
```
   *
   * @param value Array of values for the controls
   * @param options Configure options that determine how the control propagates changes and
   * emits events after the value changes
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default
   * is false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   */
  reset(
    value: (Required<Item> | { value: Required<Item>; disabled: boolean })[] = [],
    options: { onlySelf?: boolean; emitEvent?: boolean } = {}
  ) {
    return super.reset(value, options);
  }

  /**
   * The aggregate value of the array, including any disabled controls.
   *
   * Reports all values regardless of disabled status.
   * For enabled controls only, the `value` property is the best way to get the value of the array.
   */
  getRawValue() {
    return super.getRawValue() as Item[];
  }
}
