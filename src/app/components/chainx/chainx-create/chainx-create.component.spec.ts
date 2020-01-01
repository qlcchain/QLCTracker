import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainxCreateComponent } from './chainx-create.component';

describe('ChainxCreateComponent', () => {
  let component: ChainxCreateComponent;
  let fixture: ComponentFixture<ChainxCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChainxCreateComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainxCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
