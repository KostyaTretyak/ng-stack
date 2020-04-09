import { Control } from '@ng-stack/forms';

export class Address {
  region?: string;
  district?: string;
  city?: string;
  someNum?: number;
}

export class UserForm {
  userName: string;
  userEmail: string;
  password: string;
  addresses?: Address;
  someArray: SomeArray[];
  birthday?: Control<Date>;
  someControlWithArray?: Control<string[]>;
}

export class SomeArray {
  item1?: string;
  item2?: number;
}
