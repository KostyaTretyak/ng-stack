import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiResponse, PostComment } from 'src/app/services/api/api-mock/types';

@Component({
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.scss'],
})
export class PostCommentsComponent implements OnInit {
  postComments: PostComment[];

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const resolversData = this.activatedRoute.snapshot.data.postCommentsRes as ApiResponse<PostComment>;
    const postComments = resolversData.data;
    this.postComments = postComments;
  }
}
