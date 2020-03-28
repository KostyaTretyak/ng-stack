import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Post, ApiResponse } from 'src/app/services/api/api-mock/types';
import { ApiPostsService } from 'src/app/services/api/posts/api-posts.service';

@Component({
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
  posts: Post[];
  httpErrorResponse: HttpErrorResponse;

  constructor(private activatedRoute: ActivatedRoute, private pageTitle: Title) {}

  ngOnInit() {
    this.pageTitle.setTitle('post list');

    const resolversData = this.activatedRoute.snapshot.data.postListRes as ApiResponse<Post>;
    if (resolversData instanceof Error) {
      console.log(resolversData);
      return;
    }
    this.posts = resolversData.data;
  }

  edit() {}
}
