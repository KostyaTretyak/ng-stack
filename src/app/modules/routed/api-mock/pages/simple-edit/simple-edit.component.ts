import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { FormGroup, FormBuilder } from '@ng-stack/forms';

import { SimpleModel } from '../../models/simple-model';

@Component({
  templateUrl: './simple-edit.component.html',
  styleUrls: ['./simple-edit.component.sass'],
})
export class SimpleEditComponent implements OnInit {
  form: FormGroup<SimpleModel>;
  message: string;
  get id() {
    return this.form.get('id').value;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.message = 'loading...';
    this.form = this.formBuilder.group({ id: 0, body: '' });

    const id: number = this.activatedRoute.snapshot.params.id;
    this.httpClient.get<SimpleModel[]>(`/simple/${id}`).subscribe(result => {
      this.message = '';
      this.form = this.formBuilder.group(result[0]);
    });
  }

  save() {
    const id = this.form.get('id').value;
    this.message = 'saving...';
    this.httpClient.patch<SimpleModel>(`/simple/${id}`, this.form.value).subscribe(() => {
      this.message = 'saved!';
    });
  }
}
