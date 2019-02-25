import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TestContenteditableComponent } from './test-contenteditable.component';
import { TestModule } from '../test.module';

describe('TestContenteditableComponent', () => {
  let component: TestContenteditableComponent;
  let fixture: ComponentFixture<TestContenteditableComponent>;
  const defaultText1 = 'This is contenteditable text for template-driven form';
  const defaultText2 = 'This is contenteditable text for reactive form';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestContenteditableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should p[name=myFormName] has contenteditable="true"', () => {
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p[name=myFormName]').getAttribute('contenteditable')).toEqual('true');
  });

  it('should templateDrivenForm contains changed text after change in direction: component -> forms', fakeAsync(() => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    const changedText = 'direction: component -> forms';
    const templateDrivenForm = nativeElement.querySelector('p[name=myFormName]');
    expect(templateDrivenForm.textContent).toBe('', `At start templateDrivenForm.textContent should be empty`);
    fixture.detectChanges();
    // Wait until ngModel binds component.templateDrivenFormText to p[name=myFormName].
    tick();
    expect(templateDrivenForm.textContent).toBe(defaultText1, `At start defaultText1 should be ${defaultText1}`);

    component.templateDrivenFormText = changedText;
    fixture.detectChanges();
    tick();
    expect(nativeElement.querySelector('p[name=myFormName]').textContent).toEqual(changedText);
  }));

  it('should reactiveForm contains changed text after change in direction: component -> forms', () => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    const reactiveForm = nativeElement.querySelector('p[name=myReactiveFormName]');
    expect(reactiveForm.textContent).toBe('', `At start reactiveForm.textContent should be empty`);
    fixture.detectChanges();
    expect(reactiveForm.textContent).toBe(defaultText2, `At start defaultText2 should be ${defaultText2}`);
    const changedText = 'direction: component -> forms';
    component.reactiveForm.setValue(changedText);
    expect(reactiveForm.textContent).toEqual(changedText);
  });

  it('should templateDrivenForm contains changed text after change in direction: forms -> component', fakeAsync(() => {
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;
    const changedText = 'direction: forms -> component';
    const templateDrivenForm = nativeElement.querySelector('p[name=myFormName]');
    expect(component.templateDrivenFormText).toBe(defaultText1, `At start defaultText1 should be ${defaultText1}`);
    expect(templateDrivenForm.textContent).toBe('', `At start templateDrivenForm.textContent should be empty`);
    // Wait until ngModel binds component.templateDrivenFormText to p[name=myFormName].
    tick();
    expect(templateDrivenForm.textContent).toBe(defaultText1, `At start defaultText1 should be ${defaultText1}`);

    templateDrivenForm.textContent = changedText;
    templateDrivenForm.dispatchEvent(newEvent('input'));
    // Here works contenteditable directive.
    expect(component.templateDrivenFormText).toEqual(changedText);
  }));

  it('should reactiveForm contains changed text after change in direction: forms -> component', () => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    const changedText = 'direction: forms -> component';
    const reactiveForm = nativeElement.querySelector('p[name=myReactiveFormName]');
    expect(component.reactiveForm.value).toBe(null, `At start component.reactiveForm.value should be empty`);
    expect(reactiveForm.textContent).toBe('', `At start reactiveForm.textContent should be empty`);
    fixture.detectChanges();
    expect(component.reactiveForm.value).toBe(defaultText2, `At start defaultText2 should be ${defaultText2}`);
    expect(reactiveForm.textContent).toBe(defaultText2, `At start defaultText2 should be ${defaultText2}`);

    reactiveForm.textContent = changedText;
    reactiveForm.dispatchEvent(newEvent('input'));
    // Here works contenteditable directive.
    expect(component.reactiveForm.value).toEqual(changedText);
  });

  it('should p[name=myReactiveFormName] has contenteditable="true"', () => {
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p[name=myReactiveFormName]').getAttribute('contenteditable')).toEqual('true');
  });

  it('should not throw error when click toggleEditable()', () => {
    expect(() => component.toggleEditable()).not.toThrow();
  });

  it('should p[name=myFormName] has contenteditable="false" after click the button', () => {
    expect(() => component.toggleEditable()).not.toThrow();
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p[name=myFormName]').getAttribute('contenteditable')).toEqual('false');
  });

  it('should p[name=myReactiveFormName] has contenteditable="false" after click the button', () => {
    expect(() => component.toggleEditable()).not.toThrow();
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p[name=myReactiveFormName]').getAttribute('contenteditable')).toEqual('false');
  });
});

function newEvent(eventName: string, bubbles = false, cancelable = false) {
  const evt = document.createEvent('CustomEvent'); // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}
