import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipmentListComponent } from './equipment-list.component';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { of, throwError } from 'rxjs';

describe('EquipmentListComponent', () => {
  let component: EquipmentListComponent;
  let fixture: ComponentFixture<EquipmentListComponent>;
  let equipmentService: EquipmentService;
  let stateService: StateService;

  const mockEquipment: Equipment[] = [
    {
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
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterModule.forRoot([])
      ],
      declarations: [EquipmentListComponent],
      providers: [EquipmentService, StateService]
    }).compileComponents();

    equipmentService = TestBed.inject(EquipmentService);
    stateService = TestBed.inject(StateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentListComponent);
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

  it('should display equipment table when data is loaded', () => {
    component.equipment = mockEquipment;
    component.isLoading = false;
    component.error = null;
    fixture.detectChanges();

    const tableElement = fixture.nativeElement.querySelector('table');
    expect(tableElement).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('tr').length).toBe(2); // Header row + data row
  });
}); 