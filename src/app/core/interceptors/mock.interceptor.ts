import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Equipment, EquipmentStatus } from '../../modules/resources/models/equipment.model';

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Excavator XL2000',
    type: 'Heavy Equipment',
    model: 'XL2000',
    serialNumber: 'EX123456',
    manufacturer: 'Heavy Machines Inc',
    status: EquipmentStatus.Available,
    department: 'Construction',
    location: 'Site A',
    purchaseDate: new Date('2023-01-01'),
    purchaseCost: 150000,
    currentValue: 120000,
    specifications: {
      weight: '20000kg',
      power: '400hp'
    },
    maintenanceHistory: [],
    lastActivityDate: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    nextMaintenanceType: 'Routine',
    lastInspectionDate: new Date(),
    nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Crane CR500',
    type: 'Heavy Equipment',
    model: 'CR500',
    serialNumber: 'CR789012',
    manufacturer: 'Crane Masters',
    status: EquipmentStatus.InUse,
    department: 'Construction',
    location: 'Site B',
    purchaseDate: new Date('2023-02-15'),
    purchaseCost: 200000,
    currentValue: 180000,
    specifications: {
      height: '50m',
      capacity: '30tons'
    },
    maintenanceHistory: [],
    lastActivityDate: new Date(),
    nextMaintenanceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    nextMaintenanceType: 'Inspection',
    lastInspectionDate: new Date(),
    nextInspectionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  }
];

export const mockInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (!environment.useMockData) {
    return next(req);
  }

  const equipmentEndpoint = `${environment.apiUrl}/equipment`;
  
  if (req.url.startsWith(equipmentEndpoint)) {
    if (req.method === 'GET') {
      if (req.url === equipmentEndpoint) {
        return of(new HttpResponse({ status: 200, body: mockEquipment }))
          .pipe(delay(environment.mockDataDelay));
      } else {
        const id = req.url.split('/').pop();
        const equipment = mockEquipment.find(e => e.id === id);
        if (equipment) {
          return of(new HttpResponse({ status: 200, body: equipment }))
            .pipe(delay(environment.mockDataDelay));
        }
      }
    } else if (req.method === 'POST') {
      const newEquipment = { ...req.body as Equipment, id: crypto.randomUUID() };
      mockEquipment.push(newEquipment);
      return of(new HttpResponse({ status: 200, body: newEquipment }))
        .pipe(delay(environment.mockDataDelay));
    } else if (req.method === 'PUT') {
      const id = req.url.split('/').pop();
      const index = mockEquipment.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEquipment[index] = { ...mockEquipment[index], ...req.body as Equipment };
        return of(new HttpResponse({ status: 200, body: mockEquipment[index] }))
          .pipe(delay(environment.mockDataDelay));
      }
    } else if (req.method === 'DELETE') {
      const id = req.url.split('/').pop();
      const index = mockEquipment.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEquipment.splice(index, 1);
        return of(new HttpResponse({ status: 200, body: true }))
          .pipe(delay(environment.mockDataDelay));
      }
    }
  }

  return next(req);
}; 