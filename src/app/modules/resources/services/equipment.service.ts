import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Equipment, Assignment, MaintenanceRecord, AssignmentStatus } from '../models/equipment.model';
import { StateService } from '../../../core/services/state.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(
    private http: HttpClient,
    private stateService: StateService
  ) {}

  getAllEquipment(): Observable<Equipment[]> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    return this.http.get<Equipment[]>(this.apiUrl).pipe(
      tap(equipment => {
        this.stateService.updateEquipment(equipment);
        this.stateService.setLoading(false);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  getEquipmentById(id: string): Observable<Equipment> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    return this.http.get<Equipment>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.stateService.setLoading(false);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  createEquipment(equipment: Partial<Equipment>): Observable<Equipment> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    return this.http.post<Equipment>(this.apiUrl, equipment).pipe(
      tap(newEquipment => {
        const currentEquipment = this.stateService.getState().resources.equipment;
        this.stateService.updateEquipment([...currentEquipment, newEquipment]);
        this.stateService.setLoading(false);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  updateEquipment(id: string, equipment: Partial<Equipment>): Observable<Equipment> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment).pipe(
      tap(updatedEquipment => {
        const currentEquipment = this.stateService.getState().resources.equipment;
        const updatedList = currentEquipment.map(equip => 
          equip.id === id ? updatedEquipment : equip
        );
        this.stateService.updateEquipment(updatedList);
        this.stateService.setLoading(false);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  deleteEquipment(id: string): Observable<boolean> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentEquipment = this.stateService.getState().resources.equipment;
        const updatedList = currentEquipment.filter(equip => equip.id !== id);
        this.stateService.updateEquipment(updatedList);
        this.stateService.setLoading(false);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  assignToWorkOrder(equipmentId: string, workOrderId: string): Observable<Equipment> {
    const assignment: Assignment = {
      id: crypto.randomUUID(),
      workOrderId,
      startDate: new Date(),
      status: AssignmentStatus.Active,
      assignedTo: 'System User', // TODO: Replace with actual user
      hours: 0,
      rate: 0
    };

    return this.updateEquipment(equipmentId, {
      currentAssignment: assignment
    });
  }

  addMaintenanceRecord(equipmentId: string, record: Omit<MaintenanceRecord, 'id'>): Observable<Equipment> {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: crypto.randomUUID()
    };

    return this.updateEquipment(equipmentId, {
      maintenanceHistory: [newRecord]
    });
  }
} 