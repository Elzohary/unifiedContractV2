import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipmentAssignmentComponent } from './equipment-assignment.component';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { of, throwError } from 'rxjs';

describe('EquipmentAssignmentComponent', () => {
  let component: EquipmentAssignmentComponent;
  let fixture: ComponentFixture<EquipmentAssignmentComponent>;
  let equipmentService: EquipmentService;
  let stateService: StateService;
  let router: Router;
  let route: ActivatedRoute;
  let fb: FormBuilder;

  const mockEquipment: Equipment = {
    id: '1',
    name: 'Test Equipment',
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
    lastActivityDate: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule
      ],
      declarations: [EquipmentAssignmentComponent],
      providers: [
        EquipmentService,
        StateService,
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
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
    route = TestBed.inject(ActivatedRoute);
    fb = TestBed.inject(FormBuilder);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentAssignmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipment on initialization', () => {
    spyOn(equipmentService, 'getEquipmentById').and.returnValue(of(mockEquipment));

    component.ngOnInit();
    fixture.detectChanges();

    expect(equipmentService.getEquipmentById).toHaveBeenCalledWith('1');
    expect(component.equipment).toEqual(mockEquipment);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle error when loading equipment', () => {
    const errorMessage = 'Error loading equipment';
    spyOn(equipmentService, 'getEquipmentById').and.returnValue(throwError(() => new Error(errorMessage)));

    component.ngOnInit();
    fixture.detectChanges();

    expect(equipmentService.getEquipmentById).toHaveBeenCalledWith('1');
    expect(component.equipment).toBeNull();
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

  it('should create form with required fields', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const form = component.assignmentForm;
    expect(form.get('workOrderId')).toBeTruthy();
    expect(form.get('assignedTo')).toBeTruthy();
    expect(form.get('startDate')).toBeTruthy();
    expect(form.get('endDate')).toBeTruthy();

    expect(form.get('workOrderId')?.hasError('required')).toBeTrue();
    expect(form.get('assignedTo')?.hasError('required')).toBeTrue();
    expect(form.get('startDate')?.hasError('required')).toBeTrue();
    expect(form.get('endDate')?.hasError('required')).toBeTrue();
  });

  it('should submit form and navigate back on success', () => {
    spyOn(equipmentService, 'assignToWorkOrder').and.returnValue(of(mockEquipment));
    component.equipment = mockEquipment;
    component.ngOnInit();
    fixture.detectChanges();

    component.assignmentForm.patchValue({
      workOrderId: 'WO-123',
      assignedTo: 'John Doe',
      startDate: new Date(),
      endDate: new Date()
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(equipmentService.assignToWorkOrder).toHaveBeenCalledWith('1', 'WO-123');
    expect(router.navigate).toHaveBeenCalledWith(['/equipment', '1']);
  });

  it('should handle error when submitting form', () => {
    const errorMessage = 'Error assigning equipment';
    spyOn(equipmentService, 'assignToWorkOrder').and.returnValue(throwError(() => new Error(errorMessage)));
    component.equipment = mockEquipment;
    component.ngOnInit();
    fixture.detectChanges();

    component.assignmentForm.patchValue({
      workOrderId: 'WO-123',
      assignedTo: 'John Doe',
      startDate: new Date(),
      endDate: new Date()
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(equipmentService.assignToWorkOrder).toHaveBeenCalledWith('1', 'WO-123');
    expect(component.error).toBe(errorMessage);
  });

  it('should navigate back when goBack is called', () => {
    component.equipment = mockEquipment;
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/equipment', '1']);
  });
}); 