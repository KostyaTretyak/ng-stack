import { Validators as NativeValidators, AbstractControl } from '@angular/forms';
import { ValidatorFn, ValidationErrors, AsyncValidatorFn } from './types';

/**
 * Provides a set of built-in validators that can be used by form controls.
 *
 * A validator is a function that processes a `FormControl` or collection of
 * controls and returns an error map or null. A null map means that validation has passed.
 *
 * See also [Form Validation](https://angular.io/guide/form-validation).
 */
export class Validators extends NativeValidators {
  /**
   * Validator that requires the control's value to be greater than or equal to the provided number.
   * The validator exists only as a function and not as a directive.
   *
   * ### Validate against a minimum of 3
   *
   * ```ts
   * const control = new FormControl(2, Validators.min(3));
   *
   * console.log(control.errors); // {min: {min: 3, actual: 2}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `min` property if the validation check fails, otherwise `null`.
   *
   */
  static min(min: number) {
    return NativeValidators.min(min) as ValidatorFn<{ min: { min: number; actual: number } }>;
  }

  /**
   * Validator that requires the control's value to be less than or equal to the provided number.
   * The validator exists only as a function and not as a directive.
   *
   * ### Validate against a maximum of 15
   *
   * ```ts
   * const control = new FormControl(16, Validators.max(15));
   *
   * console.log(control.errors); // {max: {max: 15, actual: 16}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `max` property if the validation check fails, otherwise `null`.
   *
   */
  static max(max: number) {
    return NativeValidators.max(max) as ValidatorFn<{ max: { max: number; actual: number } }>;
  }

  /**
   * Validator that requires the control have a non-empty value.
   *
   * ### Validate that the field is non-empty
   *
   * ```ts
   * const control = new FormControl('', Validators.required);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map with the `required` property
   * if the validation check fails, otherwise `null`.
   *
   */
  static required(control: AbstractControl) {
    return NativeValidators.required(control) as ValidationErrors<{ required: true }> | null;
  }

  /**
   * Validator that requires the control's value be true. This validator is commonly
   * used for required checkboxes.
   *
   * ### Validate that the field value is true
   *
   * ```typescript
   * const control = new FormControl('', Validators.requiredTrue);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map that contains the `required` property
   * set to `true` if the validation check fails, otherwise `null`.
   */
  static requiredTrue(control: AbstractControl) {
    return NativeValidators.requiredTrue(control) as ValidationErrors<{ required: true }> | null;
  }

  /**
   * Validator that requires the control's value pass an email validation test.
   *
   * ### Validate that the field matches a valid email pattern
   *
   * ```typescript
   * const control = new FormControl('bad@', Validators.email);
   *
   * console.log(control.errors); // {email: true}
   * ```
   *
   * @returns An error map with the `email` property
   * if the validation check fails, otherwise `null`.
   *
   */
  static email(control: AbstractControl) {
    return NativeValidators.email(control) as ValidationErrors<{ email: true }> | null;
  }

  /**
   * Validator that requires the length of the control's value to be greater than or equal
   * to the provided minimum length. This validator is also provided by default if you use the
   * the HTML5 `minlength` attribute.
   *
   * ### Validate that the field has a minimum of 3 characters
   *
   * ```typescript
   * const control = new FormControl('ng', Validators.minLength(3));
   *
   * console.log(control.errors); // {minlength: {requiredLength: 3, actualLength: 2}}
   * ```
   *
   * ```html
   * <input minlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `minlength` if the validation check fails, otherwise `null`.
   */
  static minLength(minLength: number) {
    return NativeValidators.minLength(minLength) as ValidatorFn<{
      minlength: { requiredLength: number; actualLength: number };
    }>;
  }

  /**
   * Validator that requires the length of the control's value to be less than or equal
   * to the provided maximum length. This validator is also provided by default if you use the
   * the HTML5 `maxlength` attribute.
   *
   * ### Validate that the field has maximum of 5 characters
   *
   * ```typescript
   * const control = new FormControl('Angular', Validators.maxLength(5));
   *
   * console.log(control.errors); // {maxlength: {requiredLength: 5, actualLength: 7}}
   * ```
   *
   * ```html
   * <input maxlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `maxlength` property if the validation check fails, otherwise `null`.
   */
  static maxLength(maxLength: number) {
    return NativeValidators.maxLength(maxLength) as ValidatorFn<{
      maxlength: { requiredLength: number; actualLength: number };
    }>;
  }

  /**
   * Validator that requires the control's value to match a regex pattern. This validator is also
   * provided by default if you use the HTML5 `pattern` attribute.
   *
   * Note that if a Regexp is provided, the Regexp is used as is to test the values. On the other
   * hand, if a string is passed, the `^` character is prepended and the `$` character is
   * appended to the provided string (if not already present), and the resulting regular
   * expression is used to test the values.
   *
   * ### Validate that the field only contains letters or spaces
   *
   * ```typescript
   * const control = new FormControl('1', Validators.pattern('[a-zA-Z ]*'));
   *
   * console.log(control.errors); // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
   * ```
   *
   * ```html
   * <input pattern="[a-zA-Z ]*">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `pattern` property if the validation check fails, otherwise `null`.
   */
  static pattern(pattern: string | RegExp) {
    return NativeValidators.pattern(pattern) as ValidatorFn<{
      pattern: { requiredPattern: string; actualValue: string };
    }>;
  }

  /**
   * Validator that performs no operation.
   */
  static nullValidator(control: AbstractControl): null {
    return null;
  }

  /**
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error maps of the validators if the validation check fails, otherwise `null`.
   */
  static compose(validators: null): null;
  static compose<T extends object = any>(validators: (ValidatorFn | null | undefined)[]): ValidatorFn<T> | null;
  static compose<T extends object = any>(validators: (ValidatorFn | null | undefined)[] | null): ValidatorFn<T> | null {
    return NativeValidators.compose(validators) as ValidatorFn<T> | null;
  }

  /**
   * Compose multiple async validators into a single function that returns the union
   * of the individual error objects for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error objects of the async validators if the validation check fails, otherwise `null`.
   */
  static composeAsync<T extends object = any>(validators: (AsyncValidatorFn<T> | null)[]) {
    return NativeValidators.composeAsync(validators) as AsyncValidatorFn<T> | null;
  }
}
