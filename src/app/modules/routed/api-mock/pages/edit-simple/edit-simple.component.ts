import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { FormGroup, FormBuilder } from '@ng-stack/forms';

import { SimpleModel } from '../../models/simple-model';

@Component({
  selector: 'app-edit-simple',
  templateUrl: './edit-simple.component.html',
  styleUrls: ['./edit-simple.component.sass'],
})
export class EditSimpleComponent implements OnInit {
  form: FormGroup<SimpleModel>;
  message: string;

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
