import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgTableComponent, TableAction } from '../ng-table.component';
import {
  MOCK_USERS,
  USER_TABLE_COLUMNS,
  User,
  MOCK_PRODUCTS,
  PRODUCT_TABLE_COLUMNS,
  Product
} from './mock-table-data';
import { DEFAULT_TABLE_CONFIG, USER_TABLE_ACTIONS } from '../config/ng-table-config';

/**
 * Example component showing how to use NgTableComponent with Users
 */
@Component({
  selector: 'app-user-table-demo',
  standalone: true,
  imports: [CommonModule, NgTableComponent],
  template: `
    <app-ng-table
      [title]="'User Management'"
      [data]="users"
      [columns]="columns"
      [actions]="actions"
      [showSearch]="true"
      [showPaginator]="true"
      (rowClick)="onUserClick($event)"
      (actionClick)="onUserAction($event)"
      (addItem)="onAddUser()">
    </app-ng-table>
  `
})
export class UserTableDemoComponent {
  users = MOCK_USERS;
  columns = USER_TABLE_COLUMNS;
  actions = USER_TABLE_ACTIONS;

  onUserClick(user: User): void {
    console.log('User clicked:', user);
  }

  onUserAction(data: {action: TableAction, item: User}): void {
    console.log(`Action ${data.action.action} on user:`, data.item);

    // Handle different actions
    switch (data.action.action) {
      case 'edit':
        // Open edit modal, etc.
        break;
      case 'delete':
        // Show confirmation dialog
        break;
      case 'view':
        // Show details
        break;
      case 'custom':
        // Handle custom actions based on label or other properties
        if (data.action.label === 'Suspend') {
          // Handle suspend
        } else if (data.action.label === 'Activate') {
          // Handle activate
        }
        break;
    }
  }

  onAddUser(): void {
    console.log('Add user clicked');
    // Open add user modal
  }
}

/**
 * Example component showing how to use NgTableComponent with Products
 */
@Component({
  selector: 'app-product-table-demo',
  standalone: true,
  imports: [CommonModule, NgTableComponent],
  template: `
    <app-ng-table
      [title]="'Product Catalog'"
      [data]="products"
      [columns]="columns"
      [actions]="productActions"
      [pageSize]="5"
      [showAddButton]="true"
      (actionClick)="onProductAction($event)">

      <!-- Example of custom header content -->
      <div ngTableHeader>
        <div class="custom-filter">
          <strong>Category:</strong>
          <select (change)="filterByCategory($event)">
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Audio">Audio</option>
            <option value="Furniture">Furniture</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>
      </div>
    </app-ng-table>
  `,
  styles: [`
    .custom-filter {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `]
})
export class ProductTableDemoComponent {
  products = MOCK_PRODUCTS;
  columns = PRODUCT_TABLE_COLUMNS;
  filteredProducts = [...MOCK_PRODUCTS];

  // Example of defining actions inline
  productActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      action: 'edit',
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: 'delete',
      color: 'warn'
    },
    {
      label: 'View Details',
      icon: 'visibility',
      action: 'view'
    },
    {
      label: 'Toggle Active Status',
      icon: 'toggle_on',
      action: 'custom',
      color: 'accent'
    }
  ];

  onProductAction(data: {action: TableAction, item: Product}): void {
    console.log(`Action ${data.action.action} on product:`, data.item);

    // Implementation would go here
  }

  filterByCategory(event: Event): void {
    const category = (event.target as HTMLSelectElement).value;

    if (category) {
      this.filteredProducts = this.products.filter(p => p.category === category);
    } else {
      this.filteredProducts = [...this.products];
    }
  }
}

/**
 * Example of how to use the table components with default configuration
 */
@Component({
  selector: 'app-table-with-defaults-demo',
  standalone: true,
  imports: [CommonModule, NgTableComponent],
  template: `
    <h2>Table With Default Configuration</h2>
    <app-ng-table
      [title]="'Users'"
      [data]="users"
      [columns]="columns"
      [actions]="actions"
      [pageSize]="defaultConfig.pageSize"
      [pageSizeOptions]="defaultConfig.pageSizeOptions"
      [showPaginator]="defaultConfig.showPaginator"
      [showSearch]="defaultConfig.showSearch"
      [showActionColumn]="defaultConfig.showActionColumn"
      [showHeader]="defaultConfig.showHeader"
      [hasFooterContent]="true"
      [emptyMessage]="defaultConfig.emptyMessage">

      <!-- Footer content -->
      <div ngTableFooter class="table-footer">
        <div class="footer-stats">
          Total Users: {{ users.length }}
        </div>
        <div class="footer-actions">
          <button mat-button color="primary">Export to CSV</button>
          <button mat-button color="accent">Print Table</button>
        </div>
      </div>
    </app-ng-table>
  `,
  styles: [`
    .table-footer {
      margin-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-stats {
      font-weight: 500;
    }
    .footer-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class TableWithDefaultsComponent {
  users = MOCK_USERS;
  columns = USER_TABLE_COLUMNS;
  actions = USER_TABLE_ACTIONS;
  defaultConfig = DEFAULT_TABLE_CONFIG;
}
