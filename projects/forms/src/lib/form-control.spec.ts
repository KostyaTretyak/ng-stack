import { FormControl } from './form-control';
import { isString, isNumber, isArray, isObject } from './assert';
import { FormGroup } from './form-group';
import { AbstractControl } from '@angular/forms';
import { ValidatorFn, Control } from './types';

describe('FormControl', () => {
  xdescribe('checking types only', () => {
    describe('constructor()', () => {
      isString(new FormControl('').value);
      isString(new FormControl<string>().value);
      isNumber(new FormControl(1).value);
      isNumber(new FormControl<number>().value);
      isArray(new FormControl([]).value);
      isArray(new FormControl<number[]>().value);
      isObject(new FormControl({}).value);
      isObject(new FormControl<object>().value);

      const formState1 = { value: '', disabled: false };
      const control1 = new FormControl(formState1);
      isString(control1.value);

      const formState2 = { value: 2, disabled: false };
      const control2 = new FormControl(formState2);
      isNumber(control2.value);

      const formState3 = { value: [], disabled: false };
      const control3 = new FormControl(formState3);
      isArray(control3.value);

      const formState4 = { value: {}, disabled: false };
      const control4 = new FormControl(formState4);
      isObject(control4.value);
    });

    describe('setValue()', () => {
      new FormControl().setValue(10);

      const control1 = new FormControl('');

      control1.setValue('');
      // control1.setValue(2);
      // control1.setValue([]);
      // control1.setValue({});

      const control2 = new FormControl(2);
      control2.setValue(2);
      // control2.setValue('');
      // control2.setValue([]);
      // control2.setValue({});

      const formState3 = { value: '', disabled: false };
      const control3 = new FormControl(formState3);
      control3.setValue('');
      // control3.setValue(2);
      // control3.setValue([]);
      // control3.setValue({});

      const formState4 = { value: 2, disabled: false };
      const control4 = new FormControl(formState4);
      control4.setValue(2);
      // control4.setValue('');
      // control4.setValue([]);
      // control4.setValue({});

      class FormModel {
        requiredProp: string;
        optionalProp1?: number;
        optionalProp2?: any[];
      }

      const formState5 = { requiredProp: 'some string', optionalProp1: 123, optionalProp2: [] };
      const control5 = new FormControl<FormModel>(formState5);
      control5.setValue({ requiredProp: 'other string', optionalProp1: 456, optionalProp2: [] });
      // control5.setValue({ requiredProp: 2, optionalProp1: 2, optionalProp2: 2 });
      // control5.setValue({ requiredProp: 'other string' });
      // control5.setValue(2);
      // control5.setValue('');
      // control5.setValue([]);
    });

    describe('patchValue()', () => {
      new FormControl().setValue(10);

      const control1 = new FormControl('');

      control1.patchValue('');
      // control1.patchValue(2);
      // control1.patchValue([]);
      // control1.patchValue({});

      const control2 = new FormControl(2);

      control2.patchValue(2);
      // control2.patchValue('');
      // control2.patchValue([]);
      // control2.patchValue({});

      const formState3 = { value: '', disabled: false };
      const control3 = new FormControl(formState3);

      control3.patchValue('');
      // control3.patchValue(2);
      // control3.patchValue([]);
      // control3.patchValue({});

      const formState4 = { value: 2, disabled: false };
      const control4 = new FormControl(formState4);

      control4.patchValue(2);
      // control4.patchValue('');
      // control4.patchValue([]);
      // control4.patchValue({});

      class FormModel {
        requiredProp: string;
        optionalProp1?: number;
        optionalProp2?: any[];
      }

      const formState5 = { requiredProp: 'some string', optionalProp1: 123, optionalProp2: [] };
      const control5 = new FormControl<FormModel>(formState5);

      // control5.patchValue({ prop22: 456 });
      // control5.patchValue(2);
      // control5.patchValue('');
      // control5.patchValue([]);
    });

    describe('reset()', () => {
      new FormControl().setValue(10);

      const control1 = new FormControl('');

      control1.reset('');
      // control1.reset(2);
      // control1.reset([]);
      // control1.reset({});

      const control2 = new FormControl(2);

      control2.reset(2);
      // control2.reset('');
      // control2.reset([]);
      // control2.reset({});

      const formState3 = { value: '', disabled: false };
      const control3 = new FormControl(formState3);

      control3.reset('');
      // control3.reset(2);
      // control3.reset([]);
      // control3.reset({});

      const formState4 = { value: 2, disabled: false };
      const control4 = new FormControl(formState4);

      control4.reset(2);
      // control4.reset('');
      // control4.reset([]);
      // control4.reset({});

      class FormModel {
        requiredProp: string;
        optionalProp1?: number;
        optionalProp2?: any[];
      }

      const formState5 = { requiredProp: 'some string', optionalProp1: 123, optionalProp2: [] };
      const control5 = new FormControl<FormModel>(formState5);

      control5.reset({ requiredProp: 'other string', optionalProp1: 456, optionalProp2: [] });
      // control5.reset({ requiredProp: 2, optionalProp1: 2, optionalProp2: 2 });
      // control5.reset({ requiredProp: 'other string' });
      // control5.reset(2);
      // control5.reset('');
      // control5.reset([]);
    });

    it('setValidators() with unappropriate ValidatorFn to a validation model', () => {
      const control = new FormControl<string, { someErrorCode: { returnedValue: 123 } }>('some value');
      const validatorFn: ValidatorFn = (c: AbstractControl) => ({ otherErrorCode: { returnedValue: 456 } });

      control.setValidators(validatorFn);
      // Without error, but it's not checking match
      // between model error code (someErrorCode) and actual entered ValidatorFn error code (otherErrorCode)
    });
  });

  describe(`checking runtime work`, () => {
    describe(`constructor()`, () => {
      it('passing primitive types as params', () => {
        const str = 'some string';

        // Mapping between param and expected
        const map = new Map<any, any>([
          [str, str],
          [2, 2],
          [null, null],
        ]);

        map.forEach((expected, param) => {
          let control: FormControl;

          expect(() => new FormControl(param)).not.toThrow();

          const value = new FormControl(param).value;
          expect(value).toBe(expected);

          control = new FormControl();
          control.setValue(param);
          expect(control.value).toBe(expected);

          control = new FormControl();
          control.patchValue(param);
          expect(control.value).toBe(expected);

          control = new FormControl();
          control.reset(param);
          expect(control.value).toBe(expected);
        });
      });

      it('passing object as params', () => {
        const str = 'some string';

        // Mapping between param and expected
        const map = new Map<any, any>([
          [
            { prop1: 1, prop2: str },
            { prop1: 1, prop2: str },
          ],
          [{ value: str, disabled: false }, str],
          [{ value: 2, disabled: false }, 2],
          [{ value: null, disabled: false }, null],
        ]);

        map.forEach((expected, param) => {
          let control: FormControl;

          expect(() => new FormControl(param)).not.toThrow();

          const value = new FormControl(param).value;
          expect(value).toEqual(expected);

          control = new FormControl();
          control.reset(param);
          expect(control.value).toEqual(expected);
        });
      });
    });

    describe(`other methods`, () => {
      it('get() after passing primitive type to constructor()', () => {
        const control = new FormControl<string, { someErrorCode: true }>('some value');
        const validatorFn: ValidatorFn = (c: AbstractControl) => ({ otherErrorCode: 123 });
        control.setValidators(validatorFn); // Withot error, but it's not checking match to `{ someErrorCode: true }`
        // control.getError('notExistingErrorCode');
        // control.errors.email
        // control.errors.notExistingErrorCode
        expect(control.status).toBe('VALID');
        expect((control as any).get()).toBe(null);
        expect((control as any).get('some value')).toBe(null);
      });

      it('get() after passing an object to constructor()', () => {
        const formGroup = new FormGroup({ one: new FormControl(1), two: new FormControl(2) });
        expect(formGroup.status).toBe('VALID');
        const control = new FormControl(formGroup);
        expect(control.status).toBe('VALID');
        expect((control as any).get()).toBe(null);
        expect((control as any).get('one')).toBe(null);
      });
    });
  });
});
