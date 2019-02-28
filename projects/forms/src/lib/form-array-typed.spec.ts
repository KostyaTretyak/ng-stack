import { FormArrayTyped } from './form-array-typed';
import { FormControlTyped } from './form-control-typed';
import { FormGroupTyped } from './form-group-typed';
import { isString, isNumber, isObject, isArray } from './types';

class Room {
  whoseBed: string;
}

class Address {
  region: string;
  district: string;
  city: string;
  rooms: Room[];
  someNum: number;
}

// Here problems with type of property rooms
const formGroup1: FormGroupTyped<Address> = new FormGroupTyped({
  // notExistingProperty: new FormControlTyped('Mykolaiv'),
  city: new FormControlTyped('Mykolaiv'),
  region: new FormControlTyped('Mykolaiv'),
  // district: new FormGroupTyped({}),
  district: new FormControlTyped('wat?'),
  // rooms: new FormControlTyped('Mykolaiv'),
  // rooms: new FormArrayTyped([new FormControlTyped(123)]),
  rooms: new FormArrayTyped([
    new FormControlTyped(123), // <--- Here is a wrong value
    new FormGroupTyped({
      whoseBed: new FormControlTyped('my'),
      one: new FormArrayTyped([]), // <--- Here is a wrong value
      notExistingProperty: new FormControlTyped(1561), // <--- Here is a wrong value
    }),
  ]),
});

// const rooms1: FormArrayTyped<Room> = new FormArrayTyped([new FormControlTyped(1561)]);
const rooms2: FormArrayTyped<Room> = new FormArrayTyped([
  // new FormControlTyped(123),
  new FormGroupTyped({
    whoseBed: new FormControlTyped('my'),
    // one: new FormArrayTyped([]),
    // notExistingProperty: new FormControlTyped(1561),
  }),
]);

const formArray1 = new FormArrayTyped<Address>([
  // new FormControlTyped(123),
  new FormGroupTyped({
    // notExistingProperty: new FormControlTyped('Mykolaiv'),
    city: new FormControlTyped('Mykolaiv'),
    region: new FormControlTyped('Mykolaiv'),
    district: new FormControlTyped('wat?'),
    // rooms: new FormControlTyped('Mykolaiv'),
    rooms: new FormArrayTyped([
      new FormControlTyped(123), // <--- Here is a wrong value
      new FormGroupTyped({
        whoseBed: new FormControlTyped('my'),
        one: new FormArrayTyped([]), // <--- Here is a wrong value
        notExistingProperty: new FormControlTyped(1561), // <--- Here is a wrong value
      }),
    ]),
  }),
]);

const formArray2 = new FormArrayTyped<Address>([
  new FormGroupTyped({
    city: new FormControlTyped('Kyiv'),
    region: new FormControlTyped('Kyiv'),
    district: new FormControlTyped('wat?'),
    rooms: new FormArrayTyped([
      new FormControlTyped(123),
      new FormGroupTyped({
        whoseBed: new FormControlTyped('my'),
        one: new FormArrayTyped([]),
        notExistingProperty: new FormControlTyped(1561),
      }),
    ]),
  }),
  new FormGroupTyped({
    city: new FormControlTyped('Mykolaiv'),
    region: new FormControlTyped('Mykolaiv'),
    district: new FormControlTyped('wat?'),
  }),
  new FormGroupTyped({
    city: new FormControlTyped('Kharkiv'),
    region: new FormControlTyped('Kharkiv'),
    district: new FormControlTyped('wat?'),
  }),
]);

formArray2.value.forEach(address => {
  isObject(address);
  isString(address.region);
  isString(address.district);
  isString(address.city);
  isNumber(address.someNum);
});

const control0 = formArray2.at(0);
const addr = control0.value;
isObject(addr);
isString(addr.region);
isString(addr.district);
isString(addr.city);
isNumber(addr.someNum);

// formArray2.push({});
formArray2.push(control0);
// formArray2.insert(2, {});
formArray2.insert(2, control0);
// formArray2.setControl(2, {});
formArray2.setControl(2, control0);

formArray2.setValue([
  { city: 'Kyiv', region: 'Kyiv', district: 'wat?', rooms: [], someNum: 1 },
  // { city: 21, region: 'Mykolaiv', district: 'wat?', rooms: '', someNum: '' },
  { city: 'Mykolaiv', region: 'Mykolaiv', district: 'wat?', rooms: [], someNum: 1 },
  { city: 'Kharkiv', region: 'Kharkiv', district: 'wat?', rooms: [], someNum: 1 },
]);

formArray2.patchValue([
  { city: 'Kyiv', region: 'Kyiv', district: 'wat?', rooms: [], someNum: 1 },
  // { city: 21, region: 'Mykolaiv', district: 'wat?', rooms: '', someNum: '' },
  { city: 'Mykolaiv', region: 'Mykolaiv', district: 'wat?', rooms: [], someNum: 1 },
  { city: 'Kharkiv', region: 'Kharkiv', district: 'wat?', rooms: [], someNum: 1 },
]);

formArray2.reset([
  { city: 'Kyiv', region: 'Kyiv', district: 'wat?', rooms: [], someNum: 1 },
  // { city: 21, region: 'Mykolaiv', district: 'wat?', rooms: '', someNum: '' },
  { value: { city: 'Mykolaiv', region: 'Mykolaiv', district: 'wat?', rooms: [], someNum: 1 }, disabled: true },
  { city: 'Kharkiv', region: 'Kharkiv', district: 'wat?', rooms: [], someNum: 1 },
]);

isArray(formArray2.getRawValue());

formArray2.getRawValue().forEach(address => {
  isObject(address);
  isString(address.region);
  isString(address.district);
  isString(address.city);
  isNumber(address.someNum);
});

// An array in an array
const formArray3 = new FormArrayTyped<Address[]>([
  // new FormControlTyped(123),
  new FormArrayTyped([
    // new FormControlTyped(123),
    new FormGroupTyped({
      city: new FormControlTyped('Mykolaiv'),
      region: new FormControlTyped('Mykolaiv'),
      district: new FormControlTyped('wat?'),
      rooms: new FormArrayTyped([
        new FormControlTyped(123), // <--- Here is a wrong value
        new FormGroupTyped({
          whoseBed: new FormControlTyped('my'),
          one: new FormArrayTyped([]), // <--- Here is a wrong value
          notExistingProperty: new FormControlTyped(1561), // <--- Here is a wrong value
        }),
      ]),
    }),
  ]),
]);

const control1 = formArray3.at(0);
isArray(control1.value);
control1.value.forEach(address => {
  isObject(address);
  isString(address.region);
  isString(address.district);
  isString(address.city);
  isNumber(address.someNum);
});

// formArray3.push({});
formArray3.push(control1);
// formArray3.insert(2, {});
formArray3.insert(2, control1);
// formArray3.setControl(2, {});
formArray3.setControl(2, control1);
