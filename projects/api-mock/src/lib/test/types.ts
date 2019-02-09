import { ObjectAny } from '@ng-stack/api-mock';

/**
 * Here we need init properties with `null`
 * for use it for `pickAllPropertiesAsGetters()` util as list of properties.
 */
export class PostList {
  postId: number = null;
  userName: string = null;
  postTitle: string = null;
  postLead: string = null;
  pathAva: string = null;
  countComments: number = null;
  datePosted: number = null;
}

export class Post extends PostList {
  userId: number = null;
  postBody: string = null;
}

export class PostComment {
  commentId: number = null;
  userId: number = null;
  parentId: number = null;
  userName: string = null;
  postId: number = null;
  dateInsert: number = null;
  dateUpdate: number = null;
  pathAva: string = null;
  commentBody: string = null;
}

export class PostInfo {
  authorshipId: number = null;
  pathAva: string = null;
  datePosted: number = null;
  postId: number = null;
  postLead: string = null;
  postTitle: string = null;
  userName: string = null;
  userId: number = null;
  countComments: number = null;
}

export interface ApiResponse<T, M = ObjectAny> {
  data?: T[];
  error?: ObjectAny;
  meta?: M;
}

export class Customer {
  customerId: number = null;
}

export class Order {
  orderId: number = null;
  customerId: number = null;
}
