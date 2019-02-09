import { Injectable } from '@angular/core';

import {
  ApiMockService,
  ApiMockRouteGroup,
  ApiMockCallbackData,
  ApiMockCallbackResponse,
} from '@ng-stack/api-mock/lib/types';

import { Post } from './types';

@Injectable()
export class PostsCommentsService implements ApiMockService {
  getRouteGroups(): ApiMockRouteGroup[] {
    return [
      [
        { path: 'posts/:postId', callbackData: this.getPostsData(), callbackResponse: this.getPostsResponse() },
        {
          path: 'comments/:commentId',
          callbackData: this.getCommentsData(),
          callbackResponse: this.getCommentsResponse(),
        },
      ],
    ];
  }

  /**
   * Called when URL is like `posts` or `posts/123`
   */
  private getPostsData(): ApiMockCallbackData {
    return postId => {
      return { writeableData: [], onlyreadData: [] };
    };
  }

  /**
   * Called when URL is like `posts` or `posts/123`
   */
  private getPostsResponse(): ApiMockCallbackResponse {
    return (mockData, primaryKey, postId, parents, queryParams) => {
      return;
    };
  }

  /**
   * Called when URL is like `posts/123/comments` or `posts/123/comments/456`.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsData(): ApiMockCallbackData<[Post]> {
    return (commentId, parents) => {
      return { writeableData: [], onlyreadData: [] };
    };
  }

  /**
   * Called when URL is like `posts/123/comments` or `posts/123/comments/456`.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsResponse(): ApiMockCallbackResponse<[Post]> {
    return (mockData, primaryKey, commentId, parents, queryParams) => {
      return;
    };
  }
}
