import { Directive, ElementRef, Renderer2, HostListener, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[type="file"]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputFileDirective), multi: true }],
})
export class InputFileDirective implements ControlValueAccessor {
  private onChange: (value: FileList | FormData) => void;
  private onTouched: () => void;
  @Input() valueAsFileList: boolean | string;
  @Input() multiple: boolean | string;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  /**
   * Callback function that should be called when
   * the control's value changes in the UI.
   */
  @HostListener('change')
  callOnChange() {
    if (typeof this.onTouched == 'function') {
      this.onTouched();
    }

    if (typeof this.onChange == 'function') {
      if (this.valueAsFileList !== undefined && this.valueAsFileList !== false && this.valueAsFileList !== 'false') {
        this.onChange(this.elementRef.nativeElement.files);
      } else {
        const formData = new FormData();
        const files = Array.from<File>(this.elementRef.nativeElement.files);
        const formInputName = this.elementRef.nativeElement.name || 'fileUpload';

        if (this.multiple !== undefined && this.multiple !== false && this.multiple !== 'false') {
          files.forEach(file => {
            formData.append(formInputName + '[]', file);
          });
        } else {
          formData.append(formInputName, files[0]);
        }

        this.onChange(formData);
      }
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
      throw new TypeError('Value for input[type="file"] must be instanceof FileList');
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
