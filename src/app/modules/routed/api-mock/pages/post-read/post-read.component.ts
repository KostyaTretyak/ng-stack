import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { FormGroup, FormBuilder, Validators, ValidatorsModel } from '@ng-stack/forms';

import { ApiResponse, Post } from 'src/app/services/api/api-mock/types';
import { ApiPostsService } from 'src/app/services/api/posts/api-posts.service';

@Component({
  selector: 'app-post-read',
  templateUrl: './post-read.component.html',
  styleUrls: ['./post-read.component.scss'],
})
export class PostReadComponent implements OnInit {
  form: FormGroup<Post>;
  isContenteditable: boolean;
  message: string;
  post: Post;

  constructor(
    private activatedRoute: ActivatedRoute,
    private pageTitle: Title,
    private formBuilder: FormBuilder,
    private apiPostsService: ApiPostsService
  ) {}

  ngOnInit() {
    const resolversData = this.activatedRoute.snapshot.data.postRes as ApiResponse<Post>;
    if (resolversData instanceof Error) {
      console.log(resolversData);
      return;
    }
    const post = resolversData.data[0];
    this.post = post;
    this.pageTitle.setTitle(post.postTitle);
    this.form = this.formBuilder.group<Post>({
      postTitle: [post.postTitle, [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      postLead: [post.postLead, [Validators.required, Validators.minLength(100), Validators.maxLength(500)]],
      postBody: [post.postBody, [Validators.required, Validators.minLength(1000), Validators.maxLength(10000)]],
    });
  }

  save() {
    if (this.form.invalid) {
      const titleErr = this.form.get('postTitle').errors;
      const leadErr = this.form.get('postLead').errors;
      const bodyErr = this.form.get('postBody').errors;
      if (titleErr) {
        this.showError(titleErr, 'title');
      }
      if (leadErr) {
        this.showError(leadErr, 'lead');
      }
      if (bodyErr) {
        this.showError(bodyErr, 'body');
      }
      return;
    }

    this.message = 'saving...';
    this.apiPostsService.patch({ postId: this.post.postId }, this.form.value).subscribe(result => {
      this.message = 'saved!';
    });
  }

  private showError(err: ValidatorsModel, target: 'title' | 'lead' | 'body') {
    if (err.required) {
      this.message = `You should set the ${target}`;
    }
    if (err.minlength) {
      this.message =
        `${target} should have min ${err.minlength.requiredLength} length, ` +
        `actual have ${err.minlength.actualLength} length`;
    }
    if (err.maxlength) {
      this.message =
        `${target} should have max ${err.maxlength.requiredLength} length, ` +
        `actual have ${err.maxlength.actualLength} length`;
    }
  }
}
