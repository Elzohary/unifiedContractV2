 
 
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgTableHeaderComponent } from './ng-table-header/ng-table-header.component';
import { NgTableSearchComponent } from './ng-table-search/ng-table-search.component';
import { NgTableActionsComponent } from './ng-table-actions/ng-table-actions.component';

export interface TableColumn {
  name: string;       // Column name in the data source
  label: string;      // Display label for the column
  type?: 'text' | 'date' | 'number' | 'boolean' | 'icon' | 'currency'; // Column data type
  isVisible?: boolean; // Whether the column is visible (default: true)
  isSortable?: boolean; // Whether the column is sortable (default: true)
  isFilterable?: boolean; // Whether the column is filterable (default: true)
  format?: string;    // Optional format (for dates, currency, etc.)
  width?: string;     // Optional width (e.g., '100px', '10%')
  cellTemplate?: unknown; // Optional custom cell template
}

export interface TableAction {
  label: string;
  icon: string;
  action: 'add' | 'edit' | 'delete' | 'view' | 'custom';
  color?: 'primary' | 'accent' | 'warn';
  tooltip?: string;
  isVisible?: (item: unknown) => boolean; // Function to determine if action is visible for a specific item
}

@Component({
  selector: 'app-ng-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    NgTableHeaderComponent,
    NgTableSearchComponent,
    NgTableActionsComponent
  ],
  templateUrl: './ng-table.component.html',
  styleUrl: './ng-table.component.scss'
})
export class NgTableComponent<T = Record<string, unknown>> implements OnInit, OnChanges {
  @Input() title = '';
  @Input() data: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() showActionColumn = true;
  @Input() showSearch = true;
  @Input() showPaginator = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() allowMultiSelect = false;
  @Input() emptyMessage = 'No data available';
  @Input() rowIdField = 'id'; // Field to use as unique identifier
  @Input() showHeader = true;
  @Input() showAddButton = true;
  @Input() addButtonText = 'Add';
  @Input() hasFooterContent = false;

  @Output() rowClick = new EventEmitter<T>();
  @Output() actionClick = new EventEmitter<{action: TableAction, item: T}>();
  @Output() addItem = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
  @Output() viewItem = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<T>([]);
  displayedColumns: string[] = [];
  selectedItems: T[] = [];
  filterValue = '';

  // Getter for visible columns
  get visibleColumns(): TableColumn[] {
    return this.columns.filter(column => column.isVisible !== false);
  }

  ngOnInit(): void {
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.initializeTable();
    }
  }

  private initializeTable(): void {
    // Set displayed columns based on visible columns + action column if needed
    this.displayedColumns = this.visibleColumns.map(col => col.name);

    if (this.showActionColumn) {
      this.displayedColumns.push('actions');
    }

    // Update data source
    this.dataSource = new MatTableDataSource(this.data);

    // Set up sorting and filtering
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    // Custom filter predicate to search across all searchable columns
    this.dataSource.filterPredicate = (item: T, filter: string) => {
      const searchTerms = filter.trim().toLowerCase().split(' ');
      return searchTerms.every(term => {
        return this.columns.some(column => {
          if (column.isFilterable === false) return false;

          const value = this.getPropertyValue(item, column.name);
          if (value === null || value === undefined) return false;

          return String(value).toLowerCase().includes(term);
        });
      });
    };
  }

  // Handler for global search filter
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = this.filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Update filter from header search component
  onFilterChange(filterValue: string): void {
    this.filterValue = filterValue;
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Determine if an "add" action exists
  hasAddAction(): boolean {
    return this.actions && this.actions.some(a => a.action === 'add');
  }

  // Get sort header ID based on column sortability
  getSortHeaderId(column: TableColumn): string | '' {
    return column.isSortable !== false ? column.name : '';
  }

  // Get nested property value using dot notation (e.g., "user.address.city")
  getPropertyValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((prev: Record<string, unknown> | null, curr: string) => {
      return prev ? prev[curr] as Record<string, unknown> | null : null;
    }, obj as Record<string, unknown> | null);
  }

  // Handle row clicks
  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  // Handle action clicks
  onActionClick(action: TableAction, item: T): void {
    this.actionClick.emit({ action, item });

    // Also emit specific events based on action type
    switch (action.action) {
      case 'add':
        this.addItem.emit();
        break;
      case 'edit':
        this.editItem.emit(item);
        break;
      case 'delete':
        this.deleteItem.emit(item);
        break;
      case 'view':
        this.viewItem.emit(item);
        break;
    }
  }

  // Handle add button click
  onAddClick(): void {
    this.addItem.emit();
  }

  // Check if action should be visible for an item
  isActionVisible(action: TableAction, item: T): boolean {
    return action.isVisible ? action.isVisible(item) : true;
  }

  // Handle page events
  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  // Get display value for a cell, applying formatting if needed
  getCellValue(item: T, column: TableColumn): string {
    const value = this.getPropertyValue(item, column.name);

    if (value === undefined || value === null) {
      return '';
    }

    switch (column.type) {
      case 'date':
        // Simple date formatting - in real app you'd use a proper date pipe
        return value instanceof Date ? value.toLocaleDateString() : '';
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'currency':
        // Simple currency formatting - in real app you'd use a proper currency pipe
        return typeof value === 'number' ? `$${value.toFixed(2)}` : '';
      default:
        return String(value);
    }
  }
}
