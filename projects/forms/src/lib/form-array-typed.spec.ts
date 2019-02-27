import { FormArrayTyped } from './form-array-typed';
import { FormControlTyped } from './form-control-typed';
import { FormGroupTyped } from './form-group-typed';
import { isString, isNumber, isObject } from './types';

class Address {
  region: string;
  district: string;
  city: string;
  someNum: number;
}

const formArray1 = new FormArrayTyped<Address>([
  // { some: new FormControlTyped('some region') },
  // new FormControlTyped('some region'),
  new FormGroupTyped({
    city: new FormControlTyped('Kyiv'),
    region: new FormControlTyped('Kyiv'),
    district: new FormControlTyped('wat?'),
  }),
]);

formArray1.value.forEach(address => {
  isObject(address);
  isString(address.region);
  isString(address.district);
  isString(address.city);
  isNumber(address.someNum);
});
