import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EquipmentService } from './equipment.service';
import { StateService } from '../../../core/services/state.service';
import { Equipment, EquipmentStatus, AssignmentStatus } from '../models/equipment.model';

describe('EquipmentService', () => {
  let service: EquipmentService;
  let httpMock: HttpTestingController;
  let stateService: StateService;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EquipmentService,
        StateService
      ]
    });

    service = TestBed.inject(EquipmentService);
    httpMock = TestBed.inject(HttpTestingController);
    stateService = TestBed.inject(StateService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllEquipment', () => {
    it('should fetch all equipment and update state', () => {
      const mockEquipmentList = [mockEquipment];
      spyOn(stateService, 'setLoading');
      spyOn(stateService, 'setError');
      spyOn(stateService, 'updateEquipment');

      service.getAllEquipment().subscribe(equipment => {
        expect(equipment).toEqual(mockEquipmentList);
        expect(stateService.updateEquipment).toHaveBeenCalledWith(mockEquipmentList);
        expect(stateService.setLoading).toHaveBeenCalledWith(false);
        expect(stateService.setError).toHaveBeenCalledWith(null);
      });

      const req = httpMock.expectOne('api/equipment');
      expect(req.request.method).toBe('GET');
      req.flush(mockEquipmentList);
    });

    it('should handle errors when fetching equipment', () => {
      const errorMessage = 'Error fetching equipment';
      spyOn(stateService, 'setError');
      spyOn(stateService, 'setLoading');

      service.getAllEquipment().subscribe({
        error: error => {
          expect(error.message).toBe('Http failure response for api/equipment: 0 ');
          expect(stateService.setError).toHaveBeenCalledWith('Http failure response for api/equipment: 0 ');
          expect(stateService.setLoading).toHaveBeenCalledWith(false);
        }
      });

      const req = httpMock.expectOne('api/equipment');
      req.error(new ErrorEvent('Network error', { message: errorMessage }));
    });
  });

  describe('getEquipmentById', () => {
    it('should fetch equipment by id', () => {
      spyOn(stateService, 'setLoading');
      spyOn(stateService, 'setError');

      service.getEquipmentById('1').subscribe(equipment => {
        expect(equipment).toEqual(mockEquipment);
        expect(stateService.setLoading).toHaveBeenCalledWith(false);
      });

      const req = httpMock.expectOne('api/equipment/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockEquipment);
    });
  });

  describe('createEquipment', () => {
    it('should create new equipment and update state', () => {
      spyOn(stateService, 'getState').and.returnValue({
        resources: { equipment: [] }
      } as any);
      spyOn(stateService, 'updateEquipment');

      service.createEquipment(mockEquipment).subscribe(equipment => {
        expect(equipment).toEqual(mockEquipment);
        expect(stateService.updateEquipment).toHaveBeenCalledWith([mockEquipment]);
      });

      const req = httpMock.expectOne('api/equipment');
      expect(req.request.method).toBe('POST');
      req.flush(mockEquipment);
    });
  });

  describe('updateEquipment', () => {
    it('should update equipment and update state', () => {
      const updatedEquipment = { ...mockEquipment, name: 'Updated Equipment' };
      spyOn(stateService, 'getState').and.returnValue({
        resources: { equipment: [mockEquipment] }
      } as any);
      spyOn(stateService, 'updateEquipment');

      service.updateEquipment('1', updatedEquipment).subscribe(equipment => {
        expect(equipment).toEqual(updatedEquipment);
        expect(stateService.updateEquipment).toHaveBeenCalled();
      });

      const req = httpMock.expectOne('api/equipment/1');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedEquipment);
    });
  });

  describe('deleteEquipment', () => {
    it('should delete equipment and update state', () => {
      spyOn(stateService, 'getState').and.returnValue({
        resources: { equipment: [mockEquipment] }
      } as any);
      spyOn(stateService, 'updateEquipment');

      service.deleteEquipment('1').subscribe(result => {
        expect(result).toBe(true);
        expect(stateService.updateEquipment).toHaveBeenCalledWith([]);
      });

      const req = httpMock.expectOne('api/equipment/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(true);
    });
  });

  describe('assignToWorkOrder', () => {
    it('should create assignment and update equipment', () => {
      const workOrderId = 'wo-123';
      spyOn(service, 'updateEquipment').and.callThrough();

      service.assignToWorkOrder('1', workOrderId).subscribe(() => {
        expect(service.updateEquipment).toHaveBeenCalled();
      });

      const req = httpMock.expectOne('api/equipment/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.currentAssignment).toBeDefined();
      expect(req.request.body.currentAssignment.workOrderId).toBe(workOrderId);
      expect(req.request.body.currentAssignment.status).toBe(AssignmentStatus.Active);
      req.flush(mockEquipment);
    });
  });

  describe('addMaintenanceRecord', () => {
    it('should add maintenance record and update equipment', () => {
      const maintenanceRecord = {
        type: 'Routine',
        date: new Date(),
        description: 'Test maintenance',
        cost: 100,
        performedBy: 'Test User',
        nextMaintenanceDate: new Date()
      };

      spyOn(service, 'updateEquipment').and.callThrough();

      service.addMaintenanceRecord('1', maintenanceRecord).subscribe(() => {
        expect(service.updateEquipment).toHaveBeenCalled();
      });

      const req = httpMock.expectOne('api/equipment/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.maintenanceHistory).toBeDefined();
      expect(req.request.body.maintenanceHistory[0].type).toBe(maintenanceRecord.type);
      req.flush(mockEquipment);
    });
  });
}); 