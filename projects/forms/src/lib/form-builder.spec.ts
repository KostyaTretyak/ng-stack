import { FormBuilder } from './form-builder';
import { FormControl } from './form-control';
import { Validators } from './validators';
import { AbstractControl } from '@angular/forms';

describe('FormBuilder', () => {
  xdescribe('checking types only', () => {
    class Address {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    }

    class SomeArray {
      item1?: string;
      item2?: number;
    }

    class UserForm {
      userName: string;
      userEmail: string;
      password?: string;
      addresses: Address;
      someArray: SomeArray[];
      otherArray: (string | number)[];
    }

    class FormProps {
      userEmail: string;
      token: string;
      iAgree: boolean;
    }

    const fb = new FormBuilder();

    it('common', () => {
      const formGroup1 = fb.group<UserForm>({
        userName: 'SomeOne',
        // userName: 123,
        // userEmail: new FormGroup({}),
        userEmail: new FormControl('some-one@gmail.com'),
        addresses: fb.group({ city: 'Kyiv' }),
        someArray: fb.array([
          fb.group({ item1: 'value1' }),
          fb.group({ item1: 'value2' }),
          fb.group({ item1: 'value3' }),
          fb.group({ item1: 'value4' }),
        ]),
        // otherArray: fb.array([new FormControl(5), new FormGroup({}), 'three']),

        // otherArray: fb.array([new FormControl('one'), 2, 'three']),
        // Error --> Why? See https://github.com/Microsoft/TypeScript/issues/30207

        otherArray: fb.array<string>([new FormControl('one'), ['two', Validators.required], 'three']),
      });

      const addresses: Address = formGroup1.value.addresses;

      const formGroup2 = fb.group<FormProps>({
        userEmail: [null, (control: AbstractControl) => ({ required: true, other: 1 })],
        token: [null, [Validators.required]],
        iAgree: [null, Validators.required],
      });

      formGroup1.get('otherArray').setValue(['string value', 2, 'three']);

      fb.array([
        fb.group({ item1: 'value1' }),
        fb.group({ item1: 'value2' }),
        fb.group({ item1: 'value3' }),
        fb.group({ item1: 'value4' }),
      ]);
    });

    it('nesting validation model', () => {
      interface FormGroupModel {
        control: string;
      }

      interface ValidModel1 {
        wrongPassword?: { returnedValue: boolean };
        wrongEmail?: { returnedValue: boolean };
      }

      interface ValidModel2 {
        wrongPassword?: { returnedValue: boolean };
        otherKey?: { returnedValue: boolean };
      }

      const form = fb.group<FormGroupModel, ValidModel1>({
        control: new FormControl<string, ValidModel2>('some value'),
      });

      const formError = form.getError('wrongEmail');
      const controlError = form.get('control').getError('email'); // Without errror, but it's wrong.
    });
  });

  describe(`checking runtime work`, () => {
    describe(`constructor()`, () => {});
    describe(`other methods`, () => {});
  });
});
