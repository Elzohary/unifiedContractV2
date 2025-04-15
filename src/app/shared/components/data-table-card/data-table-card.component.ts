import { Component, Input, Output, EventEmitter, ViewChild, OnInit, ContentChildren, QueryList, TemplateRef, ContentChild, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DataTableConfig, DataTableFilter, DataTableAction, DataTableColumn } from './models';

/**
 * Pipe to get a template by name from a query list of templates
 */
@Pipe({
  name: 'getTemplateByName',
  standalone: true
})
export class GetTemplateByNamePipe implements PipeTransform {
  transform(templates: QueryList<TemplateRef<any>>, name: string): TemplateRef<any> | null {
    if (!templates || !name) return null;

    // Find template with matching name attribute
    const templateRef = templates.find((template: any) =>
      template.name === name || template._declarationTContainer?.localNames?.includes(name)
    );

    return templateRef || null;
  }
}

@Component({
  selector: 'app-data-table-card',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSortModule,
    GetTemplateByNamePipe
  ],
  templateUrl: './data-table-card.component.html',
  styleUrl: './data-table-card.component.scss'
})
export class DataTableCardComponent implements OnInit {
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() filters: DataTableFilter[] = [];
  @Input() actions: DataTableAction[] = [];
  @Input() loading: boolean = false;
  @Input() error: boolean = false;
  @Input() selectedFilterIndex: number = 0;
  @Input() showTitle: boolean = true;

  /**
   * Full configuration object alternative
   */
  @Input() set config(value: DataTableConfig) {
    if (value) {
      if (value.title !== undefined) this.title = value.title;
      if (value.columns) this.columns = value.columns;
      if (value.filters) this.filters = value.filters;
      if (value.actions) this.actions = value.actions;

      // Apply options if provided
      if (value.options) {
        this.showSearch = value.options.showSearch ?? true;
        this.showFilters = value.options.showFilters ?? true;
        this.showPagination = value.options.showPagination ?? true;
        this.showTitle = value.options.showTitle ?? true;
        this.pageSizeOptions = value.options.pageSizeOptions ?? [5, 10, 25, 100];
        this.pageSize = value.options.pageSize ?? 10;
        this.hoverEffect = value.options.hoverEffect ?? true;
        this.selectable = value.options.selectable ?? false;
        this.showEmptyState = value.options.showEmptyState ?? true;
        this.showLoadingState = value.options.showLoadingState ?? true;
        this.showErrorState = value.options.showErrorState ?? true;

        // Apply state configurations
        if (value.options.emptyState) {
          this.emptyState = {
            icon: value.options.emptyState.icon ?? 'inbox',
            title: value.options.emptyState.title ?? 'No Data Found',
            message: value.options.emptyState.message ?? 'There are no items matching your criteria.',
            buttonLabel: value.options.emptyState.buttonLabel || undefined,
            buttonAction: value.options.emptyState.buttonAction || undefined
          };
        }

        if (value.options.errorState) {
          this.errorState = {
            icon: value.options.errorState.icon ?? 'error_outline',
            title: value.options.errorState.title ?? 'Error Loading Data',
            message: value.options.errorState.message ?? 'There was a problem loading the data. Please try again.',
            buttonLabel: value.options.errorState.buttonLabel ?? 'Retry',
            buttonAction: value.options.errorState.buttonAction ?? 'retry'
          };
        }

        if (value.options.loadingState) {
          this.loadingState = {
            spinnerDiameter: value.options.loadingState.spinnerDiameter ?? 40,
            message: value.options.loadingState.message ?? 'Loading data...'
          };
        }
      }
    }
  }

  // Configuration options with defaults
  showSearch: boolean = true;
  showFilters: boolean = true;
  showPagination: boolean = true;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize: number = 10;
  hoverEffect: boolean = true;
  selectable: boolean = false;
  showEmptyState: boolean = true;
  showLoadingState: boolean = true;
  showErrorState: boolean = true;

  // State configurations
  emptyState: {
    icon: string;
    title: string;
    message: string;
    buttonLabel: string | undefined;
    buttonAction: string | undefined;
  } = {
    icon: 'inbox',
    title: 'No Data Found',
    message: 'There are no items matching your criteria.',
    buttonLabel: undefined,
    buttonAction: undefined
  };

  errorState = {
    icon: 'error_outline',
    title: 'Error Loading Data',
    message: 'There was a problem loading the data. Please try again.',
    buttonLabel: 'Retry',
    buttonAction: 'retry'
  };

  loadingState = {
    spinnerDiameter: 40,
    message: 'Loading data...'
  };

  // Data source for the table
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  // Events
  @Output() filterChange = new EventEmitter<{ index: number, filter: DataTableFilter }>();
  @Output() rowAction = new EventEmitter<{ action: string, item: any }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() stateAction = new EventEmitter<{ state: string, action: string }>();
  @Output() search = new EventEmitter<string>();

  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Optional content projection for custom templates
  @ContentChildren(TemplateRef) customTemplates!: QueryList<TemplateRef<any>>;

  ngOnInit(): void {
    this.setupTable();
  }

  ngOnChanges(): void {
    this.setupTable();
  }

  ngAfterViewInit(): void {
    this.setupPaginationAndSort();
  }

  setupTable(): void {
    // Set up the data source
    this.dataSource.data = this.data;

    // Set up displayed columns (including actions if present)
    this.displayedColumns = this.columns.map(column => column.property);
    if (this.actions && this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
  }

  setupPaginationAndSort(): void {
    if (this.showPagination && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  onFilterTabChange(event: any): void {
    this.selectedFilterIndex = event.index;
    this.filterChange.emit({
      index: event.index,
      filter: this.filters[event.index]
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.search.emit(filterValue);
  }

  onRowClick(row: any): void {
    if (!this.loading && !this.error) {
      this.rowClick.emit(row);
    }
  }

  onRowAction(action: string, item: any): void {
    // Stop event propagation to prevent row click
    event?.stopPropagation();

    if (!this.loading && !this.error) {
      this.rowAction.emit({ action, item });
    }
  }

  onStateAction(state: string, action: string): void {
    this.stateAction.emit({ state, action });
  }

  isActionVisible(action: DataTableAction, item: any): boolean {
    return action.showFn ? action.showFn(item) : true;
  }

  isActionDisabled(action: DataTableAction, item: any): boolean {
    return action.disableFn ? action.disableFn(item) : false;
  }

  getDisplayValue(column: DataTableColumn, item: any): any {
    if (column.displayFn) {
      return column.displayFn(item);
    }

    // Navigate nested properties using dot notation (e.g., 'user.name')
    if (column.property.includes('.')) {
      return column.property.split('.').reduce((obj, prop) => obj && obj[prop], item);
    }

    return item[column.property];
  }
}
