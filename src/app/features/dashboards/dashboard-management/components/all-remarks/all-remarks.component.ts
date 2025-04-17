import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, forkJoin, finalize } from 'rxjs';
import { WorkOrderRemark, WorkOrder, User } from '../../../../../domains/work-order/models/work-order.model';
import { RemarkService } from '../../../../../shared/services/remark.service';
import { WorkOrderService } from '../../../../../domains/work-order/services/work-order.service';
import { TempUserService as UserService } from '../../../../../shared/services/temp-user.service';
import { TempNotificationService as NotificationService } from '../../../../../shared/services/temp-notification.service';
import { RemarkDialogComponent } from '../remark-dialog/remark-dialog.component';

@Component({
  selector: 'app-all-remarks',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    ReactiveFormsModule
  ],
  providers: [
    UserService,
    NotificationService
  ],
  templateUrl: './all-remarks.component.html',
  styleUrls: ['./all-remarks.component.scss']
})
export class AllRemarksComponent implements OnInit, OnDestroy {
  remarks: WorkOrderRemark[] = [];
  filteredRemarks: WorkOrderRemark[] = [];
  paginatedRemarks: WorkOrderRemark[] = [];
  workOrders: WorkOrder[] = [];
  users: User[] = [];
  loading = true;
  error: string | null = null;

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Filtering
  filterForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private remarkService: RemarkService,
    private workOrderService: WorkOrderService,
    private userService: UserService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      sortBy: ['createdDate']
    });
  }

  ngOnInit(): void {
    this.loadData();

    // Subscribe to filter changes
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Use forkJoin to load all required data in parallel
    forkJoin({
      remarks: this.remarkService.getAllRemarks(),
      workOrders: this.workOrderService.getAllWorkOrders(),
      users: this.userService.getUsers()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (results) => {
        this.remarks = results.remarks;
        this.workOrders = results.workOrders;
        this.users = results.users as User[];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load remarks data. Please try again.';
        this.loading = false;
      }
    });
  }

  loadRemarks(): void {
    this.loadData();
  }

  applyFilters(): void {
    const { search, type, sortBy } = this.filterForm.value;

    // Apply search filter
    let filtered = this.remarks;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(remark =>
        remark.content.toLowerCase().includes(searchLower) ||
        remark.createdBy.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(remark => remark.type === type);
    }

    // Apply sorting
    const sortField = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;
    const sortDirection = sortBy.startsWith('-') ? -1 : 1;

    filtered = [...filtered].sort((a, b) => {
      if (sortField === 'createdDate') {
        return sortDirection * (new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      } else {
        const aValue = a[sortField as keyof WorkOrderRemark];
        const bValue = b[sortField as keyof WorkOrderRemark];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection * aValue.localeCompare(bValue);
        }
        return 0;
      }
    });

    this.filteredRemarks = filtered;
    this.updatePaginatedRemarks();
  }

  updatePaginatedRemarks(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRemarks = this.filteredRemarks.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedRemarks();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getWorkOrderNumber(workOrderId: string): string {
    const workOrder = this.workOrders.find(wo => wo.id === workOrderId);
    return workOrder ? workOrder.details.workOrderNumber : 'N/A';
  }

  getRemarkIcon(type: string): string {
    switch (type) {
      case 'general':
        return 'chat';
      case 'technical':
        return 'build';
      case 'safety':
        return 'security';
      case 'quality':
        return 'verified';
      case 'client':
        return 'person';
      case 'internal':
        return 'business';
      case 'feedback':
        return 'feedback';
      default:
        return 'comment';
    }
  }

  navigateToWorkOrder(workOrderId: string): void {
    this.router.navigate(['/work-orders/details', workOrderId]);
  }

  openAddRemarkDialog(): void {
    const dialogRef = this.dialog.open(RemarkDialogComponent, {
      width: '600px',
      data: {
        title: 'Add New Remark',
        workOrders: this.workOrders,
        users: this.users
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Extract sendNotifications flag and remove it from the data
        const { sendNotifications, ...remarkData } = result;
        this.addRemark(remarkData, !!sendNotifications);
      }
    });
  }

  editRemark(remark: WorkOrderRemark): void {
    const dialogRef = this.dialog.open(RemarkDialogComponent, {
      width: '600px',
      data: {
        title: 'Edit Remark',
        remark: remark,
        workOrders: this.workOrders,
        users: this.users
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Extract sendNotifications flag and remove it from the data
        const { sendNotifications, ...remarkData } = result;
        this.updateRemark(remark.id, remarkData, !!sendNotifications);
      }
    });
  }

  addRemark(remarkData: Partial<WorkOrderRemark>, sendNotifications: boolean): void {
    this.remarkService.addRemark(remarkData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newRemark) => {
          // Send notifications if requested
          if (sendNotifications && remarkData.peopleInvolved && remarkData.peopleInvolved.length > 0) {
            this.sendNotifications(newRemark, 'added');
          }
          this.loadRemarks();
        },
        error: (err) => {
          console.error('Error adding remark:', err);
          alert('Failed to add remark. Please try again.');
        }
      });
  }

  updateRemark(id: string, remarkData: Partial<WorkOrderRemark>, sendNotifications: boolean): void {
    // Show loading state
    this.loading = true;

    this.remarkService.updateRemark(id, remarkData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (updatedRemark) => {
          // Send notifications if requested
          if (sendNotifications && remarkData.peopleInvolved && remarkData.peopleInvolved.length > 0) {
            this.sendNotifications(updatedRemark, 'updated');
          }

          // Reload remarks to ensure we have the latest state
          this.loadRemarks();

          // Show success message
          this.notificationService.showSuccess('Remark updated successfully');
        },
        error: (err) => {
          console.error('Error updating remark:', err);
          this.notificationService.showError('Failed to update remark. Please try again.');
        }
      });
  }

  deleteRemark(remark: WorkOrderRemark): void {
    if (confirm(`Are you sure you want to delete this remark?`)) {
      // Show loading state
      const loadingSection = document.querySelector('.all-remarks-container');
      if (loadingSection) {
        loadingSection.classList.add('loading-state');
      }

      // Use the IDs as strings to ensure consistent handling
      this.remarkService.deleteRemark(remark.workOrderId, remark.id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            // Hide loading state
            if (loadingSection) {
              loadingSection.classList.remove('loading-state');
            }
          })
        )
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Remark deleted successfully');
            // Reload data to get fresh state
            this.loadRemarks();
          },
          error: (err) => {
            console.error('Error deleting remark:', err);
            this.notificationService.showError(`Failed to delete remark: ${err.message || 'Unknown error'}`);
          }
        });
    }
  }

  // New method to send notifications
  private sendNotifications(remark: WorkOrderRemark, action: 'added' | 'updated'): void {
    if (!remark.peopleInvolved || remark.peopleInvolved.length === 0) {
      return;
    }

    // Get the work order number for the notification message
    const workOrder = this.workOrders.find(wo => wo.id === remark.workOrderId);
    const workOrderNumber = workOrder ? workOrder.details.workOrderNumber : remark.workOrderId;

    // Prepare notification data
    const notificationData = {
      title: `Work Order Remark ${action}`,
      message: `A ${remark.type} remark was ${action} for Work Order ${workOrderNumber}`,
      type: 'remark',
      userIds: remark.peopleInvolved,
      workOrderId: remark.workOrderId,
      actionUrl: `/work-orders/details/${remark.workOrderId}`
    };

    // Send notifications to all involved people
    this.notificationService.sendBulkNotifications(notificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Notifications sent successfully'),
        error: (error: Error) => console.error('Error sending notifications:', error)
      });
  }
}
