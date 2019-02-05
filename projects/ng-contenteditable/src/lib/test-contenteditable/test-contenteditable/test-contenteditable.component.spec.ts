import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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
