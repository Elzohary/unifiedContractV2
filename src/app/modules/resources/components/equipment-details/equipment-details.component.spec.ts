import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EquipmentDetailsComponent } from './equipment-details.component';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';
import { of, throwError } from 'rxjs';

describe('EquipmentDetailsComponent', () => {
  let component: EquipmentDetailsComponent;
  let fixture: ComponentFixture<EquipmentDetailsComponent>;
  let equipmentService: EquipmentService;
  let stateService: StateService;
  let router: Router;
  let route: ActivatedRoute;

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
    specifications: {
      'Test Spec': 'Test Value'
    },
    maintenanceHistory: [],
    lastActivityDate: new Date()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatChipsModule
      ],
      declarations: [EquipmentDetailsComponent],
      providers: [
        EquipmentService,
        StateService,
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentDetailsComponent);
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

  it('should display equipment details when data is loaded', () => {
    component.equipment = mockEquipment;
    component.isLoading = false;
    component.error = null;
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('mat-card');
    expect(cardElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Test Equipment');
    expect(fixture.nativeElement.textContent).toContain('Test Type');
    expect(fixture.nativeElement.textContent).toContain('Test Model');
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/equipment']);
  });

  it('should navigate to edit page when editEquipment is called', () => {
    component.equipment = mockEquipment;
    component.editEquipment();
    expect(router.navigate).toHaveBeenCalledWith(['/equipment', '1', 'edit']);
  });

  it('should delete equipment and navigate back when deleteEquipment is called', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(equipmentService, 'deleteEquipment').and.returnValue(of(true));

    component.equipment = mockEquipment;
    component.deleteEquipment();

    expect(equipmentService.deleteEquipment).toHaveBeenCalledWith('1');
    expect(router.navigate).toHaveBeenCalledWith(['/equipment']);
  });
}); 