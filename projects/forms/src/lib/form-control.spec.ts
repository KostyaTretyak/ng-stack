import { FormControl } from './form-control';
import { isString, isNumber, isArray } from './assert';
import { FormGroup } from './form-group';

describe('FormControl', () => {
  xdescribe('checking types only', () => {
    it('constructor()', () => {
      isString(new FormControl('').value);
      isString(new FormControl<string>().value);
      isNumber(new FormControl(1).value);
      isNumber(new FormControl<number>().value);
      isArray(new FormControl([]).value);
      isArray(new FormControl<number[]>().value);

      const formState1 = { value: '', disabled: false };
      const control1 = new FormControl(formState1);
      isString(control1.value);

      const formState2 = { value: 2, disabled: false };
      const control2 = new FormControl(formState2);
      isNumber(control2.value);

      const formState3 = { value: [], disabled: false };
      const control3 = new FormControl(formState3);
      isArray(control3.value);
    });

    it('setValue(), patchValue(), reset()', () => {
      const control1 = new FormControl('');
      control1.setValue('');
      // control1.setValue(2);
      // control1.setValue([]);
      control1.patchValue('');
      // control1.patchValue(2);
      // control1.patchValue([]);
      control1.reset('');
      // control1.reset(2);
      // control1.reset([]);

      const control2 = new FormControl(2);
      control2.setValue(2);
      // control2.setValue('');
      // control2.setValue([]);
      control2.patchValue(2);
      // control2.patchValue('');
      // control2.patchValue([]);
      control2.reset(2);
      // control2.reset('');
      // control2.reset([]);

      const formState3 = { value: '', disabled: false };
      const control3 = new FormControl(formState3);
      control3.setValue('');
      // control3.setValue(2);
      // control3.setValue([]);
      control3.patchValue('');
      // control3.patchValue(2);
      // control3.patchValue([]);
      control3.reset('');
      // control3.reset(2);
      // control3.reset([]);

      const formState4 = { value: 2, disabled: false };
      const control4 = new FormControl(formState4);
      control4.setValue(2);
      // control4.setValue('');
      // control4.setValue([]);
      control4.patchValue(2);
      // control4.patchValue('');
      // control4.patchValue([]);
      control4.reset(2);
      // control4.reset('');
      // control4.reset([]);
    });
  });

  describe(`checking runtime work`, () => {
    describe(`constructor()`, () => {
      it('passing primitive types as params', () => {
        const str = 'some string';

        // Mapping between param and expected
        const map = new Map<any, any>([[str, str], [2, 2], [null, null]]);

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
          [{ prop1: 1, prop2: str }, { prop1: 1, prop2: str }],
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
        const control = new FormControl('some value');
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
