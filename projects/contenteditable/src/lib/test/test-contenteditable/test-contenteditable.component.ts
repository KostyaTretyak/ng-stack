import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'lib-test-contenteditable',
  templateUrl: './test-contenteditable.component.html',
  styleUrls: ['./test-contenteditable.component.css'],
})
export class TestContenteditableComponent implements OnInit {
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
