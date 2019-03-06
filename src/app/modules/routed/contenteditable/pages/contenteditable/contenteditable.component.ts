import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './contenteditable.component.html',
  styleUrls: ['./contenteditable.component.css'],
})
export class ContenteditableComponent implements OnInit {
  isContenteditable = true;
  templateDrivenFormText = 'This is contenteditable text for template-driven form';
  reactiveForm = new FormControl();

  ngOnInit() {
    this.reactiveForm.setValue(`This is contenteditable text for reactive form`);
  }

  toggleEditable() {
    this.isContenteditable = !this.isContenteditable;
  }
}
