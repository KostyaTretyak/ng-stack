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
  addresses?: Address[];
}
