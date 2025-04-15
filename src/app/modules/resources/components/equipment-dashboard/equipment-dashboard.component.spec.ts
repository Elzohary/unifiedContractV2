import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipmentDashboardComponent } from './equipment-dashboard.component';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { of, throwError } from 'rxjs';

describe('EquipmentDashboardComponent', () => {
  let component: EquipmentDashboardComponent;
  let fixture: ComponentFixture<EquipmentDashboardComponent>;
  let equipmentService: EquipmentService;
  let stateService: StateService;
  let router: Router;

  const mockEquipment: Equipment[] = [
    {
      id: '1',
      name: 'Test Equipment 1',
      type: 'Test Type',
      model: 'Test Model',
      serialNumber: '12345',
      manufacturer: 'Test Manufacturer',
      status: EquipmentStatus.Available,
      department: 'Test Department',
      location: 'Test Location',
      purchaseDate: new Date(),
      purchaseCost: 1000,
      currentValue: 800,
      specifications: {},
      maintenanceHistory: [],
      lastActivityDate: new Date(),
      nextMaintenanceDate: new Date(),
      nextMaintenanceType: 'Routine'
    },
    {
      id: '2',
      name: 'Test Equipment 2',
      type: 'Test Type',
      model: 'Test Model',
      serialNumber: '67890',
      manufacturer: 'Test Manufacturer',
      status: EquipmentStatus.InUse,
      department: 'Test Department',
      location: 'Test Location',
      purchaseDate: new Date(),
      purchaseCost: 2000,
      currentValue: 1600,
      specifications: {},
      maintenanceHistory: [],
      lastActivityDate: new Date(),
      nextMaintenanceDate: new Date(),
      nextMaintenanceType: 'Inspection'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatChipsModule
      ],
      declarations: [EquipmentDashboardComponent],
      providers: [
        EquipmentService,
        StateService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    equipmentService = TestBed.inject(EquipmentService);
    stateService = TestBed.inject(StateService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipment on initialization', () => {
    spyOn(equipmentService, 'getAllEquipment').and.returnValue(of(mockEquipment));
    spyOn(stateService, 'updateEquipment');

    component.ngOnInit();
    fixture.detectChanges();

    expect(equipmentService.getAllEquipment).toHaveBeenCalled();
    expect(stateService.updateEquipment).toHaveBeenCalledWith(mockEquipment);
    expect(component.equipment).toEqual(mockEquipment);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle error when loading equipment', () => {
    const errorMessage = 'Error loading equipment';
    spyOn(equipmentService, 'getAllEquipment').and.returnValue(throwError(() => new Error(errorMessage)));
    spyOn(stateService, 'setError');

    component.ngOnInit();
    fixture.detectChanges();

    expect(equipmentService.getAllEquipment).toHaveBeenCalled();
    expect(stateService.setError).toHaveBeenCalledWith(errorMessage);
    expect(component.equipment).toEqual([]);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe(errorMessage);
  });

  it('should display loading spinner while loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const loadingElement = fixture.nativeElement.querySelector('mat-spinner');
    expect(loadingElement).toBeTruthy();
  });

  it('should display error message when there is an error', () => {
    component.error = 'Test error message';
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement.textContent).toContain('Test error message');
  });

  it('should display equipment status counts', () => {
    component.equipment = mockEquipment;
    component.isLoading = false;
    component.error = null;
    fixture.detectChanges();

    expect(component.getStatusCount(EquipmentStatus.Available)).toBe(1);
    expect(component.getStatusCount(EquipmentStatus.InUse)).toBe(1);
    expect(component.getStatusCount(EquipmentStatus.Maintenance)).toBe(0);
    expect(component.getStatusCount(EquipmentStatus.OutOfService)).toBe(0);
  });

  it('should get upcoming maintenance', () => {
    component.equipment = mockEquipment;
    const upcomingMaintenance = component.getUpcomingMaintenance();
    expect(upcomingMaintenance.length).toBe(2);
    expect(upcomingMaintenance[0].id).toBe('1');
    expect(upcomingMaintenance[1].id).toBe('2');
  });

  it('should get recent activity', () => {
    component.equipment = mockEquipment;
    const recentActivity = component.getRecentActivity();
    expect(recentActivity.length).toBe(2);
    expect(recentActivity[0].id).toBe('2');
    expect(recentActivity[1].id).toBe('1');
  });

  it('should get correct activity color for each status', () => {
    expect(component.getActivityColor(EquipmentStatus.Available)).toBe('primary');
    expect(component.getActivityColor(EquipmentStatus.InUse)).toBe('accent');
    expect(component.getActivityColor(EquipmentStatus.Maintenance)).toBe('warn');
    expect(component.getActivityColor(EquipmentStatus.OutOfService)).toBe('warn');
  });

  it('should navigate to add equipment page', () => {
    component.navigateToAdd();
    expect(router.navigate).toHaveBeenCalledWith(['/equipment/add']);
  });
}); 