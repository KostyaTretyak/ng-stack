import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormBuilder, Validators } from '@ng-stack/forms';

import { UserForm } from '../../models/user-form';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
})
export class FormsComponent implements OnInit {
  formGroup: FormGroup<UserForm>;

  constructor(private fb: FormBuilder) {}

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

    this.formGroup = this.fb.group<UserForm>({
      userName: 'SomeOne',
      userEmail: new FormControl('some-one@gmail.com'),
      password: this.fb.control('123456'),
      addresses: this.fb.group({ city: 'Kyiv' }),
      someArray: this.fb.array([
        this.fb.group({ item1: 'value1' }),
        this.fb.group({ item1: 'value2' }),
        this.fb.group({ item1: 'value3' }),
        this.fb.group({ item1: 'value4' }),
      ]),
      birthday: new Date(),
      someControlWithArray: [['one', 'two'], Validators.required],
    });

    console.log(this.formGroup.value);
  }
}
