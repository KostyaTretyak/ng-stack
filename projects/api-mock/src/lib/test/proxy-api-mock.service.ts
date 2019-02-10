import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockRouteGroup } from '@ng-stack/api-mock';

import { PostsCommentsService } from './posts-comments.service';
import { SimpleService } from './simple.service';

/**
 * If we have many groups of routes, we need the proxy service for more readable code.
 */
@Injectable()
export class ProxyApiMockService implements ApiMockService {
  constructor(private simpleService: SimpleService, private postCommentService: PostsCommentsService) {}

  getRouteGroups(): ApiMockRouteGroup[] {
    return [...this.simpleService.getRouteGroups(), ...this.postCommentService.getRouteGroups()];
  }
}
