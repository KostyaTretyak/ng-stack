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
});
