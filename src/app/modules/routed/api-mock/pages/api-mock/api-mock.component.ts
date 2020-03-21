import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DataModel {
  id: number;
  body: string;
}

@Component({
  selector: 'app-api-mock',
  templateUrl: './api-mock.component.html',
  styleUrls: ['./api-mock.component.scss'],
})
export class ApiMockComponent implements OnInit {
  private bsSimples = new BehaviorSubject<DataModel>(null);
  isLoading: boolean;
  simples$ = this.bsSimples.asObservable();

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {}

  getSimple(id?: number) {
    id = id || 0;
    this.isLoading = true;
    this.bsSimples.next(undefined);

    this.httpClient
      .get<DataModel>(`/simple/${id}`)
      .pipe(
        catchError(error => {
          this.isLoading = false;
          throw error;
        })
      )
      .subscribe(result => {
        this.isLoading = false;
        this.bsSimples.next(result);
      });
  }

  getError404(id?: number) {
    this.bsSimples.next(undefined);

    this.httpClient.get<DataModel>(`/non-existing-route`).subscribe();
  }
}
