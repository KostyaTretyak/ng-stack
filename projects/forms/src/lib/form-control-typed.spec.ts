import { FormControlTyped } from './form-control-typed';
import { isString, isNumber, isArray } from './assert';

describe('FormControlTyped', () => {
  describe(`checking that we knows how native FormControl works`, () => {
    it('passing to constructor primitive types as params', () => {
      const str = 'some string';

      // Mapping between param and expected
      const map = new Map<any, any>([[str, str], [2, 2], [null, null]]);

      map.forEach((expected, param) => {
        let control: FormControlTyped;

        expect(() => new FormControlTyped(param)).not.toThrow();

        const value = new FormControlTyped(param).value;
        expect(value).toBe(expected);

        control = new FormControlTyped();
        control.setValue(param);
        expect(control.value).toBe(expected);

        control = new FormControlTyped();
        control.patchValue(param);
        expect(control.value).toBe(expected);

        control = new FormControlTyped();
        control.reset(param);
        expect(control.value).toBe(expected);
      });
    });

    it('passing to constructor object as params', () => {
      const str = 'some string';

      // Mapping between param and expected
      const map = new Map<any, any>([
        [{ value: str, disabled: false }, str],
        [{ value: 2, disabled: false }, 2],
        [{ value: null, disabled: false }, null],
      ]);

      map.forEach((expected, param) => {
        let control: FormControlTyped;

        expect(() => new FormControlTyped(param)).not.toThrow();

        const value = new FormControlTyped(param).value;
        expect(value).toBe(expected);

        control = new FormControlTyped();
        control.reset(param);
        expect(control.value).toBe(expected);
      });
    });
  });

  xdescribe('checking types only', () => {
    it('inferring type from constructor params', () => {
      isString(new FormControlTyped('').value);
      isString(new FormControlTyped<string>().value);
      isNumber(new FormControlTyped(1).value);
      isNumber(new FormControlTyped<number>().value);
      isArray(new FormControlTyped([]).value);
      isArray(new FormControlTyped<number[]>().value);

      const formState1 = { value: '', disabled: false };
      const control1 = new FormControlTyped(formState1);
      isString(control1.value);

      const formState2 = { value: 2, disabled: false };
      const control2 = new FormControlTyped(formState2);
      isNumber(control2.value);

      const formState3 = { value: [], disabled: false };
      const control3 = new FormControlTyped(formState3);
      isArray(control3.value);
    });

    it('should methods accept allowed parameters only', () => {
      const control1 = new FormControlTyped('');
      control1.setValue('');
      // control1.setValue(2);
      // control1.setValue([]);
      control1.patchValue('');
      // control1.patchValue(2);
      // control1.patchValue([]);
      control1.reset('');
      // control1.reset(2);
      // control1.reset([]);

      const control2 = new FormControlTyped(2);
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
      const control3 = new FormControlTyped(formState3);
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
      const control4 = new FormControlTyped(formState4);
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
});
