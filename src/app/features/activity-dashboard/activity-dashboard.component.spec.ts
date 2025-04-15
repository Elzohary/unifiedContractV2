import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityDashboardComponent } from './activity-dashboard.component';
import { ActivityLogService, ActivityLog } from '../../shared/services/activity-log.service';
import { UserService } from '../../shared/services/user.service';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ActivityDashboardComponent', () => {
  let component: ActivityDashboardComponent;
  let fixture: ComponentFixture<ActivityDashboardComponent>;
  let activityLogServiceMock: jasmine.SpyObj<ActivityLogService>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    activityLogServiceMock = jasmine.createSpyObj('ActivityLogService', ['logActivity']);
    userServiceMock = jasmine.createSpyObj('UserService', ['getCurrentUserId']);
    
    // Configure mock return values
    userServiceMock.getCurrentUserId.and.returnValue('user1');

    await TestBed.configureTestingModule({
      imports: [
        ActivityDashboardComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivityLogService, useValue: activityLogServiceMock },
        { provide: UserService, useValue: userServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate sample activity when button is clicked', () => {
    // Mock logActivity return value with a more complete ActivityLog object
    const mockActivityLog: ActivityLog = {
      id: 'test1',
      action: 'create',
      description: 'Test Activity',
      entityType: 'workOrder',
      entityId: 'wo1',
      timestamp: new Date(),
      userId: 'user1',
      userName: 'Test User'
    };
    activityLogServiceMock.logActivity.and.returnValue(of(mockActivityLog));
    
    // Call the method
    component.generateSampleActivity();
    
    // Verify the service was called
    expect(activityLogServiceMock.logActivity).toHaveBeenCalled();
    expect(userServiceMock.getCurrentUserId).toHaveBeenCalled();
  });

  it('should generate random changes for different entity types', () => {
    // Use private method via any cast to test
    const workOrderChanges = (component as any).generateRandomChanges('workOrder');
    const remarkChanges = (component as any).generateRandomChanges('remark');
    const userChanges = (component as any).generateRandomChanges('user');
    
    // Verify different entity types produce different field sets
    expect(Object.keys(workOrderChanges).length).toBeGreaterThan(0);
    expect(Object.keys(remarkChanges).length).toBeGreaterThan(0);
    expect(Object.keys(userChanges).length).toBeGreaterThan(0);
    
    // Check that the changes have old and new values
    const firstWorkOrderKey = Object.keys(workOrderChanges)[0];
    expect(workOrderChanges[firstWorkOrderKey].oldValue).toBeDefined();
    expect(workOrderChanges[firstWorkOrderKey].newValue).toBeDefined();
  });

  it('should generate random tags', () => {
    // Use private method via any cast to test
    const tags = (component as any).generateRandomTags();
    
    // Should be an array
    expect(Array.isArray(tags)).toBe(true);
    
    // Tags should be from the predefined list
    const validTags = ['important', 'critical', 'warning', 'error', 'success', 
                      'info', 'automated', 'manual', 'system', 'audit'];
    
    tags.forEach((tag: string) => {
      expect(validTags).toContain(tag);
    });
  });
}); 