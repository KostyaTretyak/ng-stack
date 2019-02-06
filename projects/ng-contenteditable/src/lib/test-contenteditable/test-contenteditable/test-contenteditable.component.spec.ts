import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TestContenteditableComponent } from './test-contenteditable.component';
import { TestContenteditableModule } from '../test-contenteditable.module';

describe('TestContenteditableComponent', () => {
  let component: TestContenteditableComponent;
  let fixture: ComponentFixture<TestContenteditableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestContenteditableModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestContenteditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should p[name=myFormName] has contenteditable="true"', () => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p[name=myFormName]').getAttribute('contenteditable')).toEqual('true');
  });

  it('should contains default text after OnInit()', done => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    fixture.whenStable().then(() => {
      const text1 = 'This is contenteditable text for template-driven form';
      const text2 = 'This is contenteditable text for reactive form';
      expect(nativeElement.querySelector('p[name=myFormName]').textContent).toEqual(text1);
      expect(nativeElement.querySelector('p[name=myReactiveFormName]').textContent).toEqual(text2);
      done();
    })
    .catch(done.fail);
  });

  it('should contains changed text after change in direction: component -> forms', done => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    const changedText = 'direction: component -> forms';
    component.reactiveForm.setValue(changedText);
    component.templateDrivenFormText = changedText;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(nativeElement.querySelector('p[name=myFormName]').textContent).toEqual(changedText);
      expect(nativeElement.querySelector('p[name=myReactiveFormName]').textContent).toEqual(changedText);
      done();
    })
    .catch(done.fail);
  });

  it('should contains changed text after change in direction: forms -> component', done => {
    const nativeElement: HTMLElement = fixture.nativeElement;
    const changedText = 'direction: forms -> component';
    const templateDrivenForm = nativeElement.querySelector('p[name=myFormName]');
    const reactiveForm = nativeElement.querySelector('p[name=myReactiveFormName]');
    templateDrivenForm.textContent = changedText;
    reactiveForm.textContent = changedText;
    templateDrivenForm.dispatchEvent(newEvent('input'));
    reactiveForm.dispatchEvent(newEvent('input'));

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // expect(component.templateDrivenFormText).toEqual(changedText);
      console.log('component.templateDrivenFormText:', component.templateDrivenFormText);
      console.log('component.reactiveForm.value:', component.reactiveForm.value);
      expect(component.reactiveForm.value).toEqual(changedText);
      done();
    })
    .catch(done.fail);
  });

  it('should p[name=myReactiveFormName] has contenteditable="true"', () => {
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
  let evt = document.createEvent('CustomEvent');  // MUST be 'CustomEvent'
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}