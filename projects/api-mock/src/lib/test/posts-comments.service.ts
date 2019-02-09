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

import { Post, PostList, PostComment, PostInfo } from './types';
import { makeResponse } from './make-response';

@Injectable()
export class PostsCommentsService implements ApiMockService {
  private get dateRange() {
    return faker.date.between(new Date('2019.01.01'), new Date('2020.01.01')).getSeconds();
  }

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
      const posts: Post[] = [];

      for (let i = 0; i < 50; i++, postId = null) {
        const post: Post = {
          postId: +postId || faker.random.number({ min: 10, max: 1000 }),
          postTitle: faker.lorem.sentence(20),
          postLead: faker.lorem.sentence(200),
          postBody: faker.lorem.sentence(10000),
          userName: `${faker.name.firstName(1)} ${faker.name.lastName(1)}`,
          countComments: faker.random.number({ min: 0, max: 10 }),
          datePosted: this.dateRange,
          pathAva: faker.internet.avatar(),
          userId: faker.random.number({ min: 10, max: 10000 }),
        };
        posts.push(post);
      }

      const writeableData = posts;
      const onlyreadData = posts.map(post => pickAllPropertiesAsGetters(new PostList(), post));
      return { writeableData, onlyreadData };
    };
  }

  /**
   * Called when URL is like `posts` or `posts/123`
   */
  private getPostsResponse(): ApiMockCallbackResponse {
    return (clonedData, parents?, queryParams?) => {
      if (!clonedData) {
        return;
      }
      if (!Array.isArray(clonedData)) {
        return makeResponse([clonedData]);
      }
      return makeResponse(clonedData, { queryParams });
    };
  }

  /**
   * Called when URL is like `posts/123/comments` or `posts/123/comments/456`.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsData(): ApiMockCallbackData<[Post]> {
    /**
     * @param commentId Only need to may include it in one of postComments.
     */
    return (commentId?, parents?) => {
      const post = parents[0];
      const postComments: PostComment[] = [];

      for (let i = 0; i < post.countComments; i++, commentId = null) {
        const postComment: PostComment = {
          commentId: +commentId || faker.random.number({ min: 10, max: 1000 }),
          commentBody: faker.lorem.sentence(200),
          dateInsert: this.dateRange,
          dateUpdate: this.dateRange,
          pathAva: faker.internet.avatar(),
          userId: faker.random.number({ min: 10, max: 10000 }),
          userName: `${faker.name.firstName(1)} ${faker.name.lastName(1)}`,
          postId: null,
          parentId: 0,
        };
        const extPostComment = pickPropertiesAsGetters(postComment, { includeProperties: ['postId'] }, post);
        postComments.push(extPostComment);
      }

      const writeableData = postComments;
      const onlyreadData = pickAllPropertiesAsGetters(writeableData);
      return { writeableData, onlyreadData };
    };
  }

  /**
   * Called when URL is like `posts/123/comments` or `posts/123/comments/456`.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsResponse(): ApiMockCallbackResponse<[Post]> {
    return (clonedData, parents?, queryParams?) => {
      if (!clonedData) {
        return;
      }
      if (!Array.isArray(clonedData)) {
        return makeResponse([clonedData]);
      }
      const post = parents[0];
      const postInfo = pickAllPropertiesAsGetters(new PostInfo(), post);
      return makeResponse(clonedData, { postInfo, queryParams });
    };
  }
}
