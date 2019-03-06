import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormArray, FormBuilder } from '@ng-stack/forms';

import { UserForm } from '../models/user-form';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
})
export class FormsComponent implements OnInit {
  formGroup: FormGroup<UserForm>;

  constructor(private formBuilder: FormBuilder) {}

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
    // this.formGroup = new FormGroup<UserForm>({
    //   userName: new FormControl('Some One'),
    //   userEmail: new FormControl('some-one@gmail.com'),
    //   password: new FormControl('123456'),
    //   addresses: new FormArray([
    //     new FormGroup({
    //       city: new FormControl('Kyiv'),
    //       region: new FormControl('Kyiv'),
    //       district: new FormControl('wat?'),
    //     }),
    //     new FormGroup({
    //       city: new FormControl('Mykolaiv'),
    //       region: new FormControl('Mykolaiv'),
    //       district: new FormControl('wat?'),
    //     }),
    //     new FormGroup({
    //       city: new FormControl('Kharkiv'),
    //       region: new FormControl('Kharkiv'),
    //       district: new FormControl('wat?'),
    //     }),
    //   ]),
    // });

    const fb = new FormBuilder();

    this.formGroup = this.formBuilder.group<UserForm>({
      userName: 'SomeOne',
      userEmail: new FormControl('some-one@gmail.com'),
      password: fb.control('123456'),
      addresses: fb.group({ city: 'Kyiv' }),
      someArray: fb.array([
        fb.group({ item1: 'value1' }),
        fb.group({ item1: 'value2' }),
        fb.group({ item1: 'value3' }),
        fb.group({ item1: 'value4' }),
      ]),
    });

    console.log(this.addresses.value);
  }
}
