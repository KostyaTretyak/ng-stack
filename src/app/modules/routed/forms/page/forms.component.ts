import { Component, OnInit } from '@angular/core';

import { FormGroupTyped, FormControlTyped, FormArrayTyped } from '@ng-stack/forms';

import { UserForm } from '../models/user-form';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
})
export class FormsComponent implements OnInit {
  formGroup: FormGroupTyped<UserForm>;

  get userName() {
    return this.formGroup.get('userName');
  }

  get userEmail() {
    return this.formGroup.get('userEmail');
  }

  get password() {
    return this.formGroup.get('password');
  }

  get addresses() {
    return this.formGroup.get('addresses');
  }

  ngOnInit() {
    this.formGroup = new FormGroupTyped({
      userName: new FormControlTyped('Some One'),
      userEmail: new FormControlTyped('some-one@gmail.com'),
      password: new FormControlTyped('123456'),
      addresses: new FormArrayTyped([
        new FormGroupTyped({
          city: new FormControlTyped('Kyiv'),
          region: new FormControlTyped('Kyiv'),
          district: new FormControlTyped('wat?'),
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
      ]),
    });

    console.log(this.addresses.value);
  }
}
