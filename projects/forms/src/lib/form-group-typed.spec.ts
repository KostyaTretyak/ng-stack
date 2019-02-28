import { FormGroupTyped } from './form-group-typed';
import { isString, isObject } from './types';
import { FormArrayTyped } from './form-array-typed';
import { FormControlTyped } from './form-control-typed';

class Room {
  whoseBed: string;
}

class Address {
  region: string;
  district: string;
  city: string;
  rooms: Room[];
}

class Education {
  school1: string;
  school2: string;
  school3: string;
}

class UserForm {
  userName: string;
  userEmail: string;
  password: string;
  education: Education;
  addresses?: Address[];
}

const formGroup1 = new FormGroupTyped<UserForm>({
  userName: new FormControlTyped(),
  userEmail: new FormControlTyped('some-one@gmail.com'),
  password: new FormControlTyped('123456'),
  education: new FormGroupTyped({
    school1: new FormControlTyped('This is about school1'),
    school2: new FormControlTyped('2'),
    school3: new FormControlTyped('This is about school3'),
  }),
  addresses: new FormArrayTyped([
    // new FormControlTyped(123),
    new FormGroupTyped({
      city: new FormControlTyped('Mykolaiv'),
      region: new FormControlTyped('Mykolaiv'),
      district: new FormControlTyped('wat?'),
    }),
  ]),
});

isObject(formGroup1.value);
isString(formGroup1.value.userName);
isString(formGroup1.value.userEmail);
isString(formGroup1.value.password);

formGroup1.valueChanges.subscribe(v => {
  isObject(v);
  isString(v.userName);
  isString(v.userEmail);
  isString(v.password);
});

const userNameControl1 = formGroup1.registerControl('userName', new FormControlTyped('Some One'));
isString(userNameControl1.value);
userNameControl1.valueChanges.subscribe(v => isString(v));

const userNameControl2 = formGroup1.registerControl('userEmail', new FormControlTyped());
isString(userNameControl2.value);
userNameControl2.valueChanges.subscribe(v => isString(v));

formGroup1.registerControl('addresses', new FormArrayTyped([]));
formGroup1.registerControl(
  'education',
  new FormGroupTyped({
    school1: new FormControlTyped('This is about school1'),
    school2: new FormControlTyped(),
    school3: new FormControlTyped('This is about school3'),
  })
);
