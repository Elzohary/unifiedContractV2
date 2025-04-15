# Data Table Card Component Usage

## Basic Import

```typescript
import { 
  DataTableCardComponent, 
  DataTableColumn, 
  DataTableFilter, 
  DataTableAction, 
  DataTableConfig 
} from 'src/app/shared/components/data-table-card';
```

## Simple Example

### Component Setup

```typescript
@Component({
  // Component configuration
  imports: [
    DataTableCardComponent,
    // other imports
  ]
})
export class YourComponent implements OnInit {
  // Table data
  tableData: any[] = [];
  
  // Table columns
  tableColumns: DataTableColumn[] = [
    { property: 'orderNumber', header: 'Order #' },
    { property: 'title', header: 'Title', class: 'title-cell' },
    { property: 'client', header: 'Client', displayFn: (item) => item.client?.name || 'Not Assigned' },
    { property: 'priority', header: 'Priority' },
    { property: 'status', header: 'Status' },
    { property: 'completionPercentage', header: 'Completion' }
  ];
  
  // Filter tabs
  tableFilters: DataTableFilter[] = [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ];
  
  // Row actions
  tableActions: DataTableAction[] = [
    { action: 'view', label: 'View Details', icon: 'visibility' },
    { action: 'edit', label: 'Edit', icon: 'edit' },
    { action: 'delete', label: 'Delete', icon: 'delete' }
  ];
  
  // Loading state
  loading = false;
  error = false;
  
  constructor(private service: YourService, private router: Router) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(filter?: string): void {
    this.loading = true;
    
    this.service.getData(filter)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.tableData = data;
          this.error = false;
        },
        error: (err) => {
          console.error('Error loading data:', err);
          this.error = true;
        }
      });
  }
  
  onFilterChange(event: { index: number, filter: DataTableFilter }): void {
    const filterValue = event.filter.value !== 'all' ? event.filter.value : undefined;
    this.loadData(filterValue);
  }
  
  onSearch(searchTerm: string): void {
    // Handle search
    console.log('Search term:', searchTerm);
  }
  
  onRowAction(event: { action: string, item: any }): void {
    const { action, item } = event;
    
    switch (action) {
      case 'view':
        this.router.navigate(['/details', item.id]);
        break;
      case 'edit':
        this.router.navigate(['/edit', item.id]);
        break;
      case 'delete':
        this.confirmDelete(item);
        break;
    }
  }
  
  onRowClick(item: any): void {
    this.router.navigate(['/details', item.id]);
  }
  
  onStateAction(event: { state: string, action: string }): void {
    if (event.state === 'error' && event.action === 'retry') {
      this.loadData();
    }
  }
  
  confirmDelete(item: any): void {
    // Show confirmation dialog
  }
}
```

### Template Usage

```html
<app-data-table-card
  title="Work Orders"
  [data]="tableData"
  [columns]="tableColumns"
  [filters]="tableFilters"
  [actions]="tableActions"
  [loading]="loading"
  [error]="error"
  (filterChange)="onFilterChange($event)"
  (rowAction)="onRowAction($event)"
  (rowClick)="onRowClick($event)"
  (search)="onSearch($event)"
  (stateAction)="onStateAction($event)">
</app-data-table-card>
```

## Disabling the Title

You can disable the title display while still defining a title (which might be useful for accessibility or other purposes):

```html
<app-data-table-card
  title="Work Orders"
  [showTitle]="false"
  [data]="tableData"
  [columns]="tableColumns"
  [filters]="tableFilters"
  [actions]="tableActions">
</app-data-table-card>
```

Or using the configuration object approach:

```typescript
tableConfig: DataTableConfig = {
  title: 'Work Orders',
  columns: [...],
  options: {
    showTitle: false,
    // other options...
  }
};
```

## Advanced Example with Configuration Object

```typescript
// Define the full configuration
tableConfig: DataTableConfig = {
  title: 'Work Orders',
  columns: [
    { property: 'orderNumber', header: 'Order #', sortable: true },
    { property: 'title', header: 'Title', class: 'title-cell', width: '25%' },
    { 
      property: 'client.name', 
      header: 'Client', 
      displayFn: (item) => item.client?.name || 'Not Assigned' 
    },
    { 
      property: 'priority', 
      header: 'Priority',
      customTemplate: 'priorityTemplate'
    },
    { 
      property: 'status', 
      header: 'Status',
      customTemplate: 'statusTemplate' 
    },
    { 
      property: 'completionPercentage', 
      header: 'Completion', 
      customTemplate: 'progressTemplate'
    }
  ],
  filters: [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Pending', value: 'pending' },
    { label: 'Completed', value: 'completed' }
  ],
  actions: [
    { 
      action: 'view', 
      label: 'View Details', 
      icon: 'visibility' 
    },
    { 
      action: 'edit', 
      label: 'Edit', 
      icon: 'edit',
      showFn: (item) => this.hasEditPermission(item)
    },
    { 
      action: 'delete', 
      label: 'Delete', 
      icon: 'delete',
      showFn: (item) => this.hasDeletePermission(item)
    }
  ],
  options: {
    showSearch: true,
    showFilters: true,
    showPagination: true,
    pageSizeOptions: [5, 10, 25, 50],
    pageSize: 10,
    hoverEffect: true,
    selectable: false,
    emptyState: {
      icon: 'assignment',
      title: 'No Work Orders Found',
      message: 'There are no work orders matching your criteria.',
      buttonLabel: 'Create New Work Order',
      buttonAction: 'create'
    },
    errorState: {
      icon: 'error_outline',
      title: 'Unable to load work orders',
      message: 'There was a problem loading the work orders. Please try again.',
      buttonLabel: 'Retry',
      buttonAction: 'retry'
    }
  }
};
```

### Template with Custom Cell Templates

```html
<app-data-table-card
  [config]="tableConfig"
  [data]="tableData"
  [loading]="loading"
  [error]="error"
  (filterChange)="onFilterChange($event)"
  (rowAction)="onRowAction($event)"
  (rowClick)="onRowClick($event)"
  (search)="onSearch($event)"
  (stateAction)="onStateAction($event)">
  
  <!-- Custom template for priority column -->
  <ng-template #priorityTemplate let-item>
    <span class="priority-chip" [ngClass]="getPriorityClass(item.priority)">
      {{ item.priority | titlecase }}
    </span>
  </ng-template>
  
  <!-- Custom template for status column -->
  <ng-template #statusTemplate let-item>
    <span class="status-chip" [ngClass]="getStatusClass(item.status)">
      {{ item.status | titlecase }}
    </span>
  </ng-template>
  
  <!-- Custom template for progress column -->
  <ng-template #progressTemplate let-item>
    <div class="progress-container">
      <div class="progress-bar" [style.width.%]="item.completionPercentage"></div>
      <span class="progress-text">{{ item.completionPercentage }}%</span>
    </div>
  </ng-template>
 