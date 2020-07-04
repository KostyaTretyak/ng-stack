import { Control, ExtractModelValue } from './types';
import { FormArray } from './form-array';
import { FormControl } from './form-control';
import { FormGroup } from './form-group';

describe('FormArray', () => {
  class Profile {
    firstName: string;
    lastName: string;
    addresses: Address[];
  }

  class Address {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  xdescribe('checking types only', () => {
    // Waiting for resolving https://github.com/Microsoft/TypeScript/issues/30207

    describe('constructor', () => {
      it('FormArray -> FormControl', () => {
        const formArray = new FormArray<string>([new FormControl('one')]);
        const arr: string[] = formArray.value;
        formArray.reset(['one', 'two']);
        formArray.setValue(['one', 'two']);
        formArray.patchValue(['one', 'two']);
      });

      it(`FormArray -> FormArray -> FormControl -> string`, () => {
        const formArray = new FormArray<string[]>([new FormArray([new FormControl('one')])]);
        const val1: string[][] = formArray.value;
        formArray.reset([['one', 'two']]);
        formArray.setValue([['one', 'two']]);
        formArray.patchValue([['one', 'two']]);
      });

      it(`FormArray -> FormControl -> string[]`, () => {
        const formArray = new FormArray<Control<string[]>>([new FormControl(['one', 'two'])]);
        const val1: string[][] = formArray.value;
        formArray.reset([['one', 'two']]);
        formArray.setValue([['one', 'two']]);
        formArray.patchValue([['one', 'two']]);
      });

      it(`'one' property as an array of FormArrays`, () => {
        class FormModel {
          one: string[];
        }
        const formArray = new FormArray<FormModel>([
          new FormGroup<FormModel>({ one: new FormArray([new FormControl('one'), new FormControl('two')]) }),
        ]);
        const arr1: FormModel[] = formArray.value;
        const arr2: string[] = formArray.value[0].one;
        formArray.reset([{ one: ['1'] }]);
        formArray.setValue([{ one: ['1'] }]);
        formArray.patchValue([{ one: ['1'] }]);
      });

      it(`'one' property as an array of FormControls`, () => {
        class FormModel {
          one: Control<string[]>;
        }
        const formArray = new FormArray<FormModel>([
          new FormGroup<FormModel>({ one: new FormControl(['one', 'two']) }),
        ]);
        const val1: ExtractModelValue<FormModel>[] = formArray.value;
        formArray.reset([{ one: ['1'] }]);
        formArray.setValue([{ one: ['1'] }]);
        formArray.patchValue([{ one: ['1'] }]);
        const val2: string[] = formArray.value[0].one;
      });
    });
  });

  describe(`checking runtime work`, () => {});
});
