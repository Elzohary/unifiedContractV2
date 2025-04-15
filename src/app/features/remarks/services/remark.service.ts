import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { WorkOrderRemark } from '../../../shared/models/work-order.model';

@Injectable({
  providedIn: 'root'
})
export class RemarkService {
  private readonly endpoint = 'remarks';

  constructor(
    private apiService: ApiService,
    private stateService: StateService
  ) {}

  // Get all remarks
  getAllRemarks(): Observable<WorkOrderRemark[]> {
    this.stateService.setLoading('remarks', true);
    
    return this.apiService.get<WorkOrderRemark[]>(this.endpoint).pipe(
      map(response => {
        const remarks = response.data;
        this.stateService.updateRemarks(remarks);
        return remarks;
      }),
      catchError(error => {
        this.stateService.setError('remarks', error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading('remarks', false);
      })
    );
  }

  // Get remark by ID
  getRemarkById(id: string): Observable<WorkOrderRemark | null> {
    this.stateService.setLoading(`remark-${id}`, true);
    
    return this.apiService.get<WorkOrderRemark>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError(`remark-${id}`, error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading(`remark-${id}`, false);
      })
    );
  }

  // Get remarks by work order ID
  getRemarksByWorkOrderId(workOrderId: string): Observable<WorkOrderRemark[]> {
    this.stateService.setLoading(`remarks-${workOrderId}`, true);
    
    return this.apiService.get<WorkOrderRemark[]>(`${this.endpoint}/work-order/${workOrderId}`).pipe(
      map(response => response.data),
      catchError(error => {
        this.stateService.setError(`remarks-${workOrderId}`, error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading(`remarks-${workOrderId}`, false);
      })
    );
  }

  // Add a new remark
  addRemark(remark: Partial<WorkOrderRemark>): Observable<WorkOrderRemark | null> {
    this.stateService.setLoading('addRemark', true);
    
    return this.apiService.post<WorkOrderRemark>(this.endpoint, remark).pipe(
      map(response => {
        const newRemark = response.data;
        // Update local state
        const currentRemarks = this.stateService.remarks$();
        this.stateService.updateRemarks([...currentRemarks, newRemark]);
        return newRemark;
      }),
      catchError(error => {
        this.stateService.setError('addRemark', error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading('addRemark', false);
      })
    );
  }

  // Update an existing remark
  updateRemark(id: string, remarkData: Partial<WorkOrderRemark>): Observable<WorkOrderRemark | null> {
    this.stateService.setLoading(`updateRemark-${id}`, true);
    
    return this.apiService.put<WorkOrderRemark>(`${this.endpoint}/${id}`, remarkData).pipe(
      map(response => {
        const updatedRemark = response.data;
        // Update local state
        const currentRemarks = this.stateService.remarks$();
        const updatedRemarks = currentRemarks.map(r => 
          r.id === id ? updatedRemark : r
        );
        this.stateService.updateRemarks(updatedRemarks);
        return updatedRemark;
      }),
      catchError(error => {
        this.stateService.setError(`updateRemark-${id}`, error.message);
        return of(null);
      }),
      finalize(() => {
        this.stateService.setLoading(`updateRemark-${id}`, false);
      })
    );
  }

  // Delete a remark
  deleteRemark(id: string): Observable<boolean> {
    this.stateService.setLoading(`deleteRemark-${id}`, true);
    
    return this.apiService.delete<boolean>(`${this.endpoint}/${id}`).pipe(
      map(response => {
        if (response.data) {
          // Update local state
          const currentRemarks = this.stateService.remarks$();
          const updatedRemarks = currentRemarks.filter(r => r.id !== id);
          this.stateService.updateRemarks(updatedRemarks);
        }
        return response.data;
      }),
      catchError(error => {
        this.stateService.setError(`deleteRemark-${id}`, error.message);
        return of(false);
      }),
      finalize(() => {
        this.stateService.setLoading(`deleteRemark-${id}`, false);
      })
    );
  }
} 