import { FormControl as NativeFormControl } from '@angular/forms';

import { Observable } from 'rxjs';

import {
  Status,
  ValidationErrors,
  StringKeys,
  ValidatorFn,
  AsyncValidatorFn,
  AbstractControlOptions,
  ValidatorsModel,
  ExtractControlValue,
  FormControlState,
} from './types';

export class FormControl<T = any, V extends object = ValidatorsModel> extends NativeFormControl {
  override readonly value: ExtractControlValue<T>;
  override readonly valueChanges: Observable<ExtractControlValue<T>>;
  override readonly status: Status;
  override readonly statusChanges: Observable<Status>;
  override readonly errors: ValidationErrors<V> | null;

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
    formState: FormControlState<T> = null,
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
   override setValue(
    value: ExtractControlValue<T>,
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
   override patchValue(
    value: ExtractControlValue<T>,
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
   override reset(
    formState: FormControlState<T> = null,
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
   override get(): null {
    return null;
  }

  /**
   * Sets the synchronous validators that are active on this control. Calling
   * this overwrites any existing sync validators.
   */
   override setValidators(newValidator: ValidatorFn | ValidatorFn[] | null) {
    return super.setValidators(newValidator);
  }

  /**
   * Sets the async validators that are active on this control. Calling this
   * overwrites any existing async validators.
   */
   override setAsyncValidators(newValidator: AsyncValidatorFn | AsyncValidatorFn[] | null) {
    return super.setAsyncValidators(newValidator);
  }

  /**
   * Sets errors on a form control when running validations manually, rather than automatically.
   *
   * Calling `setErrors` also updates the validity of the parent control.
   *
   * ### Manually set the errors for a control
   *
   * ```ts
   * const login = new FormControl('someLogin');
   * login.setErrors({
   *   notUnique: true
   * });
   *
   * expect(login.valid).toEqual(false);
   * expect(login.errors).toEqual({ notUnique: true });
   *
   * login.setValue('someOtherLogin');
   *
   * expect(login.valid).toEqual(true);
   * ```
   */
   override setErrors(errors: ValidationErrors | null, opts: { emitEvent?: boolean } = {}) {
    return super.setErrors(errors, opts);
  }

  /**
   * Reports error data for the current control.
   *
   * @param errorCode The code of the error to check.
   *
   * @returns error data for that particular error. If an error is not present,
   * null is returned.
   */
   override getError<K extends StringKeys<V> = any>(errorCode: K) {
    return super.getError(errorCode) as V[K] | null;
  }

  /**
   * Reports whether the current control has the error specified.
   *
   * @param errorCode The code of the error to check.
   *
   * @returns whether the given error is present in the current control.
   *
   * If an error is not present, false is returned.
   */
   override hasError<K extends StringKeys<V> = any>(errorCode: K) {
    return super.hasError(errorCode);
  }
}
