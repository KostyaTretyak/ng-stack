import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiResponse } from '../api-base.service';
import { ApiPostsCommentsService } from './api-posts-comments.service';
import { PostComment } from '../api-mock/types';

@Injectable({ providedIn: 'root' })
export class ApiPostsCommentsResolverService implements Resolve<ApiResponse<PostComment>> {
  constructor(private apiPostsCommentsService: ApiPostsCommentsService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot) {
    const postId: number = activatedRouteSnapshot.params.postId;
    return this.apiPostsCommentsService.get({ postId }).pipe(catchError(error => of(error)));
  }
}
