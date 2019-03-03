import { FormArrayTyped as FormArray } from './form-array-typed';
import { FormControlTyped as FormControl } from './form-control-typed';
import { FormGroupTyped as FormGroup } from './form-group-typed';

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

  describe(`checking that we knows how native FormArray works`, () => {
    it('passing to constructor primitive types as params', () => {
      // Mapping between param and expected
      const map = new Map<any[], any[]>();
      let param: any;
      let expected: any;

      param = [new FormControl('one'), new FormControl('two')];
      expected = ['one', 'two'];
      map.set(param, expected);

      param = [new FormGroup({ city: new FormControl('Kyiv') }), new FormGroup({ city: new FormControl('Mykolaiv') })];
      expected = [{ city: 'Kyiv' }, { city: 'Mykolaiv' }];
      map.set(param, expected);

      map.forEach((exp, par) => {
        expect(() => new FormArray(par)).not.toThrow();

        const value = new FormArray(par).value;
        expect(value).toEqual(exp);
      });
    });
  });

  xdescribe('checking types only', () => {});
});
