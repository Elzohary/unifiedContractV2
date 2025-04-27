import { ChangeDetectionStrategy, Component, OnInit, ViewChild, NO_ERRORS_SCHEMA, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatCurrency } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrder } from '../../models/work-order.model';
import { WorkOrderStatusService } from '../../services/work-order-status.service';

/**
 * Service for handling work order status display and management
 */
@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    PageHeaderComponent
  ],
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkOrderStatusService],
  schemas: [NO_ERRORS_SCHEMA]
})
export class WorkOrderListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Page title and header actions
  pageTitle = 'Work Orders';
  headerActions: { id: string; label: string; icon: string; color: 'primary' | 'accent' | 'warn' | ''; callback: string }[] = [
    { id: 'new', label: 'New Work Order', icon: 'add', color: 'primary', callback: 'work-orders/new' }
  ];

  // Table configuration
  displayedColumns: string[] = [
    'woNumber',
    'receivedDate',
    'category',
    'status',
    'estimationPrice',
    'actualPrice',
    'progress'
  ];

  dataSource = new MatTableDataSource<WorkOrder>();
  searchText = '';
  private destroy$ = new Subject<void>();

  constructor(
    private workOrderService: WorkOrderService,
    public statusService: WorkOrderStatusService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWorkOrders();
    this.setupSorting();
    this.setupFilter();

    // Subscribe to new work orders
    this.workOrderService.newWorkOrder$
      .pipe(takeUntil(this.destroy$))
      .subscribe(newWorkOrder => {
        // Add new work order to the datasource without reloading everything
        const currentData = this.dataSource.data;
        this.dataSource.data = [newWorkOrder, ...currentData];

        // Trigger change detection
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSorting(): void {
    this.dataSource.sortingDataAccessor = (item: WorkOrder, property: string) => {
      switch(property) {
        case 'woNumber':
          return item.details.workOrderNumber;
        case 'receivedDate':
          return new Date(item.details.receivedDate).getTime();
        case 'category':
          return item.details.category;
        case 'status':
          return item.details.status;
        case 'estimationPrice':
          return (item.expenseBreakdown?.materials || 0) +
                 (item.expenseBreakdown?.labor || 0) +
                 (item.expenseBreakdown?.other || 0);
        case 'actualPrice':
          return (item.expenseBreakdown?.materials || 0) +
                 (item.expenseBreakdown?.labor || 0) +
                 (item.expenseBreakdown?.other || 0);
        case 'progress':
          return item.details.completionPercentage;
        default:
          return '';
      }
    };
  }

  private setupFilter(): void {
    this.dataSource.filterPredicate = (data: WorkOrder, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.details.workOrderNumber.toLowerCase().includes(searchStr) ||
        data.details.category.toLowerCase().includes(searchStr) ||
        data.details.status.toLowerCase().includes(searchStr) ||
        new Date(data.details.receivedDate).toLocaleDateString().toLowerCase().includes(searchStr) ||
        ((data.expenseBreakdown?.materials || 0) +
         (data.expenseBreakdown?.labor || 0) +
         (data.expenseBreakdown?.other || 0)).toString().includes(searchStr) ||
        ((data.expenseBreakdown?.materials || 0) +
         (data.expenseBreakdown?.labor || 0) +
         (data.expenseBreakdown?.other || 0)).toString().includes(searchStr) ||
        data.details.completionPercentage.toString().includes(searchStr)
      );
    };
  }

  private loadWorkOrders(): void {
    this.workOrderService.getAllWorkOrders().subscribe({
      next: (workOrders: WorkOrder[]) => {
        this.dataSource.data = workOrders;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('Error loading work orders:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRowClick(workOrder: WorkOrder): void {
    this.router.navigate(['./details', workOrder.id], { relativeTo: this.route });
  }

  getStatusBadgeColor(status: string): string {
    const category = this.statusService.getStatusCategory(status);
    switch (category) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'waiting':
        return 'status-waiting';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  formatCurrency(amount: number): string {
    return formatCurrency(amount || 0, 'en-US', 'SAR ');
  }

  calculateProgress(workOrder: WorkOrder): number {
    return workOrder.details.completionPercentage || 0;
  }

  onHeaderAction(actionId: string): void {
    if (actionId === 'work-orders/new') {
      this.router.navigate(['/work-orders/new']);
    }
  }
}
