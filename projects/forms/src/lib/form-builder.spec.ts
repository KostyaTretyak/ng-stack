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
      password: string;
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
      // otherArray: fb.array([new FormControl('one'), 2, 'three']), // Error --> Why?
      otherArray: fb.array([new FormControl('one'), ['two', Validators.required], 'three']),
    });

    const formGroup2 = fb.group<FormProps>({
      userEmail: [null, (control: AbstractControl) => ({ required: true, other: 1 })],
      token: [null, Validators.required],
      iAgree: [null, Validators.required],
    });

    formGroup1.get('otherArray').setValue(['string value', 2, 'three']);
  });

  describe(`checking runtime work`, () => {
    describe(`constructor()`, () => {});
    describe(`other methods`, () => {});
  });
});
