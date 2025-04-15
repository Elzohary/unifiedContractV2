import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, timer, switchMap } from 'rxjs';
import { catchError, delay, map, mergeMap, tap } from 'rxjs/operators';
import { WorkOrderRemark } from '../models/work-order.model';
import { WorkOrderService } from './work-order.service';
import { ActivityLogService } from './activity-log.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RemarkService {
  private mockRemarks: WorkOrderRemark[] = [
    {
      id: 'rem1',
      content: 'Initial inspection showed significant wear on electrical panels.',
      createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Robert Chen',
      type: 'technical',
      workOrderId: 'wo2'
    },
    {
      id: 'rem2',
      content: 'Client requested all work to be done after business hours.',
      createdDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Sarah Johnson',
      type: 'general',
      workOrderId: 'wo2'
    },
    {
      id: 'rem3',
      content: 'All team members must wear proper PPE in the server room area.',
      createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'David Park',
      type: 'safety',
      workOrderId: 'wo4'
    },
    {
      id: 'rem4',
      content: 'Water damage more extensive than initially assessed. May require additional materials.',
      createdDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'David Park',
      type: 'technical',
      workOrderId: 'wo4'
    },
    {
      id: 'rem5',
      content: 'Weekly maintenance completed as per specifications. All systems operating within normal parameters.',
      createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Lisa Turner',
      type: 'quality',
      workOrderId: 'wo3'
    },
    {
      id: 'rem6',
      content: 'Client expressed satisfaction with the work completed so far.',
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'Jane Smith',
      type: 'general',
      workOrderId: 'wo1'
    }
  ];

  private remarksSubject = new BehaviorSubject<WorkOrderRemark[]>(this.mockRemarks);
  public remarks$ = this.remarksSubject.asObservable();

  // Simulation settings
  private networkDelay = 0; // Set to 0 to remove artificial delay
  private shouldSimulateError = false;
  private errorRate = 0.1; // 10% chance of error

  // API URL from environment
  private apiUrl = environment.apiUrl;

  constructor(
    private workOrderService: WorkOrderService,
    private activityLogService: ActivityLogService,
    private http: HttpClient
  ) {
    console.log('RemarkService initialized with mock data:', this.mockRemarks);
    this.remarksSubject.next(this.mockRemarks);
  }

  // Utility function to simulate network delay and possible errors
  private simulateNetwork<T>(data: T): Observable<T> {
    // Simulate random network errors
    if (this.shouldSimulateError && Math.random() < this.errorRate) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error('Network error - simulated failure')))
      );
    }
    
    // If network delay is 0, don't use delay operator
    if (this.networkDelay === 0) {
      return of(data);
    }
    
    // Simulate network delay
    return of(data).pipe(delay(this.networkDelay));
  }

  // Get all remarks
  getAllRemarks(): Observable<WorkOrderRemark[]> {
    console.log('Fetching all remarks');
    return this.simulateNetwork(this.remarksSubject.value).pipe(
      catchError(error => {
        console.error('Error fetching remarks:', error);
        return throwError(() => new Error('Failed to fetch remarks'));
      })
    );
  }

  // Get remark by ID
  getRemarkById(id: string): Observable<WorkOrderRemark> {
    console.log(`Fetching remark with ID: ${id}`);
    const remark = this.remarksSubject.value.find(r => r.id === id);
    
    if (!remark) {
      console.warn(`Remark with ID ${id} not found`);
      return throwError(() => new Error(`Remark with ID ${id} not found`));
    }
    
    return this.simulateNetwork(remark).pipe(
      catchError(error => {
        console.error(`Error fetching remark with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to fetch remark with ID ${id}`));
      })
    );
  }

  // Get remarks by work order ID
  getRemarksByWorkOrderId(workOrderId: string): Observable<WorkOrderRemark[]> {
    console.log(`Fetching remarks for work order ID: ${workOrderId}`);
    // Check if work order exists
    if (!this.workOrderService.isValidWorkOrderId(workOrderId)) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }
    
    const filteredRemarks = this.remarksSubject.value.filter(r => r.workOrderId === workOrderId);
    return this.simulateNetwork(filteredRemarks).pipe(
      catchError(error => {
        console.error(`Error fetching remarks for work order ID ${workOrderId}:`, error);
        return throwError(() => new Error(`Failed to fetch remarks for work order ID ${workOrderId}`));
      })
    );
  }

  // Add a new remark
  addRemark(remark: Partial<WorkOrderRemark>): Observable<WorkOrderRemark> {
    console.log('Adding new remark:', remark);
    
    if (!remark.workOrderId) {
      return throwError(() => new Error('Work order ID is required'));
    }
    
    // Check if work order exists
    if (!this.workOrderService.isValidWorkOrderId(remark.workOrderId)) {
      return throwError(() => new Error(`Work order with ID ${remark.workOrderId} not found`));
    }
    
    const newRemark: WorkOrderRemark = {
      id: `rem${Date.now()}`, // Generate a unique ID based on timestamp
      content: remark.content || '',
      createdDate: new Date().toISOString(),
      createdBy: remark.createdBy || 'Unknown User',
      type: remark.type || 'general',
      workOrderId: remark.workOrderId,
      peopleInvolved: remark.peopleInvolved || []
    };
    
    try {
      // First update the local mock data
      const updatedRemarks = [...this.remarksSubject.value, newRemark];
      this.remarksSubject.next(updatedRemarks);
      
      // Instead of calling updateWorkOrder, use the addRemarkToWorkOrder method
      // This ensures consistent handling in both the RemarkService and WorkOrderService
      return this.workOrderService.addRemarkToWorkOrder(remark.workOrderId, {
        content: newRemark.content,
        type: newRemark.type,
        createdBy: newRemark.createdBy,
        peopleInvolved: newRemark.peopleInvolved,
        userId: 'user1', // Using mock user ID for now
      }).pipe(
        // Map the workOrder response to just return the new remark
        map(() => newRemark),
        catchError(error => {
          console.error('Error adding remark via WorkOrderService:', error);
          
          // Roll back our local state in case of error
          const rollbackRemarks = this.remarksSubject.value.filter(r => r.id !== newRemark.id);
          this.remarksSubject.next(rollbackRemarks);
          
          return throwError(() => new Error('Failed to add remark'));
        })
      );
    } catch (error) {
      console.error('Error adding remark:', error);
      return throwError(() => new Error('Failed to add remark'));
    }
  }

  // Update an existing remark
  updateRemark(id: string, remarkData: Partial<WorkOrderRemark>): Observable<WorkOrderRemark> {
    console.log(`Updating remark ${id} with data:`, remarkData);
    const remarks = this.remarksSubject.value;
    const remarkIndex = remarks.findIndex(r => r.id === id);
    
    if (remarkIndex === -1) {
      return throwError(() => new Error(`Remark with ID ${id} not found`));
    }

    try {
      // Get original remark
      const originalRemark = remarks[remarkIndex];
      
      // Create updated remark preserving original properties if not in remarkData
      const updatedRemark: WorkOrderRemark = {
        ...originalRemark,
        ...remarkData,
        // Ensure we don't lose the workOrderId
        workOrderId: originalRemark.workOrderId
      };

      // Update our local remarks array
      remarks[remarkIndex] = updatedRemark;
      this.remarksSubject.next([...remarks]);
      
      // Use the WorkOrderService's updateRemark method directly
      return this.workOrderService.updateRemark(updatedRemark.workOrderId, id, {
        content: updatedRemark.content,
        type: updatedRemark.type,
        peopleInvolved: updatedRemark.peopleInvolved,
        userId: 'user1', // Using mock user ID for now
        updatedBy: updatedRemark.createdBy
      }).pipe(
        // Map the workOrder response to just return the updated remark
        map(() => updatedRemark),
        catchError(error => {
          console.error('Error updating remark via WorkOrderService:', error);
          
          // Roll back our local state in case of error
          remarks[remarkIndex] = originalRemark;
          this.remarksSubject.next([...remarks]);
          
          return throwError(() => new Error('Failed to update remark'));
        })
      );
    } catch (error) {
      console.error('Error updating remark:', error);
      return throwError(() => new Error('Failed to update remark'));
    }
  }

  /**
   * Delete a remark
   * @param workOrderId The ID of the work order
   * @param remarkId The ID of the remark to delete
   * @returns An observable of the API response
   */
  deleteRemark(workOrderId: number | string, remarkId: number | string): Observable<any> {
    console.log(`Deleting remark ${remarkId} from work order ${workOrderId}`);
    
    // Convert parameters to strings for consistency with both mock data and API
    const workOrderIdStr = workOrderId.toString();
    const remarkIdStr = remarkId.toString();
    
    // Update local state first - find and remove the remark
    const remarks = this.remarksSubject.value;
    console.log(`Current remarks: ${remarks.length}`, remarks);
    
    // Save the removed remark for potential rollback
    const removedRemark = remarks.find(r => r.id === remarkIdStr);
    console.log(`Remark to delete:`, removedRemark);
    
    if (!removedRemark) {
      console.error(`Remark with ID ${remarkIdStr} not found in RemarkService`);
      return throwError(() => new Error(`Remark with ID ${remarkIdStr} not found`));
    }

    // Filter out the remark to delete from local state
    const filteredRemarks = remarks.filter(r => r.id !== remarkIdStr);
    console.log(`Filtered remarks: ${filteredRemarks.length}`, filteredRemarks);
    
    // Update local state immediately
    this.remarksSubject.next(filteredRemarks);
    
    // Call the work order service's deleteRemark method
    console.log(`Calling WorkOrderService.deleteRemark(${workOrderIdStr}, ${remarkIdStr})`);
    return this.workOrderService.deleteRemark(workOrderIdStr, remarkIdStr).pipe(
      tap(result => console.log('Delete remark result:', result)),
      // Map to empty object to simulate REST API
      map(() => ({})),
      catchError(error => {
        console.error('Error deleting remark:', error);
        
        // Log more details about the error
        if (error instanceof Error) {
          console.error(`Error name: ${error.name}, message: ${error.message}`);
          console.error(`Stack: ${error.stack}`);
        }
        
        // Handle specific error case: if remark not found in WorkOrderService
        // but successfully removed from RemarkService, consider it a success
        if (error.message && (
            error.message.includes("not found in work order") || 
            error.message.includes("No remarks found")
        )) {
          console.log("Remark was successfully deleted from RemarkService but not found in WorkOrderService - considering operation successful");
          return of({});
        }
        
        // Otherwise rollback the local state in case of error
        this.remarksSubject.next(remarks);
        
        return throwError(() => new Error('Failed to delete remark: ' + (error.message || 'Unknown error')));
      })
    );
  }

  /**
   * Handle HTTP errors
   * @param error The HTTP error response
   * @returns An observable with the error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 