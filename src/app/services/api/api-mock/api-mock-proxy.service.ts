import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockRootRoute } from '@ng-stack/api-mock';

import { PostsCommentsService } from './posts-comments.service';
import { SimpleService } from './simple.service';

/**
 * If we have many groups of routes, we need the proxy service for more readable code.
 */
@Injectable()
export class ApiMockProxyService implements ApiMockService {
  constructor(private simpleService: SimpleService, private postCommentService: PostsCommentsService) {}

  getRoutes(): ApiMockRootRoute[] {
    return [...this.simpleService.getRoutes(), ...this.postCommentService.getRoutes()];
  }
}
