import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiResponse } from '../api-base.service';
import { ApiPostsService } from './api-posts.service';
import { Post } from '../api-mock/types';

@Injectable({ providedIn: 'root' })
export class ApiPostsResolverService implements Resolve<ApiResponse<Post>> {
  constructor(private apiPostsService: ApiPostsService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot) {
    const postId: number = activatedRouteSnapshot.params.postId;
    return this.apiPostsService.get({ postId }).pipe(catchError(error => of(error)));
  }
}
