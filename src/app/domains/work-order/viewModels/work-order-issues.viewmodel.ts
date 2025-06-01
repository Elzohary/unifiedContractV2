import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, finalize, takeUntil, catchError } from 'rxjs/operators';
import { WorkOrderIssue } from '../models/work-order.model';
import { WorkOrderService } from '../services/work-order.service';
import { of } from 'rxjs';

export interface WorkOrderIssuesState {
  issues: WorkOrderIssue[];
  loading: boolean;
  error: string | null;
  filter: {
    status?: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    searchTerm?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderIssuesViewModel {
  // State management
  private stateSubject = new BehaviorSubject<WorkOrderIssuesState>({
    issues: [],
    loading: false,
    error: null,
    filter: {}
  });

  // Expose state as observables
  public state$ = this.stateSubject.asObservable();
  public issues$ = this.state$.pipe(map(state => this.applyFilters(state.issues, state.filter)));
  public loading$ = this.state$.pipe(map(state => state.loading));
  public error$ = this.state$.pipe(map(state => state.error));
  public openIssuesCount$ = this.issues$.pipe(
    map(issues => issues.filter(issue => issue.status === 'open').length)
  );

  // Lifecycle management
  private destroy$ = new Subject<void>();
  private currentWorkOrderId: string | null = null;

  constructor(private workOrderService: WorkOrderService) {}

  /**
   * Load issues for a specific work order
   */
  loadIssuesForWorkOrder(workOrderId: string): void {
    this.currentWorkOrderId = workOrderId;
    this.updateState({ loading: true, error: null });

    this.workOrderService.getWorkOrderById(workOrderId)
      .pipe(
        takeUntil(this.destroy$),
        map(workOrder => workOrder?.issues || []),
        finalize(() => this.updateState({ loading: false })),
        catchError(error => {
          console.error('Error loading issues:', error);
          this.updateState({ error: 'Failed to load issues' });
          return of([]);
        })
      )
      .subscribe(issues => {
        this.updateState({ issues });
      });
  }

  /**
   * Add a new issue
   */
  addIssue(issue: Omit<WorkOrderIssue, 'id'>): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    const newIssue: WorkOrderIssue = {
      ...issue,
      id: `issue_${Date.now()}`,
      reportedDate: new Date()
    };

    return this.workOrderService.addIssue(this.currentWorkOrderId, newIssue)
      .pipe(
        map(success => {
          if (success) {
            const issues = [...this.getCurrentState().issues, newIssue];
            this.updateState({ issues });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error adding issue:', error);
          this.updateState({ error: 'Failed to add issue' });
          return of(false);
        })
      );
  }

  /**
   * Update an existing issue
   */
  updateIssue(issueId: string, updates: Partial<WorkOrderIssue>): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    return this.workOrderService.updateIssue(this.currentWorkOrderId, issueId, updates)
      .pipe(
        map(success => {
          if (success) {
            const issues = this.getCurrentState().issues.map(issue =>
              issue.id === issueId ? { ...issue, ...updates } : issue
            );
            this.updateState({ issues });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error updating issue:', error);
          this.updateState({ error: 'Failed to update issue' });
          return of(false);
        })
      );
  }

  /**
   * Resolve an issue
   */
  resolveIssue(issueId: string, resolutionNotes: string): Observable<boolean> {
    return this.updateIssue(issueId, {
      status: 'resolved',
      resolutionDate: new Date(),
      resolutionNotes
    });
  }

  /**
   * Delete an issue
   */
  deleteIssue(issueId: string): Observable<boolean> {
    if (!this.currentWorkOrderId) return of(false);

    return this.workOrderService.deleteIssue(this.currentWorkOrderId, issueId)
      .pipe(
        map(success => {
          if (success) {
            const issues = this.getCurrentState().issues.filter(
              issue => issue.id !== issueId
            );
            this.updateState({ issues });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error deleting issue:', error);
          this.updateState({ error: 'Failed to delete issue' });
          return of(false);
        })
      );
  }

  /**
   * Update filters
   */
  updateFilters(filters: Partial<WorkOrderIssuesState['filter']>): void {
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
   * Apply filters to issues
   */
  private applyFilters(
    issues: WorkOrderIssue[],
    filter: WorkOrderIssuesState['filter']
  ): WorkOrderIssue[] {
    let filtered = [...issues];

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter(issue => issue.status === filter.status);
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter(issue => issue.priority === filter.priority);
    }

    // Filter by search term
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(term) ||
        issue.description.toLowerCase().includes(term) ||
        issue.reportedBy.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first) and priority
    filtered.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date
      const dateA = new Date(a.reportedDate).getTime();
      const dateB = new Date(b.reportedDate).getTime();
      return dateB - dateA;
    });

    return filtered;
  }

  /**
   * Get current state
   */
  private getCurrentState(): WorkOrderIssuesState {
    return this.stateSubject.getValue();
  }

  /**
   * Update state
   */
  private updateState(partialState: Partial<WorkOrderIssuesState>): void {
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
    this.currentWorkOrderId = null;
  }
} 