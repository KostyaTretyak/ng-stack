export class Post {
  postId: number;
  body: string;
}

export class Comment {
  commentId: number;
  postId: number;
  body: string;
}

export class Customer {
  customerId: number;
}

export class Order {
  orderId: number;
  customerId: number;
}
