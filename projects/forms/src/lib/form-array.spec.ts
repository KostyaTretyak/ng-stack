import { FormArray } from './form-array';

// tslint:disable: no-unused-expression

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
    it('constructor()', () => {
      const formArray = new FormArray([]);
      formArray.getError('required', 'controlName');
      // formArray.getError('notExistingErrorCode', 'fdsf');
      // new FormArray();
    });
  });

  describe(`checking runtime work`, () => {});
});
