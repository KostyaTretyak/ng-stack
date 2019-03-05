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
}

export class SomeArray {
  item1?: string;
  item2?: number;
}
