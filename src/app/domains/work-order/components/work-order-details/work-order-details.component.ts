import { Component, Inject, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkOrderService } from '../../services/work-order.service';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderRemark,
  WorkOrderIssue,
  Task,
  workOrderItem,
  workOrderDetail
} from '../../models/work-order.model';
import { catchError, finalize, of, Subject, takeUntil, forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RemarkDialogComponent } from '../../../../features/dashboards/dashboard-management/components/remark-dialog/remark-dialog.component';
import { UserService } from '../../../../shared/services/user.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ActivityLogService, ActivityLog } from '../../../../shared/services/activity-log.service';
import { PrintService } from '../../../../shared/services/print.service';
import { TaskService } from '../../../../shared/services/task.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RemarkService } from '../../../../shared/services/remark.service';
import Chart, { TooltipItem } from 'chart.js/auto';
import { WoCardWithTabsComponent } from "./card-components/wo-card-with-tabs/wo-card-with-tabs.component";
import { Location } from '@angular/common';
import { WorkOrderItemsListComponent } from '../work-order-items-list/work-order-items-list.component';
import { Iitem } from '../../models/work-order-item.model';

interface IssueDialogData {
  title: string;
  issue: WorkOrderIssue;
  workOrderId: string;
}

interface TaskDialogData {
  task: Task;
  mode: 'edit' | 'create';
}

interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButton: string;
  cancelButton: string;
}

interface RemarkNotificationData {
  peopleInvolved?: string[];
  type: string;
  content: string;
  sendNotifications?: boolean;
}

// Define a simple IssueDialogComponent class to avoid import errors
class IssueDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<IssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IssueDialogData
  ) {}
}

// Define a simple TaskDialogComponent class to avoid import errors
class TaskDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}
}

// Define a simple ConfirmDialogComponent class to avoid import errors
class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}

