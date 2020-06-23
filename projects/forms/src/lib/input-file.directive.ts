import {
  Directive,
  ElementRef,
  Renderer2,
  HostListener,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: `
  input[type=file][ngModel],
  input[type=file][formControl],
  input[type=file][formControlName]`,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputFileDirective), multi: true }],
})
export class InputFileDirective implements ControlValueAccessor {
  @HostBinding('attr.multiple') @Input() multiple: boolean | string;
  @HostBinding('attr.preserveValue') @Input() preserveValue: boolean | string;
  @Output() select = new EventEmitter<File[]>();
  private onChange = (value: FormData) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  /**
   * Callback function that should be called when
   * the control's value changes in the UI.
   */
  @HostListener('change', ['$event'])
  callOnChange(event: any) {
    this.onTouched();
    const files = Array.from<File>(this.elementRef.nativeElement.files);
    const formData = new FormData();

    let formInputName = this.elementRef.nativeElement.name || 'uploadFile';
    if (this.multiple !== undefined && this.multiple !== false && this.multiple !== 'false') {
      formInputName += '[]';
    }
    files.forEach((file) => formData.append(formInputName, file));

    this.onChange(formData);
    this.select.next(files);
    if (this.preserveValue === undefined || this.preserveValue === false || this.preserveValue === 'false') {
      event.target.value = null;
    }
  }

  /**
   * Writes a new value to the element.
   * This method will be called by the forms API to write
   * to the view when programmatic (model -> view) changes are requested.
   *
   * See: [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor#members)
   */
  writeValue(fileList: FileList): void {
    if (fileList && !(fileList instanceof FileList)) {
      throw new TypeError('Value for input[type=file] must be an instance of FileList');
    }
    this.renderer.setProperty(this.elementRef.nativeElement, 'files', fileList);
  }

  /**
   * Registers a callback function that should be called when
   * the control's value changes in the UI.
   *
   * This is called by the forms API on initialization so it can update
   * the form model when values propagate from the view (view -> model).
   */
  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a callback function that should be called when the control receives a change event.
   * This is called by the forms API on initialization so it can update the form model on change.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
