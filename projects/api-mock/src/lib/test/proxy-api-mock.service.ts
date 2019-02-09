import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockRouteGroup } from '@ng-stack/api-mock';

import { PostsCommentsService } from './posts-comments.service';
import { CustomersOrdersService } from './customers-orders.service';

/**
 * If we have many groups of routes, we need the proxy service for more readable code.
 */
@Injectable()
export class ProxyApiMockService implements ApiMockService {
  constructor(
    private postCommentService: PostsCommentsService,
    private customersOrdersService: CustomersOrdersService
  ) {}

  getRouteGroups(): ApiMockRouteGroup[] {
    return [...this.postCommentService.getRouteGroups(), ...this.customersOrdersService.getRouteGroups()];
  }
}