@Component({
  selector: 'app-work-order-details',
  templateUrl: './work-order-details.component.html',
  styleUrls: ['./work-order-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    WoCardWithTabsComponent,
    WorkOrderItemsListComponent
  ]
})
export class WorkOrderDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  public workOrder: WorkOrder | null = null;
  public workOrderId = '';
  public loading = true;
  public loadingRemarks = false;
  public activityLogs: ActivityLog[] = [];
  public loadingActivityLogs = false;
  public error: string | null = null;

  // Task related properties
  public tasks: Task[] = [];
  public loadingTasks = false;

  private destroy$ = new Subject<void>();
  activeTab = 'overview';

  private expensesChart: Chart | null = null;

  // Expose the enum to the template
  WorkOrderStatus = WorkOrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrderService: WorkOrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private notificationService: NotificationService,
    private activityLogService: ActivityLogService,
    private printService: PrintService,
    private taskService: TaskService,
    private remarkService: RemarkService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.loadWorkOrder(params['id']);
      }
    });

    // Subscribe to route fragment for tab navigation
    this.route.fragment.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    // Initialize pie chart when the component is ready and workOrder is loaded
    if (this.workOrder) {
      this.initExpensesChart();
    }
  }

  /**
   * Load the work order details by ID
   */
  public loadWorkOrder(id: string): void {
    this.loading = true;
    this.error = null;
    this.workOrderId = id;

    this.workOrderService.getWorkOrderById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
        catchError(err => {
          this.error = err.message;
          this.snackBar.open('Failed to load work order details', 'Close', { duration: 3000 });
          return of(null);
        })
      )
      .subscribe(workOrder => {
        if (workOrder) {
          this.workOrder = workOrder;

          // If the view is already initialized, create the chart
          setTimeout(() => {
            this.initExpensesChart();
          }, 100);

          // Load activity logs for this work order
          this.loadActivityLogs(workOrder.id);

          // Load tasks for this work order
          this.loadTasks(workOrder.id);
        }
      });
  }

  getStatusClass(status: WorkOrderStatus): string {
    switch (status) {
      case WorkOrderStatus.InProgress:
        return 'status-in-progress';
      case WorkOrderStatus.Completed:
        return 'status-completed';
      case WorkOrderStatus.Pending:
        return 'status-pending';
      case WorkOrderStatus.Cancelled:
        return 'status-cancelled';
      case WorkOrderStatus.OnHold:
        return 'status-on-hold';
      default:
        return '';
    }
  }

  getPriorityClass(priority: WorkOrderPriority): string {
    switch (priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  /**
   * Format a date for display
   * @param date The date to format
   */
  formatDate(date?: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  /**
   * Calculate percentage for expense breakdown
   * @param amount The expense amount
   * @param total The total amount
   * @returns The percentage value
   */
  getPercentage(amount?: number, total?: number): number {
    if (!amount || !total || total === 0) return 0;
    return Math.round((amount / total) * 100);
  }

  goBack(): void {
    this.location.back();
  }

  editWorkOrder(): void {
    if (this.workOrder) {
      this.router.navigate(['/work-orders/edit', this.workOrder.id]);
    }
  }

  /**
   * Prints the current work order using the PrintService
   */
  printWorkOrder(): void {
    if (this.workOrder) {
      this.printService.printWorkOrder(this.workOrder);
      this.snackBar.open('Printing work order...', 'Close', {
        duration: 3000
      });
    }
  }

  // Navigation methods for tabs
  navigateToTab(tabName: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      fragment: tabName
    });
  }

  // Export to Excel functionality
  exportToExcel(): void {
    if (!this.workOrder) {
      this.snackBar.open('No work order data to export', 'Close', {
        duration: 3000
      });
      return;
    }

    try {
      // Prepare data for export
      const workOrderData = {
        'Order Number': this.workOrder.details.workOrderNumber,
        'Status': this.workOrder.details.status,
        'Created Date': this.formatDate(this.workOrder.details.createdDate),
        'Start Date': this.formatDate(this.workOrder.details.startDate),
        'Due Date': this.formatDate(this.workOrder.details.dueDate),
        'Completion': `${this.workOrder.details.completionPercentage}%`,
        'Location': this.workOrder.details.location
      };

      // Convert object to CSV format
      let csvContent = 'data:text/csv;charset=utf-8,';

      // Add headers
      csvContent += Object.keys(workOrderData).join(',') + '\n';

      // Add values - ensure proper CSV escaping
      const values = Object.values(workOrderData).map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',');
      csvContent += values;

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WorkOrder_${this.workOrder.details.workOrderNumber}_Export.csv`);
      document.body.appendChild(link);

      // Download the CSV file
      link.click();

      // Clean up
      document.body.removeChild(link);

      this.snackBar.open('Work order exported successfully', 'Close', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error exporting work order data:', error);
      this.snackBar.open('Failed to export work order data', 'Close', {
        duration: 3000
      });
    }
  }

  // Methods for handling different sections
  addRemark(): void {
    if (!this.workOrder) return;

    // Load users for the dialog
    forkJoin({
      users: this.userService.getUsers(),
      workOrders: of([this.workOrder]) // We only need the current work order
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ users, workOrders }) => {
        const dialogRef = this.dialog.open(RemarkDialogComponent, {
          width: '550px',
          data: {
            title: 'Add New Remark',
            workOrders: workOrders,
            users: users
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Use remarkService instead of workOrderService to ensure synchronization with all-remarks
            this.remarkService.addRemark({
              workOrderId: this.workOrder!.id,
              content: result.content,
              type: result.type,
              createdBy: result.createdBy || 'System User',
              peopleInvolved: result.peopleInvolved || []
            })
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.snackBar.open('Remark added successfully', 'Close', { duration: 3000 });

                  // Send notifications if requested
                  if (result.sendNotifications && result.peopleInvolved && result.peopleInvolved.length > 0) {
                    this.sendNotifications(result);
                  }

                  // Reload work order to get updated remarks
                  if (this.workOrder) {
                    this.loadWorkOrder(this.workOrder.id);
                  }
                },
                error: (error: Error) => {
                  console.error('Error adding remark:', error);
                  this.snackBar.open('Failed to add remark', 'Close', { duration: 3000 });
                }
              });
          }
        });
      },
      error: (error) => {
        console.error('Error loading data for remark dialog:', error);
        this.snackBar.open('Failed to open remark dialog', 'Close', { duration: 3000 });
      }
    });
  }

  editRemark(remark: WorkOrderRemark): void {
    if (!this.workOrder) return;

    // Load users for the dialog
    forkJoin({
      users: this.userService.getUsers(),
      workOrders: of([this.workOrder]) // We only need the current work order
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ users, workOrders }) => {
        const dialogRef = this.dialog.open(RemarkDialogComponent, {
          width: '550px',
          data: {
            title: 'Edit Remark',
            remark: remark,
            workOrders: workOrders,
            users: users
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Show loading state
            this.loadingRemarks = true;

            // Use remarkService instead of workOrderService
            this.remarkService.updateRemark(remark.id, {
              content: result.content,
              type: result.type,
              peopleInvolved: result.peopleInvolved || []
            })
              .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                  this.loadingRemarks = false;
                })
              )
              .subscribe({
                next: (updatedRemark) => {
                  this.snackBar.open('Remark updated successfully', 'Close', { duration: 3000 });

                  // Send notifications if requested
                  if (result.sendNotifications && result.peopleInvolved && result.peopleInvolved.length > 0) {
                    this.sendNotifications(updatedRemark, true);
                  }

                  // Reload work order to get updated remarks
                  if (this.workOrder) {
                    this.loadWorkOrder(this.workOrder.id);
                  }
                },
                error: (error) => {
                  console.error('Error updating remark:', error);
                  this.snackBar.open('Failed to update remark', 'Close', { duration: 3000 });
                }
              });
          }
        });
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  deleteRemark(remark: WorkOrderRemark): void {
    if (!this.workOrder) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Remark',
        message: 'Are you sure you want to delete this remark? This action cannot be undone.',
        confirmButton: 'Delete',
        cancelButton: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.workOrder) {
        this.loadingRemarks = true;

        // Pass the IDs as strings to ensure consistent handling
        this.remarkService.deleteRemark(this.workOrder.id, remark.id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loadingRemarks = false)
          )
          .subscribe({
            next: () => {
              // Success - remove from local array if it exists
              if (this.workOrder && this.workOrder.remarks) {
                this.workOrder.remarks = this.workOrder.remarks.filter(r => r.id !== remark.id);
              }
              this.snackBar.open('Remark deleted successfully', 'Close', { duration: 2000 });
            },
            error: (err) => {
              console.error('Error deleting remark:', err);
              this.snackBar.open(`Failed to delete remark: ${err.message || 'Unknown error'}`, 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  /**
   * Get CSS class for remark type styling
   */
  getRemarkTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'general':
        return 'type-general';
      case 'technical':
        return 'type-technical';
      case 'safety':
        return 'type-safety';
      case 'quality':
        return 'type-quality';
      case 'client-communication':
        return 'type-client';
      case 'internal-communication':
        return 'type-internal';
      case 'feedback':
        return 'type-feedback';
      default:
        return 'type-custom';
    }
  }

  /**
   * Get appropriate icon for a remark type
   */
  getRemarkIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'general':
        return 'chat';
      case 'technical':
        return 'build';
      case 'safety':
        return 'health_and_safety';
      case 'quality':
        return 'verified';
      case 'client-communication':
        return 'business';
      case 'internal-communication':
        return 'forum';
      case 'feedback':
        return 'feedback';
      default:
        return 'comment';
    }
  }

  private sendNotifications(remarkData: RemarkNotificationData, isUpdate = false): void {
    if (!remarkData.peopleInvolved || remarkData.peopleInvolved.length === 0) return;

    const action = isUpdate ? 'updated' : 'added';
    const notificationData = {
      title: `Work Order Remark ${action}`,
      message: `A ${remarkData.type} remark was ${action} for Work Order ${this.workOrder?.details.workOrderNumber}`,
      userIds: remarkData.peopleInvolved,
      type: 'remark',
      workOrderId: this.workOrder?.id
    };

    this.notificationService.sendBulkNotifications(notificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Notifications sent successfully'),
        error: (error: Error) => console.error('Error sending notifications:', error)
      });
  }

  addIssue(): void {
    // Implementation for adding issues
  }

  addAction(): void {
    // Implementation for adding actions
  }

  addMaterial(): void {
    // Implementation for adding materials
  }

  uploadPhoto(): void {
    // Implementation for uploading photos
  }

  addForm(): void {
    // Implementation for adding forms
  }

  addExpense(): void {
    // Implementation for adding expenses
  }

  addInvoice(): void {
    // Implementation for adding invoices
  }

  // Status update methods
  updateStatus(newStatus: WorkOrderStatus): void {
    if (this.workOrder) {
      this.workOrderService.updateWorkOrderStatus(this.workOrder.id, newStatus).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedWorkOrder) => {
          this.workOrder = updatedWorkOrder;
          this.snackBar.open(`Work order status updated to ${newStatus}`, 'Close', {
            duration: 3000
          });
        },
        error: (err) => {
          console.error('Error updating work order status:', err);
          this.snackBar.open('Failed to update work order status', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  // Get a user-friendly description of an activity log
  getActivityDescription(log: ActivityLog): string {
    return log.description || `${log.action} ${log.entityType}`;
  }

  // Format activity timestamp
  formatActivityTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get CSS class for activity icon
  getActivityIconClass(log: ActivityLog): string {
    const actionClasses: Record<string, string> = {
      'create': 'action-create',
      'update': 'action-update',
      'delete': 'action-delete'
    };

    return actionClasses[log.action] || '';
  }

  // Get icon for activity type
  getActivityIcon(log: ActivityLog): string {
    const actionIcons: Record<string, string> = {
      'create': 'add_circle',
      'update': 'edit',
      'delete': 'delete'
    };

    const entityIcons: Record<string, string> = {
      'workOrder': 'engineering',
      'remark': 'comment',
      'issue': 'error',
      'material': 'inventory_2',
      'task': 'task_alt',
      'user': 'person',
      'system': 'settings'
    };

    // Return based on activity first, then entity type
    return actionIcons[log.action] || entityIcons[log.entityType] || 'info';
  }

  // Helper method to convert object keys to array for templates
  objectKeys<T extends object>(obj: T): string[] {
    return obj ? Object.keys(obj).filter(key => typeof key === 'string') : [];
  }

  // Helper method to safely get property value
  getPropertyValue(key: string): string | number | Date | null | undefined {
    if (!this.workOrder) return '';
    return (this.workOrder as unknown as Record<string, string | number | Date | null | undefined>)[key];
  }

  /**
   * Load activity logs for the current work order
   */
  public loadActivityLogs(workOrderId: string): void {
    this.loadingActivityLogs = true;

    this.activityLogService.getRelatedActivityLogs('workOrder', workOrderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingActivityLogs = false)
      )
      .subscribe({
        next: (logs: ActivityLog[]) => {
          this.activityLogs = logs;
        },
        error: (error) => {
          console.error('Error loading activity logs:', error);
          this.snackBar.open('Failed to load activity logs', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Load tasks for the work order
   */
  public loadTasks(workOrderId: string): void {
    this.loadingTasks = true;

    // Convert the workOrderId to a number for the service call
    const numericWorkOrderId = Number(workOrderId);

    this.taskService.getTasksByWorkOrderId(numericWorkOrderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingTasks = false),
        catchError(err => {
          console.error('Error loading tasks:', err);
          this.snackBar.open('Failed to load tasks', 'Close', { duration: 3000 });
          return of([]);
        })
      )
      .subscribe(tasks => {
        if (this.workOrder) {
          // Assign tasks directly as they are already in the correct format
          this.workOrder.tasks = tasks;
        }
      });
  }

  /**
   * Opens dialog to add a new task
   */
  openAddTaskDialog(): void {
    // For now, just a stub that would open a dialog
    this.snackBar.open('Add task dialog will be implemented in the next sprint', 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Toggle a task's completed status
   * @param index The index of the task in the tasks array
   */
  toggleTaskStatus(index: number): void {
    if (this.workOrder?.tasks && this.workOrder.tasks[index]) {
      const task = this.workOrder.tasks[index];
      task.completed = !task.completed;

      // Update the status property to match completed state
      task.status = task.completed ? 'Waiting Confirmation' : 'in-progress';

      // Call task service to update status
      this.taskService.updateTask(task)
        .pipe(
          takeUntil(this.destroy$),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          catchError(err => {
            this.snackBar.open('Failed to update task status', 'Close', { duration: 3000 });
            // Revert the local change if API call fails
            task.completed = !task.completed;
            task.status = task.completed ? 'Waiting Confirmation' : 'in-progress';
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.snackBar.open(
              `Task ${task.completed ? 'completed' : 'reopened'}`,
              'Close',
              { duration: 2000 }
            );
          }
        });
    }
  }

  /**
   * Edit a task
   * @param index Index of the task
   * @param task Task to edit
   */
  editTask(index: number, task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '500px',
      data: {
        task: { ...task },
        mode: 'edit'
      }
    });

    // Handle the dialog result when closed
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.workOrder && this.workOrder.tasks) {
        // Update the task
        this.workOrder.tasks[index] = result;
        this.snackBar.open('Task updated successfully', 'Close', { duration: 2000 });
      }
    });
  }

  /**
   * Delete a task
   * @param index Index of the task to delete
   */
  deleteTask(index: number): void {
    if (!this.workOrder || !this.workOrder.tasks) return;

    const taskToDelete = this.workOrder.tasks[index];

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete the task "${taskToDelete.title}"?`,
        confirmButton: 'Delete',
        cancelButton: 'Cancel'
      }
    });

    // Handle the dialog result when closed
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.workOrder && this.workOrder.tasks) {
        // Call service to delete the task
        this.taskService.deleteTask(taskToDelete.id)
          .pipe(
            takeUntil(this.destroy$),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catchError(err => {
              this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
              return of(null);
            })
          )
          .subscribe(response => {
            if (response) {
              // Remove from the local array
              this.workOrder!.tasks = this.workOrder!.tasks!.filter((_, i) => i !== index);
              this.snackBar.open('Task deleted successfully', 'Close', { duration: 2000 });
            }
          });
      }
    });
  }

  /**
   * Adds equipment to the work order
   */
  addEquipment(): void {
    // For now, just a stub that would open a dialog
    this.snackBar.open('Equipment addition will be implemented in the next sprint', 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  addPermit(): void {
    this.snackBar.open('Permit functionality coming soon', 'Close', {
      duration: 3000
    });
    // TODO: Implement permit addition functionality
  }

  reportIssue(): void {
    this.snackBar.open('Issue reporting functionality coming soon', 'Close', {
      duration: 3000
    });
    // TODO: Implement issue reporting functionality
  }

  createActionItem(): void {
    this.snackBar.open('Action item creation coming soon', 'Close', {
      duration: 3000
    });
    // TODO: Implement action item creation functionality
  }

  /**
   * Edit an issue
   */
  public editIssue(issue: WorkOrderIssue): void {
    // Open dialog to edit issue
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      width: '600px',
      data: {
        title: 'Edit Issue',
        issue: issue,
        workOrderId: this.workOrder?.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Issue updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // Reload work order to get updated issues
        this.loadWorkOrder(this.workOrderId);
      }
    });
  }

  /**
   * Mark an issue as resolved
   */
  public resolveIssue(issueId: string): void {
    if (!this.workOrder) return;

    this.snackBar.open('Marking issue as resolved...', '', {
      duration: 1000
    });

    // In a real app, this would be a service call
    setTimeout(() => {
      if (this.workOrder && this.workOrder.issues) {
        // Find and update the issue status
        const issueIndex = this.workOrder.issues.findIndex(i => i.id === issueId);
        if (issueIndex !== -1) {
          this.workOrder.issues[issueIndex].status = 'resolved';
          this.workOrder.issues[issueIndex].resolutionDate = new Date().toISOString();

          this.snackBar.open('Issue marked as resolved', 'Close', {
            duration: 3000
          });
        }
      }
    }, 500);
  }

  /**
   * Delete an issue
   */
  public deleteIssue(issueId: string): void {
    if (!this.workOrder) return;

    // Confirm deletion
    const confirm = window.confirm('Are you sure you want to delete this issue?');

    if (confirm && this.workOrder.issues) {
      // In a real app, this would call a service
      this.snackBar.open('Deleting issue...', '', {
        duration: 1000
      });

      setTimeout(() => {
        if (this.workOrder && this.workOrder.issues) {
          // Filter out the deleted issue
          this.workOrder.issues = this.workOrder.issues.filter(i => i.id !== issueId);

          this.snackBar.open('Issue deleted successfully', 'Close', {
            duration: 3000
          });
        }
      }, 500);
    }
  }

  /**
   * Initialize the expenses pie chart
   */
  private initExpensesChart(): void {
    const estimatedPrice = this.workOrder?.details?.estimatedPrice || 0;
    if (!estimatedPrice) return;

    const ctx = document.getElementById('expensesChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy any existing chart
    if (this.expensesChart) {
      this.expensesChart.destroy();
    }

    this.expensesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Estimated Cost'],
        datasets: [{
          data: [estimatedPrice],
          backgroundColor: [
            '#4CAF50', // Green
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context: TooltipItem<'pie'>) {
                const value = context.raw as number;
                const percentage = Math.round((value / estimatedPrice) * 100);
                return `${context.label}: $${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Update the chart when the data changes
   */
  private updateExpensesChart(): void {
    const estimatedPrice = this.workOrder?.details?.estimatedPrice || 0;
    if (!this.expensesChart || !estimatedPrice) return;
    
    this.expensesChart.data.datasets[0].data = [estimatedPrice];
    this.expensesChart.update();
  }

  onItemsUpdated(items: Iitem[]): void {
    console.log('Items updated:', items);
    // Handle the updated items
    if (this.workOrder) {
      this.workOrder.items = items.map(item => ({
        id: item.id,
        itemDetail: item,
        estimatedQuantity: 0,
        estimatedPrice: 0,
        estimatedPriceWithVAT: 0,
        actualQuantity: 0,
        actualPrice: 0,
        actualPriceWithVAT: 0,
        reasonForFinalQuantity: ''
      }));
    }
  }
}
