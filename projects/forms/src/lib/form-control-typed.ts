import { ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { StringKeys, ControlType, Status } from './types';

export class FormControlTyped<T = any> extends FormControl {
  readonly value: T;
  readonly valueChanges: Observable<T>;
  readonly status: Status;
  readonly statusChanges: Observable<Status>;

  /**
   * Creates a new `FormControl` instance.
   *
   * @param formState Initializes the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param validatorOrOpts A synchronous validator function, or an array of
   * such functions, or an `AbstractControlOptions` object that contains validation functions
   * and a validation trigger.
   *
   * @param asyncValidator A single async validator or array of async validator functions
   *
   */
  constructor(
    formState: T | { value: T; disabled: boolean } = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    super(formState, validatorOrOpts, asyncValidator);
  }

  /**
   * Sets a new value for the form control.
   *
   * @param value The new value for the control.
   * @param options Configuration options that determine how the control proopagates changes
   * and emits events when the value changes.
   * The configuration options are passed to the
   * [updateValueAndValidity](https://angular.io/api/forms/AbstractControl#updateValueAndValidity) method.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control value is updated.
   * When false, no events are emitted.
   * * `emitModelToViewChange`: When true or not supplied  (the default), each change triggers an
   * `onChange` event to
   * update the view.
   * * `emitViewToModelChange`: When true or not supplied (the default), each change triggers an
   * `ngModelChange`
   * event to update the model.
   *
   */
  setValue(
    value: T,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ) {
    return super.setValue(value, options);
  }

  /**
   * Patches the value of a control.
   *
   * This function is functionally the same as [setValue](https://angular.io/api/forms/FormControl#setValue) at this level.
   * It exists for symmetry with [patchValue](https://angular.io/api/forms/FormGroup#patchValue) on `FormGroups` and
   * `FormArrays`, where it does behave differently.
   *
   * See also: `setValue` for options
   */
  patchValue(
    value: T,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
      emitModelToViewChange?: boolean;
      emitViewToModelChange?: boolean;
    } = {}
  ) {
    return super.patchValue(value, options);
  }

  /**
   * Resets the form control, marking it `pristine` and `untouched`, and setting
   * the value to null.
   *
   * @param formState Resets the control with an initial value,
   * or an object that defines the initial value and disabled state.
   *
   * @param options Configuration options that determine how the control propagates changes
   * and emits events after the value changes.
   *
   * * `onlySelf`: When true, each change only affects this control, and not its parent. Default is
   * false.
   * * `emitEvent`: When true or not supplied (the default), both the `statusChanges` and
   * `valueChanges`
   * observables emit events with the latest status and value when the control is reset.
   * When false, no events are emitted.
   *
   */
  reset(
    formState: T | { value: T; disabled: boolean } = null,
    options: {
      onlySelf?: boolean;
      emitEvent?: boolean;
    } = {}
  ) {
    return super.reset(formState, options);
  }

  /**
   * In `FormControl`, this method always returns `null`.
   */
  get(): null {
    return null;
  }

  /**
   * Reports error data for the current control.
   *
   * @param errorCode The code of the error to check.
   *
   * @returns error data for that particular error. If an error is not present,
   * null is returned.
   */
  getError(errorCode: string) {
    return super.getError(errorCode);
  }

  /**
   * Reports whether the current control has the error specified.
   *
   * @param errorCode The code of the error to check.
   *
   * @returns whether the given error is present in the control at the given path.
   *
   * If an error is not present, false is returned.
   */
  hasError(errorCode: string) {
    return super.hasError(errorCode);
  }
}
