import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiBaseService } from './api-base.service';
import { User } from 'src/app/types/mix';

@Injectable({ providedIn: 'root' })
export class UserService extends ApiBaseService<User> {
  apiBaseUrl = '/api/users';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }
}
