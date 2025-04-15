import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { WorkOrderService } from '../../../../shared/services/work-order.service';
import { WorkOrder, WorkOrderStatus } from '../../../../shared/models/work-order.model';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PageHeaderComponent, PageHeaderAction } from '../../../../shared/components/page-header';
import { DataTableCardComponent, DataTableColumn, DataTableFilter, DataTableAction } from '../../../../shared/components/data-table-card';

@Component({
  selector: 'app-work-order-list',
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    DataTableCardComponent
  ]
})
export class WorkOrderListComponent implements OnInit {
  pageTitle = 'Work Orders';
  displayedColumns: string[] = ['orderNumber', 'title', 'client', 'priority', 'status', 'completionPercentage', 'actions'];
  dataSource = new MatTableDataSource<WorkOrder>([]);
  selectedStatusTab = 0;
  loading = true;
  loadingError = false;

  headerActions: PageHeaderAction[] = [
    {
      label: 'New Work Order',
      icon: 'add',
      color: 'primary',
      variant: 'raised',
      callback: 'createNewWorkOrder'
    }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Configuration for the data-table-card component
  tableColumns: DataTableColumn[] = [
    { property: 'orderNumber', header: 'Order #' },
    { property: 'title', header: 'Title' },
    { property: 'client', header: 'Client', displayFn: (item) => this.getClientName(item) },
    {
      property: 'priority',
      header: 'Priority',
      customTemplate: 'priorityCell'
    },
    {
      property: 'status',
      header: 'Status',
      customTemplate: 'statusCell'
    },
    {
      property: 'completionPercentage',
      header: 'Completion',
      customTemplate: 'completionCell'
    }
  ];

  tableFilters: DataTableFilter[] = [
    { label: 'All', value: '' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];

  tableActions: DataTableAction[] = [
    { action: 'view', label: 'View Details', icon: 'visibility' },
    { action: 'edit', label: 'Edit', icon: 'edit' },
    { action: 'delete', label: 'Delete', icon: 'delete' }
  ];

  constructor(
    private workOrderService: WorkOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkOrders();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadWorkOrders(status?: string): void {
    this.loading = true;
    this.loadingError = false;

    let request = this.workOrderService.getWorkOrders();

    if (status) {
      request = this.workOrderService.getWorkOrdersByStatus(status as WorkOrderStatus);
    }

    request
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        catchError(error => {
          console.error('Error loading work orders:', error);
          this.loadingError = true;
          return of([]);
        })
      )
      .subscribe((workOrders: WorkOrder[]) => {
        this.dataSource.data = workOrders;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  retryLoading(): void {
    this.loadWorkOrders(this.getStatusFilter());
  }

  getStatusFilter(): string | undefined {
    switch (this.selectedStatusTab) {
      case 1: return 'in-progress';
      case 2: return 'pending';
      case 3: return 'completed';
      default: return undefined;
    }
  }

  onStatusTabChange(event: MatTabChangeEvent): void {
    this.selectedStatusTab = event.index;
    this.loadWorkOrders(this.getStatusFilter());
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onHeaderAction(actionCallback: string): void {
    if (actionCallback === 'createNewWorkOrder') {
      this.createNewWorkOrder();
    }
  }

  createNewWorkOrder(): void {
    this.router.navigate(['/work-orders/new']);
  }

  viewWorkOrder(id: string): void {
    this.router.navigate(['/work-orders/details', id]);
  }

  getClientName(workOrder: WorkOrder): string {
    return workOrder.client?.name || 'Not Assigned';
  }

  getPriorityClass(priority: string): string {
    priority = priority.toLowerCase();

    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    status = status.toLowerCase();

    switch (status) {
      case 'in-progress': return 'status-in-progress';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return '';
    }
  }

  onFilterTabChange(event: MatTabChangeEvent): void {
    this.selectedStatusTab = event.index;
    this.loadWorkOrders(this.getStatusFilter());
  }

  // Handler for data-table-card filter change
  onDataTableFilterChange(event: { index: number, filter: DataTableFilter }): void {
    this.selectedStatusTab = event.index;
    this.loadWorkOrders(event.filter.value || undefined);
  }

  // Handler for data-table-card row actions
  onDataTableRowAction(event: { action: string, item: WorkOrder }): void {
    switch(event.action) {
      case 'view':
        this.viewWorkOrder(event.item.id);
        break;
      case 'edit':
        this.router.navigate(['/work-orders/edit', event.item.id]);
        break;
      case 'delete':
        // Handle delete action
        console.log('Delete work order', event.item);
        break;
    }
  }

  // Handler for data-table-card state actions
  handleStateAction(event: { state: string, action: string }): void {
    if (event.state === 'error' && event.action === 'retry') {
      this.retryLoading();
    } else if (event.state === 'empty' && event.action === 'create') {
      this.createNewWorkOrder();
    }
  }
}
