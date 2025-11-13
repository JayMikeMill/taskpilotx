import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentTasks } from './recent-tasks';

describe('RecentTasks', () => {
  let component: RecentTasks;
  let fixture: ComponentFixture<RecentTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
