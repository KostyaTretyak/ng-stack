import { Injectable } from '@angular/core';

import { ApiBaseService } from '../api-base.service';
import { PostComment } from '../api-mock/types';

@Injectable({ providedIn: 'root' })
export class ApiPostsCommentsService extends ApiBaseService<PostComment> {
  routePath = '/api/posts/:postId/comments/:commentId';
}
