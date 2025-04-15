import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityMonitorComponent } from './activity-monitor.component';
import { ActivityLogService, ActivityLog, ActionType, EntityType } from '../../services/activity-log.service';
import { UserActivityService } from '../../services/user-activity.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ActivityMonitorComponent', () => {
  let component: ActivityMonitorComponent;
  let fixture: ComponentFixture<ActivityMonitorComponent>;
  let activityLogServiceMock: jasmine.SpyObj<ActivityLogService>;
  let userActivityServiceMock: jasmine.SpyObj<UserActivityService>;

  beforeEach(async () => {
    activityLogServiceMock = jasmine.createSpyObj('ActivityLogService', [
      'getAllActivityLogs'
    ]);
    userActivityServiceMock = jasmine.createSpyObj('UserActivityService', [
      'startTracking',
      'stopTracking'
    ]);

    // Configure mock return values
    activityLogServiceMock.getAllActivityLogs.and.returnValue(of([]));
    activityLogServiceMock.activityStream$ = of({
      id: 'test1',
      action: 'create' as ActionType,
      description: 'Test Activity',
      entityType: 'workOrder' as EntityType,
      entityId: 'wo1',
      timestamp: new Date(),
      userId: 'user1',
      userName: 'Test User'
    });

    await TestBed.configureTestingModule({
      imports: [
        ActivityMonitorComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivityLogService, useValue: activityLogServiceMock },
        { provide: UserActivityService, useValue: userActivityServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch activity logs on initialization', () => {
    expect(activityLogServiceMock.getAllActivityLogs).toHaveBeenCalled();
  });

  it('should toggle auto-refresh when called', () => {
    const initialState = component.isAutoRefreshEnabled();
    component.toggleAutoRefresh();
    expect(component.isAutoRefreshEnabled()).toBe(!initialState);
  });

  it('should format time difference correctly', () => {
    // Test days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 2);
    expect(component.formatTimeDifference(daysAgo)).toBe('2d ago');

    // Test hours
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - 3);
    expect(component.formatTimeDifference(hoursAgo)).toBe('3h ago');

    // Test minutes
    const minutesAgo = new Date();
    minutesAgo.setMinutes(minutesAgo.getMinutes() - 5);
    expect(component.formatTimeDifference(minutesAgo)).toBe('5m ago');

    // Test seconds
    const secondsAgo = new Date();
    secondsAgo.setSeconds(secondsAgo.getSeconds() - 30);
    expect(component.formatTimeDifference(secondsAgo)).toBe('30s ago');
  });

  it('should get appropriate icon for activity', () => {
    const createActivity: ActivityLog = {
      id: 'test1',
      action: 'create' as ActionType,
      description: 'Test Activity',
      entityType: 'workOrder' as EntityType,
      entityId: 'wo1',
      timestamp: new Date(),
      userId: 'user1',
      userName: 'Test User'
    };

    expect(component.getActivityIcon(createActivity)).toBe('add_circle');

    const viewActivity: ActivityLog = {
      id: 'test2',
      action: 'view' as ActionType,
      description: 'Test Activity',
      entityType: 'remark' as EntityType,
      entityId: 'rem1',
      timestamp: new Date(),
      userId: 'user1',
      userName: 'Test User'
    };

    expect(component.getActivityIcon(viewActivity)).toBe('visibility');
  });
}); 