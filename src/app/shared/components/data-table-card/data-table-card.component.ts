import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface TableColumn {
  name: string;       // Internal column name (used in data)
  label: string;      // Display label
  sortable?: boolean; // Whether column can be sorted
  filterable?: boolean; // Whether column can be filtered
  width?: string;     // Column width
  align?: 'left' | 'center' | 'right'; // Column alignment
  cellTemplate?: TemplateRef<any>; // Optional reference to custom template
  valueGetter?: (row: any) => any; // <-- Add valueGetter
}

export interface TableAction {
  name: string;          // Action name
  icon: string;          // Material icon name
  color?: string;        // Icon color
  tooltip?: string;      // Tooltip text
  disabled?: boolean | ((row: any) => boolean); // Whether the action is disabled
}

@Component({
  selector: 'app-data-table-card',
  templateUrl: './data-table-card.component.html',
  styleUrls: ['./data-table-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class DataTableCardComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Inputs
  @Input() title?: string;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() errorText?: string;
  @Input() emptyStateMessage = 'No data available';
  @Input() showSearch = true;
  @Input() showPaginator = true;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() actions: TableAction[] = [];
  
  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Outputs
  @Output() rowAction = new EventEmitter<{action: string, row: any}>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>();

  // Component properties
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];
  searchText = '';
  contextMenuPosition = { x: '0px', y: '0px' };
  selectedRow: any = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchChange.emit(value);
      this.applyFilter();
    });
  }

  ngOnInit(): void {
    this.setupDisplayedColumns();
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.setupDisplayedColumns();
    }
    
    if (changes['data']) {
      this.updateDataSource();
    }
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDisplayedColumns(): void {
    this.displayedColumns = this.columns.map(column => column.name);
    
    // Add actions column if we have actions
    if (this.actions && this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
  }

  private updateDataSource(): void {
    this.dataSource.data = this.data || [];
    
    // Apply sorting and pagination
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText = value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchText = '';
    this.searchSubject.next('');
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: string, row: any, event: Event): void {
    event.stopPropagation();
    this.rowAction.emit({ action, row });
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    if (typeof action.disabled === 'boolean') {
      return action.disabled;
    } else if (typeof action.disabled === 'function') {
      return action.disabled(row);
    }
    return false;
  }

  // Handle right-click context menu
  onContextMenu(event: MouseEvent, row: any): void {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.selectedRow = row;
  }

  // Helper to get cell value using getter or direct access
  getCellValue(row: any, column: TableColumn): any {
    if (column.valueGetter) {
      return column.valueGetter(row);
    } 
    // Fallback to direct property access if no getter
    // This handles nested properties via dot notation if name includes '.'
    // Or direct access if it's a simple property name
    return column.name.split('.').reduce((o, k) => (o || {})[k], row);
  }
} 