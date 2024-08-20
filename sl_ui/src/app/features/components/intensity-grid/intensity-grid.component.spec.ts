import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntensityGridComponent } from './intensity-grid.component';

describe('IntensityGridComponent', () => {
  let component: IntensityGridComponent;
  let fixture: ComponentFixture<IntensityGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntensityGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntensityGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
