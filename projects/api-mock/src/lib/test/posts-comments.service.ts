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
  private changePostsData(): ApiMockCallbackData<[Post[]]> {
    return (httpMethod, postId, queryParams) => {
      const posts: Post[] = [];

      for (let i = 0; i < 50; i++, postId = null) {
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
   * Returns the data (list or one item) from `getPostsData()` callback.
   */
  private getPostsResponse(): ApiMockCallbackResponse {
    return (clonedData, httpMethod, queryParams) => {
      if (clonedData.length == 1) {
        return makeResponse(clonedData);
      }
      return makeResponse(clonedData, { queryParams });
    };
  }

  /**
   * Called when URL is like `/posts/123/comments` or `/posts/123/comments/456`.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private changeCommentsData(): ApiMockCallbackData<[Post, PostComment[]]> {
    /**
     * @param commentId Only need to may include it in one of postComments.
     */
    return (items, httpMethod, queryParams) => {
      const post = items[0];
      let postComments: PostComment[] = items[1];

      switch (httpMethod) {
        case 'GET':
          postComments = makePostComment(post.countComments);
          break;
        case 'POST':
          ++post.countComments;
          const insertedItem = postComments[postComments.length - 1];
          if (post.lastCommentators.length > 4) {
            post.lastCommentators.shift();
          }
          const commentator = new Commentator();
          pickAllPropertiesAsGetters(commentator, insertedItem);
          post.lastCommentators.push(commentator);
          if (postComments.length == 1) {
            postComments = makePostComment(post.countComments, postComments[0].commentId);
          } else {
          }
          break;
        case 'PATCH':
          break;
        case 'PUT':
          break;
        case 'DELETE':
          --post.countComments;
          break;
      }

      return postComments;

      function makePostComment(count: number, firstId?: number): PostComment[] {
        const comments: PostComment[] = [];
        for (let i = 0; i < count; i++, firstId = null) {
          const postComment: PostComment = {
            commentId: firstId || this.id,
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
          comments.push(comment);
        }

        return comments;
      }
    };
  }

  /**
   * Returns the data (list or one item) from `getCommentsData()` callback.
   * Here `[Post]` - it is generic type for `parents` - parameter for the callback.
   */
  private getCommentsResponse(): ApiMockCallbackResponse<[Post]> {
    return (clonedData, httpMethod, queryParams) => {
      if (clonedData.length == 1) {
        return makeResponse(clonedData);
      }
      const post = clonedData[0];
      const postInfo = pickAllPropertiesAsGetters(new PostInfo(), post);
      return makeResponse(clonedData, { postInfo, queryParams });
    };
  }
}
