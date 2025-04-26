import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WoCardWithTabsComponent } from './wo-card-with-tabs.component';

describe('WoCardWithTabsComponent', () => {
  let component: WoCardWithTabsComponent;
  let fixture: ComponentFixture<WoCardWithTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WoCardWithTabsComponent,
        RouterTestingModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WoCardWithTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event when addTask is called', () => {
    spyOn(component.addTask, 'emit');
    component.openAddTaskDialog();
    expect(component.addTask.emit).toHaveBeenCalled();
  });

  it('should emit event with task index when toggleTaskStatus is called', () => {
    spyOn(component.toggleTaskStatusEvent, 'emit');
    component.toggleTaskStatus(1);
    expect(component.toggleTaskStatusEvent.emit).toHaveBeenCalledWith(1);
  });

  it('should emit event with task index and task when editTask is called', () => {
    const mockTask = { id: '1', title: 'Test Task' };
    spyOn(component.editTaskEvent, 'emit');
    component.editTask(1, mockTask as any);
    expect(component.editTaskEvent.emit).toHaveBeenCalledWith({ index: 1, task: mockTask });
  });

  it('should emit event with task index when deleteTask is called', () => {
    spyOn(component.deleteTaskEvent, 'emit');
    component.deleteTask(1);
    expect(component.deleteTaskEvent.emit).toHaveBeenCalledWith(1);
  });

  it('should format date correctly', () => {
    const testDate = new Date(2023, 0, 15);
    const result = component.formatDate(testDate);
    expect(result).toContain('1/15/2023');
  });
});
