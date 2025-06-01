import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, finalize, takeUntil, catchError } from 'rxjs/operators';
import { WorkOrderRemark } from '../models/work-order.model';
import { RemarkService } from '../services/remark.service';
import { of } from 'rxjs';

export interface WorkOrderRemarksState {
  remarks: WorkOrderRemark[];
  loading: boolean;
  error: string | null;
  filter: {
    type?: string;
    searchTerm?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderRemarksViewModel {
  // State management
  private stateSubject = new BehaviorSubject<WorkOrderRemarksState>({
    remarks: [],
    loading: false,
    error: null,
    filter: {}
  });

  // Expose state as observables
  public state$ = this.stateSubject.asObservable();
  public remarks$ = this.state$.pipe(map(state => this.applyFilters(state.remarks, state.filter)));
  public loading$ = this.state$.pipe(map(state => state.loading));
  public error$ = this.state$.pipe(map(state => state.error));

  // Lifecycle management
  private destroy$ = new Subject<void>();

  constructor(private remarkService: RemarkService) {}

  /**
   * Load remarks for a specific work order
   */
  loadRemarksForWorkOrder(workOrderId: string): void {
    this.updateState({ loading: true, error: null });

    this.remarkService.getRemarksByWorkOrderId(workOrderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false })),
        catchError(error => {
          console.error('Error loading remarks:', error);
          this.updateState({ error: 'Failed to load remarks' });
          return of([]);
        })
      )
      .subscribe(remarks => {
        this.updateState({ remarks });
      });
  }

  /**
   * Add a new remark
   */
  addRemark(remarkData: {
    workOrderId: string;
    content: string;
    type: string;
    createdBy: string;
    peopleInvolved?: string[];
  }): Observable<WorkOrderRemark | null> {
    this.updateState({ loading: true });

    return this.remarkService.addRemark(remarkData)
      .pipe(
        finalize(() => this.updateState({ loading: false })),
        map(newRemark => {
          if (newRemark) {
            const remarks = [...this.getCurrentState().remarks, newRemark];
            this.updateState({ remarks });
          }
          return newRemark;
        }),
        catchError(error => {
          console.error('Error adding remark:', error);
          this.updateState({ error: 'Failed to add remark' });
          return of(null);
        })
      );
  }

  /**
   * Update an existing remark
   */
  updateRemark(
    remarkId: string,
    updates: {
      content?: string;
      type?: string;
      peopleInvolved?: string[];
    }
  ): Observable<WorkOrderRemark | null> {
    this.updateState({ loading: true });

    return this.remarkService.updateRemark(remarkId, updates)
      .pipe(
        finalize(() => this.updateState({ loading: false })),
        map(updatedRemark => {
          if (updatedRemark) {
            const remarks = this.getCurrentState().remarks.map(remark =>
              remark.id === remarkId ? updatedRemark : remark
            );
            this.updateState({ remarks });
          }
          return updatedRemark;
        }),
        catchError(error => {
          console.error('Error updating remark:', error);
          this.updateState({ error: 'Failed to update remark' });
          return of(null);
        })
      );
  }

  /**
   * Delete a remark
   */
  deleteRemark(remarkId: string): Observable<boolean> {
    this.updateState({ loading: true });

    return this.remarkService.deleteRemark(remarkId)
      .pipe(
        finalize(() => this.updateState({ loading: false })),
        map(success => {
          if (success) {
            const remarks = this.getCurrentState().remarks.filter(
              remark => remark.id !== remarkId
            );
            this.updateState({ remarks });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error deleting remark:', error);
          this.updateState({ error: 'Failed to delete remark' });
          return of(false);
        })
      );
  }

  /**
   * Update filters
   */
  updateFilters(filters: Partial<WorkOrderRemarksState['filter']>): void {
    const currentState = this.getCurrentState();
    this.updateState({
      filter: {
        ...currentState.filter,
        ...filters
      }
    });
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.updateState({ filter: {} });
  }

  /**
   * Apply filters to remarks
   */
  private applyFilters(
    remarks: WorkOrderRemark[],
    filter: WorkOrderRemarksState['filter']
  ): WorkOrderRemark[] {
    let filtered = [...remarks];

    // Filter by type
    if (filter.type) {
      filtered = filtered.filter(remark => remark.type === filter.type);
    }

    // Filter by search term
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(remark =>
        remark.content.toLowerCase().includes(term) ||
        remark.createdBy.toLowerCase().includes(term) ||
        (remark.peopleInvolved && remark.peopleInvolved.some(person =>
          person.toLowerCase().includes(term)
        ))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdDate).getTime();
      const dateB = new Date(b.createdDate).getTime();
      return dateB - dateA;
    });

    return filtered;
  }

  /**
   * Get current state
   */
  private getCurrentState(): WorkOrderRemarksState {
    return this.stateSubject.getValue();
  }

  /**
   * Update state
   */
  private updateState(partialState: Partial<WorkOrderRemarksState>): void {
    this.stateSubject.next({
      ...this.getCurrentState(),
      ...partialState
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 