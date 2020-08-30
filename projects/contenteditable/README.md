## What is this library?

This is micro Angular v4+ contenteditable directive for integration with Angular forms.
It just implements [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) for this purpose.

## Install

```bash
npm install @ng-stack/contenteditable --save
```

## Usage

Import and add `ContenteditableModule` to your project:

```ts
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContenteditableModule } from '@ng-stack/contenteditable';

// ...

@NgModule({
  // ...
  imports: [
    // Import this module to get available work angular with `contenteditable`
    ContenteditableModule,
    // Import one or both of this modules
    FormsModule,
    ReactiveFormsModule
  ]

// ...

})
```

And then you can to use it in [template-driven forms](https://angular.io/guide/forms)
or [reactive forms](https://angular.io/guide/reactive-forms) like this:

```ts
// In your component
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

export class MyComponent implements OnInit {
  templateDrivenForm = 'This is contenteditable text for template-driven form';
  myControl = new FormControl();

  ngOnInit() {
    this.myControl.setValue(`This is contenteditable text for reactive form`);
  }
}
```

```html
<form #testForm="ngForm">
  <p
    contenteditable="true"
    name="myFormName"
    [(ngModel)]="templateDrivenForm"
    ></p>
</form>
 
<pre>
  {{ testForm.value | json }}
</pre>

<hr>

<p contenteditable="true" [formControl]="myControl"></p>

<pre>
  {{ myControl.value | json }}
</pre>
```

## Options

### propValueAccessor

With `contenteditable` directive you can pass optional `@Input` value for `propValueAccessor`:

```html
<p
  contenteditable="true"
  propValueAccessor="innerHTML"
  [formControl]="myControl"
  ></p>
```

Internally, `ContenteditableDirective` uses this value as follows:

```ts
this.elementRef.nativeElement[this.propValueAccessor]
```

By default it using `textContent`.

### `contenteditable` as @Input property

Since version 1.0.0, `@ng-stack/contenteditable` accepts `contenteditable` as @Input property (note the square brackets):

```html
<p [contenteditable]="isContenteditable"></p>
```

where `isContenteditable` is a boolean variable.

### unformattedPaste

Since version 1.1.0, `@ng-stack/contenteditable` takes into account experimental `unformattedPaste` attribute:

```html
<p
  contenteditable="true"
  unformattedPaste
  [formControl]="myControl"
  ></p>
```

This allow copy formated text (from anywhere) and paste unformated text into HTML element with `contenteditable` attribute.

`unformattedPaste` attribute is experimental because here is used obsolete [document.execCommand()](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) method to write unformated text. So far no good alternative for this method has been found.
