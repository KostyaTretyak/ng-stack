import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ApiResponse, Post } from 'src/app/services/api/api-mock/types';

@Component({
  selector: 'app-post-read',
  templateUrl: './post-read.component.html',
  styleUrls: ['./post-read.component.scss'],
})
export class PostReadComponent implements OnInit {
  post: Post;

  constructor(private activatedRoute: ActivatedRoute, private pageTitle: Title) {}

  ngOnInit() {
    const resolversData = this.activatedRoute.snapshot.data.postRes as ApiResponse<Post>;
    if (resolversData instanceof Error) {
      console.log(resolversData);
      return;
    }
    this.post = resolversData.data[0];
  }
}
