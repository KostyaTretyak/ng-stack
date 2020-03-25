import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@ng-stack/forms';

import { SimpleModel } from '../../models/simple-model';

@Component({
  selector: 'app-simple',
  templateUrl: './simple.component.html',
  styleUrls: ['./simple.component.scss'],
})
export class SimpleComponent implements OnInit {
  private bsSimples = new BehaviorSubject<SimpleModel>(null);
  isLoading: boolean;
  isAdding: boolean;
  simples$ = this.bsSimples.asObservable();
  form: FormGroup<SimpleModel>;
  message: string;

  constructor(private httpClient: HttpClient, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group<SimpleModel>({
      id: [null, Validators.required],
      body: [null, Validators.required],
    });
    this.isLoading = true;
    this.bsSimples.next(undefined);
    this.getSimples();
  }

  private getSimples() {
    this.message = 'getting...';
    this.httpClient.get<SimpleModel>(`/simple`).subscribe(result => {
      this.message = '';
      this.isLoading = false;
      this.bsSimples.next(result);
    });
  }

  save() {
    this.message = 'saving...';
    console.log(this.form);
    if (this.form.invalid) {
      this.showFormErrors();
      return;
    }
    this.httpClient.post<SimpleModel>(`/simple`, this.form.value).subscribe(() => {
      this.message = 'saved!';
      this.isAdding = false;
      this.form.reset();
      this.getSimples();
    });
  }

  private showFormErrors() {
    if (this.form.get('id').getError('required')) {
      this.message = 'id is required';
      return;
    }
    if (this.form.get('body').getError('required')) {
      this.message = 'body is required';
      return;
    }
  }

  getError404(id?: number) {
    this.bsSimples.next(undefined);

    this.httpClient.get<SimpleModel>(`/non-existing-route`).subscribe();
  }
}
