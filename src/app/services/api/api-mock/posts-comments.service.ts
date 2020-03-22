import { Injectable } from '@angular/core';

import * as faker from 'faker/locale/en_US';
import {
  ApiMockService,
  ApiMockRouteGroup,
  ApiMockCallbackData,
  ApiMockCallbackResponse,
  pickAllPropertiesAsGetters,
  pickPropertiesAsGetters,
} from '@ng-stack/api-mock';

import { Post, PostList, PostComment, PostInfo, Commentator } from './types';
import { makeResponse } from './make-response';

@Injectable()
export class PostsCommentsService implements ApiMockService {
  private get dateRange() {
    return faker.date.between(new Date('2019.01.01'), Date()).getTime();
  }

  private get id() {
    return faker.random.number({ min: 1, max: 1000 });
  }

  getRouteGroups(): ApiMockRouteGroup[] {
    return [
      [
        {
          path: 'posts/:postId',
          callbackData: this.changePostsData(),
          callbackResponse: this.getPostsResponse(),
        },
        {
          path: 'comments/:commentId',
          callbackData: this.changeCommentsData(),
          callbackResponse: this.getCommentsResponse(),
          propertiesForList: new PostList(),
        },
      ],
    ];
  }

  /**
   * Called when URL is like `/posts` or `/posts/123`
   */
  private changePostsData(): ApiMockCallbackData<Post[]> {
    return (posts, postId, httpMethod, parents, queryParams) => {
      for (let i = 0; i < 20; i++, postId = null) {
        const post: Post = {
          postId: +postId || this.id,
          postTitle: faker.lorem.sentence(20),
          postLead: faker.lorem.sentence(200),
          postBody: faker.lorem.sentence(10000),
          userName: faker.internet.userName(),
          countComments: faker.random.number({ min: 0, max: 10 }),
          datePosted: this.dateRange,
          pathAva: faker.internet.avatar(),
          userId: this.id,
        };
        posts.push(post);
      }

      return posts;
    };
  }

  /**
   * Returns the data (list or one item) from `changePostsData()` callback.
   */
  private getPostsResponse(): ApiMockCallbackResponse<Post[]> {
    return (clonedData, postId, httpMethod, parents, queryParams) => {
      if (postId) {
        return makeResponse(clonedData);
      }
      return makeResponse(clonedData, { queryParams });
    };
  }

  /**
   * Called when URL is like `/posts/123/comments` or `/posts/123/comments/456`.
   * Here
   *  - `[Post]` - it is generic type for `parents` - parameter for the callback.
   *  - `PostComment[]` - it is generic type for `postComments` - parameter for the callback.
   */
  private changeCommentsData(): ApiMockCallbackData<PostComment[], [Post]> {
    /**
     * @param commentId Only need to may include it in one of postComments.
     */
    return (postComments, postCommentId, httpMethod, parents, queryParams) => {
      const post = parents[0];

      switch (httpMethod) {
        case 'GET':
          for (let i = 0; i < post.countComments; i++, postCommentId = null) {
            const postComment: PostComment = {
              commentId: +postCommentId || this.id,
              commentBody: faker.lorem.sentence(200),
              dateInsert: this.dateRange,
              dateUpdate: this.dateRange,
              pathAva: faker.internet.avatar(),
              userId: this.id,
              userName: faker.internet.userName(),
              postId: null,
              parentId: 0,
            };
            // This action need only because `postId` is a property shared from parent.
            const comment = pickPropertiesAsGetters(postComment, { includeProperties: ['postId'] }, post);
            postComments.push(comment);
          }
          break;
        case 'POST':
          ++post.countComments;
          const lastComment = postComments[postComments.length - 1];
          pickPropertiesAsGetters(lastComment, { includeProperties: ['postId'] }, post);
          updateLastCommentators();
          break;
        case 'PATCH':
        case 'PUT':
          updateLastCommentators();
          break;
        case 'DELETE':
          --post.countComments;
          updateLastCommentators();
          break;
      }

      return postComments;

      function updateLastCommentators() {
        post.lastCommentators = postComments.slice(-5).map(postComment => {
          return pickAllPropertiesAsGetters(new Commentator(), postComment);
        });
      }
    };
  }

  /**
   * Returns the data (list or one item) from `changeCommentsData()` callback.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsResponse(): ApiMockCallbackResponse<PostComment[], [Post]> {
    return (clonedData, postCommentId, httpMethod, parents, queryParams) => {
      if (postCommentId) {
        return makeResponse(clonedData);
      }
      const post = parents[0];
      // Meta data.
      const postInfo = pickAllPropertiesAsGetters(new PostInfo(), post);
      return makeResponse(clonedData, { postInfo, queryParams });
    };
  }
}
