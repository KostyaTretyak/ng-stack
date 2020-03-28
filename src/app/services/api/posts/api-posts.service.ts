import { Injectable } from '@angular/core';

import { ApiBaseService } from '../api-base.service';
import { Post } from '../api-mock/types';

@Injectable({ providedIn: 'root' })
export class ApiPostsService extends ApiBaseService<Post> {
  routePath = '/api/posts/:postId';
}
