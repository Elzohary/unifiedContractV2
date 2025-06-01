import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, finalize, takeUntil, switchMap, catchError, filter } from 'rxjs/operators';
import { WorkOrder, WorkOrderStatus, Task } from '../models/work-order.model';
import { WorkOrderService } from '../services/work-order.service';
import { ActivityLogService, ActivityLog, ActivityFilter } from '../../../shared/services/activity-log.service';
import { TaskService } from '../../../shared/services/task.service';
import { of } from 'rxjs';

export interface WorkOrderDetailsState {
  workOrder: WorkOrder | null;
  loading: boolean;
  error: string | null;
  activityLogs: ActivityLog[];
  tasks: Task[];
  activeTab: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderDetailsViewModel {
  // State management
  private stateSubject = new BehaviorSubject<WorkOrderDetailsState>({
    workOrder: null,
    loading: false,
    error: null,
    activityLogs: [],
    tasks: [],
    activeTab: 'overview'
  });

  // Expose state as observables
  public state$ = this.stateSubject.asObservable();
  public workOrder$ = this.state$.pipe(map(state => state.workOrder));
  public loading$ = this.state$.pipe(map(state => state.loading));
  public error$ = this.state$.pipe(map(state => state.error));
  public activityLogs$ = this.state$.pipe(map(state => state.activityLogs));
  public tasks$ = this.state$.pipe(map(state => state.tasks));
  public activeTab$ = this.state$.pipe(map(state => state.activeTab));

  // Lifecycle management
  private destroy$ = new Subject<void>();

  constructor(
    private workOrderService: WorkOrderService,
    private activityLogService: ActivityLogService,
    private taskService: TaskService
  ) {}

  /**
   * Load work order details and related data
   */
  loadWorkOrderDetails(workOrderId: string): void {
    this.updateState({ loading: true, error: null });

    this.workOrderService.getWorkOrderById(workOrderId)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(workOrder => {
          if (!workOrder) {
            throw new Error('Work order not found');
          }

          // Update work order in state immediately
          this.updateState({ workOrder });

          // Load related data in parallel
          return combineLatest([
            of(workOrder),
            this.loadActivityLogs(workOrderId),
            this.loadTasks(workOrderId)
          ]);
        }),
        catchError(error => {
          console.error('Error loading work order details:', error);
          this.updateState({
            error: error.message || 'Failed to load work order details',
            loading: false
          });
          return of(null);
        }),
        finalize(() => this.updateState({ loading: false }))
      )
      .subscribe();
  }

  /**
   * Update work order status
   */
  updateWorkOrderStatus(workOrderId: string, newStatus: WorkOrderStatus): Observable<boolean> {
    return this.workOrderService.updateWorkOrderStatus(workOrderId, newStatus)
      .pipe(
        map(updatedWorkOrder => {
          if (updatedWorkOrder) {
            this.updateState({ workOrder: updatedWorkOrder });
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Error updating work order status:', error);
          return of(false);
        })
      );
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this.updateState({ activeTab: tab });
  }

  /**
   * Load activity logs
   */
  private loadActivityLogs(workOrderId: string): Observable<ActivityLog[]> {
    return this.activityLogService.getRelatedActivityLogs('workOrder', workOrderId)
      .pipe(
        map(logs => {
          this.updateState({ activityLogs: logs });
          return logs;
        }),
        catchError(error => {
          console.error('Error loading activity logs:', error);
          return of([]);
        })
      );
  }

  /**
   * Load tasks
   */
  private loadTasks(workOrderId: string): Observable<Task[]> {
    // Convert string ID to number for the service
    const numericId = parseInt(workOrderId, 10);
    return this.taskService.getTasksByWorkOrderId(numericId)
      .pipe(
        map(tasks => {
          this.updateState({ tasks });
          return tasks;
        }),
        catchError(error => {
          console.error('Error loading tasks:', error);
          return of([]);
        })
      );
  }

  /**
   * Update a task
   */
  updateTask(task: Task): Observable<boolean> {
    return this.taskService.updateTask(task)
      .pipe(
        map(updatedTask => {
          if (updatedTask) {
            const tasks = this.getCurrentState().tasks.map(t =>
              t.id === task.id ? updatedTask : t
            );
            this.updateState({ tasks });
            return true;
          }
          return false;
        }),
        catchError(error => {
          console.error('Error updating task:', error);
          return of(false);
        })
      );
  }

  /**
   * Add a new task
   */
  addTask(workOrderId: string, task: Partial<Task>): Observable<Task | null> {
    const numericId = parseInt(workOrderId, 10);
    const taskData = { ...task, workOrderId: numericId } as Omit<Task, 'id'>;
    
    return this.taskService.createTask(taskData)
      .pipe(
        map(newTask => {
          if (newTask) {
            const tasks = [...this.getCurrentState().tasks, newTask];
            this.updateState({ tasks });
          }
          return newTask;
        }),
        catchError(error => {
          console.error('Error adding task:', error);
          return of(null);
        })
      );
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): Observable<boolean> {
    return this.taskService.deleteTask(taskId)
      .pipe(
        map(result => {
          const success = typeof result === 'boolean' ? result : result.success;
          if (success) {
            const tasks = this.getCurrentState().tasks.filter(task => task.id !== taskId);
            this.updateState({ tasks });
          }
          return success;
        }),
        catchError(error => {
          console.error('Error deleting task:', error);
          return of(false);
        })
      );
  }

  /**
   * Get current state
   */
  private getCurrentState(): WorkOrderDetailsState {
    return this.stateSubject.getValue();
  }

  /**
   * Update state
   */
  private updateState(partialState: Partial<WorkOrderDetailsState>): void {
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