import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { Manpower, AvailabilityStatus, AssignmentStatus } from '../models/manpower.model';

@Injectable({
  providedIn: 'root'
})
export class ManpowerService {
  private endpoint = 'manpower';

  constructor(
    private apiService: ApiService,
    private stateService: StateService
  ) {}

  getAllManpower(): Observable<Manpower[]> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.get<Manpower[]>(this.endpoint).pipe(
      map(response => {
        this.stateService.updateManpower(response.data);
        return response.data;
      }),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  getManpowerById(id: string): Observable<Manpower | null> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.get<Manpower>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  createManpower(manpower: Partial<Manpower>): Observable<Manpower | null> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.post<Manpower>(this.endpoint, manpower).pipe(
      map(response => {
        const newManpower = response.data;
        const currentManpower = this.stateService.manpower$();
        this.stateService.updateManpower([...currentManpower, newManpower]);
        return newManpower;
      }),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  updateManpower(id: string, manpower: Partial<Manpower>): Observable<Manpower | null> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.put<Manpower>(`${this.endpoint}/${id}`, manpower).pipe(
      map(response => {
        const updatedManpower = response.data;
        const currentManpower = this.stateService.manpower$();
        const updatedManpowerList = currentManpower.map(mp => 
          mp.id === id ? updatedManpower : mp
        );
        this.stateService.updateManpower(updatedManpowerList);
        return updatedManpower;
      }),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  deleteManpower(id: string): Observable<boolean> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.delete<Manpower>(`${this.endpoint}/${id}`).pipe(
      map(() => {
        const currentManpower = this.stateService.manpower$();
        const updatedManpower = currentManpower.filter(mp => mp.id !== id);
        this.stateService.updateManpower(updatedManpower);
        return true;
      }),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of(false);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  updateAvailability(id: string, status: AvailabilityStatus): Observable<Manpower | null> {
    return this.updateManpower(id, {
      availability: {
        status,
        startDate: new Date()
      }
    });
  }

  assignToWorkOrder(id: string, workOrderId: string, role: string): Observable<Manpower | null> {
    const assignment = {
      id: crypto.randomUUID(),
      workOrderId,
      role,
      startDate: new Date(),
      endDate: new Date(),
      hours: 0,
      rate: 0,
      status: AssignmentStatus.Pending
    };

    return this.updateManpower(id, {
      currentAssignments: [assignment]
    });
  }

  completeAssignment(id: string, assignmentId: string): Observable<Manpower | null> {
    return this.updateManpower(id, {
      currentAssignments: [],
      historicalAssignments: [{
        id: assignmentId,
        workOrderId: '',
        role: '',
        startDate: new Date(),
        endDate: new Date(),
        hours: 0,
        rate: 0,
        status: AssignmentStatus.Completed
      }]
    });
  }

  getManpowerByDepartment(department: string): Observable<Manpower[]> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.get<Manpower[]>(`${this.endpoint}/department/${department}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }

  getAvailableManpower(): Observable<Manpower[]> {
    this.stateService.setLoading('manpower', true);
    this.stateService.setError('manpower', null);

    return this.apiService.get<Manpower[]>(`${this.endpoint}/available`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError('manpower', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('manpower', false);
      })
    );
  }
} 