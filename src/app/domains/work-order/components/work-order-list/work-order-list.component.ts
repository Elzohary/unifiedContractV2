import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrder, WorkOrderStatus, WorkOrderExpense } from '../../models/work-order.model';
import { finalize, catchError, map, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { of } from 'rxjs';
import { PageHeaderComponent, PageHeaderAction } from '../../../../shared/components/page-header';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { FormsModule } from '@angular/forms';
import { DataTableCardComponent, TableColumn, TableAction } from 'src/app/shared/components/data-table-card/data-table-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-work-order-list',
  templateUrl: './work-order-list.component.html',
  styleUrls: ['./work-order-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    MatSelectModule,
    MatSortModule,
    MatProgressBarModule,
    PageHeaderComponent,
    DatePipe,
    CurrencyPipe,
    TitleCasePipe,
    DataTableCardComponent,
    MatTooltipModule
  ]
})
export class WorkOrderListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private originalWorkOrders: WorkOrder[] = [];

  pageTitle = 'Work Orders';
  workOrders: WorkOrder[] = [];
  loading = true;
  loadingError = false;
  searchText: string = '';
  selectedStatus: string = 'all';
  errorMessage: string = 'Unable to load work orders. Please try again later.';

  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('estimatedCostTemplate') estimatedCostTemplate!: TemplateRef<any>;
  @ViewChild('actualValueTemplate') actualValueTemplate!: TemplateRef<any>;
  @ViewChild('actionsNeededTemplate') actionsNeededTemplate!: TemplateRef<any>;
  @ViewChild('completionPercentageTemplate') completionPercentageTemplate!: TemplateRef<any>;
  @ViewChild('receivedDateTemplate') receivedDateTemplate!: TemplateRef<any>;

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [
    {
      name: 'View',
      icon: 'visibility',
      tooltip: 'View details',
    },
    {
      name: 'Edit',
      icon: 'edit',
      tooltip: 'Edit work order',
      disabled: (row: WorkOrder) => row.details.status === 'completed' || row.details.status === 'cancelled',
    },
    {
      name: 'Complete',
      icon: 'check_circle',
      color: 'green',
      tooltip: 'Mark as completed',
      disabled: (row: WorkOrder) => row.details.status === 'completed' || row.details.status === 'cancelled',
    },
    {
      name: 'Cancel',
      icon: 'cancel',
      color: 'warn',
      tooltip: 'Cancel work order',
      disabled: (row: WorkOrder) => row.details.status === 'cancelled' || row.details.status === 'completed',
    },
  ];

  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  headerActions: PageHeaderAction[] = [
    {
      label: 'Create Work Order',
      icon: 'add',
      color: 'primary',
      callback: 'createNewWorkOrder'
    }
  ];

  constructor(
    private workOrderService: WorkOrderService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.pageTitle = 'Work Orders'; 
    this.errorMessage = 'Unable to load work orders. Please try again later.';
    
    this.setupHeaderActions();
    this.setupTableColumns();
    this.setupTableActions();
    this.setupStatusOptions();
    
    // Simulate loading work orders
    this.loading = true;
    this.fetchWorkOrders();
  }

  fetchWorkOrders(): void {
    // Remove artificial delay
    this.loading = true;
    this.workOrderService.getAllWorkOrders().subscribe(
      (data) => {
        this.workOrders = data;
        this.originalWorkOrders = [...data]; // Save a copy for filtering
        this.loading = false;
        this.loadingError = false;
      },
      (error) => {
        console.error('Error fetching work orders:', error);
        this.loading = false;
        this.loadingError = true;
      }
    );
  }

  ngAfterViewInit() {
    this.setupTableColumns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupTableColumns(): void {
    this.tableColumns = [
      {
        name: 'workOrderNumber',
        label: 'Order Number',
        sortable: true,
        valueGetter: (row: WorkOrder) => row.details?.workOrderNumber || 'N/A'
      },
      {
        name: 'category',
        label: 'Category',
        sortable: true,
        valueGetter: (row: WorkOrder) => row.details?.category || 'Uncategorized'
      },
      {
        name: 'receivedDate',
        label: 'Received Date',
        sortable: true,
        cellTemplate: this.receivedDateTemplate
      },
      {
        name: 'location',
        label: 'Location',
        sortable: true,
        valueGetter: (row: WorkOrder) => row.details?.location || 'No location'
      },
      {
        name: 'status',
        label: 'Status',
        sortable: true,
        cellTemplate: this.statusTemplate
      },
      {
        name: 'estimatedCost',
        label: 'Estimated Cost',
        sortable: true,
        cellTemplate: this.estimatedCostTemplate
      },
      {
        name: 'actualValue',
        label: 'Actual Value',
        sortable: true,
        cellTemplate: this.actualValueTemplate
      },
      {
        name: 'actionsNeeded',
        label: 'Actions Needed',
        sortable: true,
        cellTemplate: this.actionsNeededTemplate,
        align: 'center'
      },
      {
        name: 'completionPercentage',
        label: 'Progress',
        sortable: true,
        cellTemplate: this.completionPercentageTemplate
      }
    ];
  }

  loadWorkOrders(status?: string): void {
    this.loading = true;
    this.loadingError = false;

    this.workOrderService.getAllWorkOrders()
      .pipe(
        map(workOrders => {
          if (status && status !== 'all') {
            return workOrders.filter(order => order.details.status === status);
          }
          return workOrders;
        }),
        finalize(() => this.loading = false),
        catchError((error: any) => {
          console.error('Error loading work orders:', error);
          this.errorMessage = `Failed to load work orders. ${error.message || ''}`;
          this.loadingError = true;
          this.workOrders = [];
          return of([]);
        })
      )
      .subscribe((filteredWorkOrders: WorkOrder[]) => {
        this.workOrders = filteredWorkOrders;
      });
  }

  onSearchChanged(searchText: string): void {
    console.log('Search changed to:', searchText);
    this.searchText = searchText;
    
    if (!this.originalWorkOrders.length) {
      console.warn('Original data not loaded yet, cannot perform search');
      return;
    }
    
    if (!searchText || searchText.trim() === '') {
      // Reset to original data without calling the service
      this.workOrders = [...this.originalWorkOrders];
      return;
    }
    
    const lowerSearch = searchText.toLowerCase().trim();
    
    // Filter from the original data cache
    this.workOrders = this.originalWorkOrders.filter(order => {
      // Null-safe property access
      const workOrderNumber = order.details?.workOrderNumber?.toLowerCase() || '';
      const title = order.details?.title?.toLowerCase() || '';
      const category = order.details?.category?.toLowerCase() || '';
      const location = order.details?.location?.toLowerCase() || '';
      const status = order.details?.status?.toLowerCase() || '';
      const client = order.details?.client?.toLowerCase() || '';
      
      // Search across multiple fields
      return (
        workOrderNumber.includes(lowerSearch) ||
        title.includes(lowerSearch) ||
        category.includes(lowerSearch) ||
        location.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        client.includes(lowerSearch)
      );
    });
    
    // If we found no matches, provide feedback (optional)
    if (this.workOrders.length === 0) {
      console.log('No matches found for search:', searchText);
    }
  }

  filterByStatus(): void {
    console.log('Filtering by status:', this.selectedStatus);
    
    if (!this.originalWorkOrders.length) {
      console.warn('Original data not loaded yet, cannot filter');
      return;
    }
    
    if (this.selectedStatus === 'all') {
      // Reset to original data without making a service call
      this.workOrders = [...this.originalWorkOrders];
      return;
    }
    
    // Filter the originalWorkOrders array directly
    this.workOrders = this.originalWorkOrders.filter(wo => 
      wo.details?.status?.toLowerCase() === this.selectedStatus.toLowerCase()
    );
    
    // Apply any active search filter on top of status filter
    if (this.searchText && this.searchText.trim()) {
      this.onSearchChanged(this.searchText);
    }
  }

  onHeaderAction(action: string): void {
    console.log('Header action triggered:', action);
    
    switch (action) {
      case 'add-work-order':
        this.router.navigate(['/work-orders/new']);
        break;
      case 'export-work-orders':
        this.exportWorkOrders();
        break;
    }
  }

  exportWorkOrders(): void {
    console.log('Exporting work orders...');
    // Implement export functionality
  }

  onRowClicked(workOrder: WorkOrder): void {
    console.log('Row clicked, work order:', workOrder);
    if (workOrder && workOrder.id) {
      // Use the details/:id route which seems to be the intended navigation target
      console.log(`Navigating to /work-orders/details/${workOrder.id}`);
      this.router.navigate(['/work-orders/details', workOrder.id])
        .then(success => {
          if (!success) {
            console.error('Navigation was not successful, trying fallback route');
            // Fallback to alternative route format if the first one fails
            this.router.navigate(['/work-orders', workOrder.id]);
          }
        })
        .catch(err => {
          console.error('Navigation error:', err);
        });
    } else {
      console.error('Navigation failed: workOrder or workOrder.id is missing', workOrder);
    }
  }

  onRowAction(event: { action: string, row: WorkOrder }): void {
    // This method should not be called since we've removed actions
    console.log(`Action '${event.action}' triggered for Work Order (this should not happen):`, event.row);
  }

  updateWorkOrderStatus(workOrder: WorkOrder, status: WorkOrderStatus): void {
    const originalStatus = workOrder.details?.status;
    if (workOrder.details) {
      workOrder.details.status = status;
      if (status === WorkOrderStatus.Completed) {
        workOrder.details.completionPercentage = 100;
      }
    }
    this.workOrders = [...this.workOrders];

    // Update the original data array as well to keep them in sync
    const originalIndex = this.originalWorkOrders.findIndex(wo => wo.id === workOrder.id);
    if (originalIndex !== -1) {
      this.originalWorkOrders[originalIndex] = workOrder;
    }

    console.log(`Simulated update for ${workOrder.id} to ${status}`);
  }

  confirmCancelWorkOrder(workOrder: WorkOrder): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Work Order',
        message: `Are you sure you want to cancel Work Order #${workOrder.details?.workOrderNumber}? This action cannot be undone.`,
        confirmText: 'Yes, Cancel',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateWorkOrderStatus(workOrder, WorkOrderStatus.Cancelled);
      }
    });
  }

  getTotalExpenses(workOrder: WorkOrder): number {
    if (!workOrder || !workOrder.expenses) return 0;
    return workOrder.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }

  getActionsCount(workOrder: WorkOrder): number {
    if (workOrder?.actionsNeeded?.length) {
      return workOrder.actionsNeeded.length;
    }
    if (workOrder?.actions?.length) {
      return workOrder.actions.length;
    }
    return 0;
  }

  getProgressColor(percentage: number): 'primary' | 'accent' | 'warn' {
    if (percentage >= 70) return 'primary';
    if (percentage >= 30) return 'accent';
    return 'warn';
  }

  setupHeaderActions(): void {
    this.headerActions = [
      {
        label: 'Add Work Order',
        icon: 'add',
        callback: 'add-work-order',
        color: 'primary'
      },
      {
        label: 'Export',
        icon: 'download',
        callback: 'export-work-orders'
      }
    ];
  }

  setupTableActions(): void {
    // Remove all actions
    this.tableActions = [];
  }

  setupStatusOptions(): void {
    this.statusOptions = [
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'on-hold', label: 'On Hold' }
    ];
  }
}