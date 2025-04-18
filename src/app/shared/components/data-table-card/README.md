# Data Table Card Component

A modern, responsive, and customizable data table component with sorting, filtering, and pagination capabilities.

## Features

- Clean card-based design with Material styling
- Support for dynamic columns with custom templates
- Search functionality with debouncing
- Pagination with customizable page sizes
- Row actions with dropdown menu
- Context menu (right-click) support
- Support for loading, error, and empty states
- Responsive design for all screen sizes
- Dark theme support

## Usage Example

### Basic Usage

```html
<app-data-table-card
  [title]="'Users'"
  [columns]="columns"
  [data]="users"
  [loading]="loading"
  [errorText]="errorMessage"
  (rowClick)="onUserClick($event)"
  (rowAction)="onUserAction($event)">
</app-data-table-card>
```

```typescript
import { Component, OnInit } from '@angular/core';
import { TableColumn } from '../../shared/components/data-table-card/data-table-card.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  columns: TableColumn[] = [
    { name: 'id', label: 'ID', sortable: true },
    { name: 'name', label: 'Name', sortable: true },
    { name: 'email', label: 'Email', sortable: true },
    { name: 'role', label: 'Role' },
    { name: 'lastLogin', label: 'Last Login', sortable: true }
  ];
  
  users: any[] = [];
  loading = true;
  errorMessage = '';
  
  constructor(private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }
  
  onUserClick(user: any): void {
    // Navigate to user details
    this.router.navigate(['/users', user.id]);
  }
  
  onUserAction(event: {action: string, row: any}): void {
    const { action, row } = event;
    
    switch(action) {
      case 'Edit':
        this.editUser(row);
        break;
      case 'Delete':
        this.confirmDeleteUser(row);
        break;
      case 'Activate':
        this.activateUser(row);
        break;
    }
  }
}
```

### Advanced Usage with Custom Templates

```html
<app-data-table-card
  [title]="'Work Orders'"
  [columns]="columns"
  [data]="workOrders"
  [actions]="workOrderActions"
  [loading]="loading"
  [showSearch]="true"
  (rowClick)="viewWorkOrder($event)"
  (rowAction)="onWorkOrderAction($event)">
  
  <!-- Status column template -->
  <ng-template #statusTemplate let-row>
    <span class="status-badge" [ngClass]="row.status">
      {{ row.status | titlecase }}
    </span>
  </ng-template>
  
  <!-- Progress column template -->
  <ng-template #progressTemplate let-row>
    <mat-progress-bar 
      [value]="row.progress" 
      [color]="getProgressColor(row.progress)">
    </mat-progress-bar>
    <span class="progress-text">{{ row.progress }}%</span>
  </ng-template>
</app-data-table-card>
```

```typescript
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TableColumn } from '../../shared/components/data-table-card/data-table-card.component';

@Component({
  selector: 'app-work-order-list',
  templateUrl: './work-order-list.component.html'
})
export class WorkOrderListComponent implements OnInit {
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('progressTemplate') progressTemplate!: TemplateRef<any>;
  
  columns: TableColumn[] = [];
  workOrders: any[] = [];
  loading = true;
  
  workOrderActions = [
    { name: 'View', icon: 'visibility' },
    { name: 'Edit', icon: 'edit' },
    { name: 'Delete', icon: 'delete', color: 'warn' }
  ];
  
  constructor(private workOrderService: WorkOrderService) {}
  
  ngOnInit(): void {
    this.loadWorkOrders();
  }
  
  ngAfterViewInit(): void {
    // Set up columns with template references after view is initialized
    this.columns = [
      { name: 'id', label: 'Order #', sortable: true },
      { name: 'title', label: 'Title', sortable: true },
      { name: 'client', label: 'Client', sortable: true },
      { name: 'status', label: 'Status', cellTemplate: this.statusTemplate },
      { name: 'progress', label: 'Progress', cellTemplate: this.progressTemplate }
    ];
  }
  
  getProgressColor(progress: number): string {
    if (progress < 30) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
}
```

## Component API

### Inputs

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | string | undefined | The card title |
| columns | TableColumn[] | [] | Array of column definitions |
| data | any[] | [] | Array of data items to display |
| loading | boolean | false | Whether the data is loading |
| errorText | string | undefined | Error message to display |
| emptyStateMessage | string | 'No data available' | Message to display when there's no data |
| showSearch | boolean | true | Whether to show the search field |
| showPaginator | boolean | true | Whether to show the paginator |
| pageSize | number | 10 | Default page size |
| pageSizeOptions | number[] | [5, 10, 25, 50] | Available page size options |
| actions | { name: string, icon: string, color?: string, tooltip?: string }[] | [] | Row actions to display |

### TableColumn Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| name | string | Yes | Internal column name (used in data) |
| label | string | Yes | Display label |
| sortable | boolean | No | Whether column can be sorted |
| filterable | boolean | No | Whether column can be filtered |
| width | string | No | Column width (e.g., '100px', '25%') |
| align | 'left' \| 'center' \| 'right' | No | Column alignment |
| cellTemplate | TemplateRef<any> | No | Custom template for cell rendering |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| rowClick | EventEmitter<any> | Emitted when a row is clicked |
| rowAction | EventEmitter<{action: string, row: any}> | Emitted when a row action is triggered |
| searchChange | EventEmitter<string> | Emitted when the search text changes | 