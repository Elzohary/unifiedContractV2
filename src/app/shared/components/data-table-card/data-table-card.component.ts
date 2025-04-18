import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
  ContentChild,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
  QueryList
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips'; // Keep if needed for badge styling or alternatives
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import {
  DataTableColumn,
  DataTableAction,
  DataTableFilter,
  EmptyStateConfig,
  PaginatorOptions
  // Remove DataTableConfig if not used
} from './models';

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
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatBadgeModule,
    TitleCasePipe
  ],
  templateUrl: './data-table-card.component.html',
  styleUrls: ['./data-table-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableCardComponent<T extends { id?: any }> implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  // --- Core Data & Configuration Inputs ---
  @Input() title?: string;
  @Input() columns: DataTableColumn[] = [];
  @Input() data: T[] | null = [];
  @Input() actions: DataTableAction[] = [];

  // --- State Inputs ---
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() emptyConfig: EmptyStateConfig = {
    message: 'No data available.',
    icon: 'info_outline',
    showCreateButton: false,
    createButtonText: 'Create New'
  };

  // --- Feature Control Inputs ---
  @Input() filterOptions: DataTableFilter[] = [];
  @Input() initialFilterValue?: any; // Match DataTableFilter value type
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() allowRowClick = false;
  @Input() useHoverEffect = true;
  @Input() paginatorOptions: PaginatorOptions = {
    showPaginator: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true
  };

  // --- Outputs ---
  @Output() rowAction = new EventEmitter<{ action: string; item: T }>();
  @Output() stateAction = new EventEmitter<{ state: 'loading' | 'error' | 'empty'; action: string }>();
  @Output() rowClick = new EventEmitter<T>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any | undefined>(); // Emits selected filter value
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  // --- Template References ---
  // Use ContentChild for specific named templates (e.g., #statusCell, #priorityCell)
  @ContentChild('priorityCell', { read: TemplateRef }) priorityCellTemplate?: TemplateRef<any>;
  @ContentChild('statusCell', { read: TemplateRef }) statusCellTemplate?: TemplateRef<any>;
  @ContentChild('completionCell', { read: TemplateRef }) completionCellTemplate?: TemplateRef<any>;
  // Add more specific template refs as needed based on your customTemplate names

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger;

  // --- Internal State ---
  tableDataSource = new MatTableDataSource<T>([]);
  displayedColumns: string[] = [];
  selectedFilterValue: any | undefined; // Tracks the selected filter dropdown value

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  contextMenuPosition = { x: '0px', y: '0px' };
  contextMenuItem: T | null = null;

  // Signals for derived state
  readonly isEmpty = computed(() => {
      const empty = !this.loading && !this.error && this.tableDataSource.data.length === 0;
      return empty;
  });
  readonly showTable = computed(() => {
      const show = !this.loading && !this.error && !this.isEmpty();
      return show;
  });

  @Input() selectedFilterIndex: number | null = null; // Ensure selectedFilterIndex is a number
  @Input() filters: DataTableFilter[] = []; // Add this line to define filters as an input

  constructor() {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.tableDataSource.filter = value.trim().toLowerCase();
      if (this.tableDataSource.paginator) {
        this.tableDataSource.paginator.firstPage();
      }
      this.searchChange.emit(value);
    });
  }

  ngOnInit(): void {
    // Set initial filter value (handle undefined/null cases)
    this.selectedFilterValue = this.initialFilterValue ?? (this.filterOptions[0]?.value);
    if (this.selectedFilterValue === null || this.selectedFilterValue === undefined) {
      this.selectedFilterValue = ''; // Default to empty string if first option value is null/undefined
    }

    this.updateDisplayedColumns();
    // Use the default filter predicate which searches all stringified data
    // Dropdown filtering is handled by the parent via the filterChange event
    this.tableDataSource.filterPredicate = (data: T, filter: string): boolean => {
        const searchTerm = filter;
        if (!searchTerm) return true;

        const dataStr = Object.keys(data as object).reduce((currentTerm: string, key: string) => {
          const value = (data as any)[key];
          const stringValue = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value);
          return currentTerm + stringValue + '◬';
        }, '').toLowerCase();
        return dataStr.includes(searchTerm.toLowerCase());
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
        const newData = changes['data'].currentValue ?? [];
        this.tableDataSource.data = newData;
        if (this.paginator && !changes['data'].firstChange) {
            this.tableDataSource.paginator?.firstPage();
        }
    }
    if (changes['columns']) {
        this.updateDisplayedColumns();
    }
    if (changes['filterOptions'] || changes['initialFilterValue']) {
       // Update selected value if options or initial value changes after init
       this.selectedFilterValue = this.initialFilterValue ?? (this.filterOptions[0]?.value);
       if (this.selectedFilterValue === null || this.selectedFilterValue === undefined) {
         this.selectedFilterValue = '';
       }
    }
  }

  ngAfterViewInit(): void {
    // Link paginator and sort to the internal data source
    if (this.paginatorOptions.showPaginator && this.paginator) {
        this.tableDataSource.paginator = this.paginator;
    }
    if (this.sort) {
        this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = this.columns.map(col => col.property);
    if (this.actions.length > 0) {
      // Ensure 'actions' column is added only once
      if (!this.displayedColumns.includes('actions')) {
           this.displayedColumns.push('actions');
      }
    } else {
        // Remove 'actions' column if no actions are provided
        this.displayedColumns = this.displayedColumns.filter(c => c !== 'actions');
    }
  }

  handleSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value); // Pass to debounced subject
  }

  handleFilterChange(event: MatSelectChange): void {
    // Use undefined for the 'All' or default case if needed, based on filter values
    this.selectedFilterValue = event.value;
    this.filterChange.emit(this.selectedFilterValue);
    // Parent component should handle data refetching/filtering
    // Reset pagination when filter changes
     if (this.tableDataSource.paginator) {
        this.tableDataSource.paginator.firstPage();
      }
  }

  handleSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
    // Parent component handles server-side sorting or applies sort to local data source
    // For local sorting, assigning MatSort in ngAfterViewInit is usually sufficient
  }

  handlePageChange(event: PageEvent): void {
    this.pageChange.emit(event);
    // Parent component handles server-side pagination
  }

  onRowClick(item: T): void {
    if (this.allowRowClick) {
      this.rowClick.emit(item);
    }
  }

  onContextMenu(event: MouseEvent, item: T): void {
    event.preventDefault(); // Prevent native context menu
    if (this.actions.length > 0) {
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenuItem = item;
      this.contextMenu.menuData = { item: item }; // Pass item data to the menu template
      this.contextMenu.openMenu();
    }
  }

  handleAction(action: string, item: T): void {
    this.rowAction.emit({ action, item });
  }

  handleStateButtonClick(action: string): void {
    const state = this.loading ? 'loading' : this.error ? 'error' : 'empty';
    this.stateAction.emit({ state, action });
  }

  // --- Template Helpers ---
  getColumnHeader(property: string): string {
    return this.columns.find(col => col.property === property)?.header || property;
  }

  getCellData(item: T, column: DataTableColumn): any {
    if (column.displayFn) {
      return column.displayFn(item);
    }
    // Basic property access, handles nested properties like 'details.client'
    return column.property.split('.').reduce((o, k) => (o != null ? o[k] : undefined), item as any);
  }

  // Get the template reference based on the column's customTemplate string
  getCustomTemplate(column: DataTableColumn): TemplateRef<any> | undefined {
    switch(column.customTemplate) {
      case 'priorityCell': return this.priorityCellTemplate;
      case 'statusCell': return this.statusCellTemplate;
      case 'completionCell': return this.completionCellTemplate;
      // Add other named templates here corresponding to @ContentChild decorators
      default: return undefined;
    }
  }

  // Helper function for determining badge color (example)
  getBadgeColor(value: string | number | undefined): 'primary' | 'accent' | 'warn' {
    if (value === undefined || value === null) return 'primary'; // Default for undefined

    const lowerValue = String(value).toLowerCase();

    // Customize these mappings based on your specific status/priority values
    const primaryValues = ['completed', 'active', 'high', '100'];
    const accentValues = ['pending', 'medium', 'in-progress'];
    const warnValues = ['error', 'inactive', 'low', 'cancelled', 'on-hold', 'failed'];

    if (primaryValues.includes(lowerValue)) return 'primary';
    if (accentValues.includes(lowerValue)) return 'accent';
    if (warnValues.includes(lowerValue)) return 'warn';

    return 'primary'; // Default color if no match found
  }

  // TrackBy functions for performance in *ngFor
  trackByColumn(index: number, item: DataTableColumn): string {
    return item.property;
  }

  trackByAction(index: number, item: DataTableAction): string {
    return item.action;
  }

   trackByRow(index: number, item: T): any {
    return item.id ?? index; // Use 'id' if available, otherwise index
  }

  // Add missing method to get display value
  getDisplayValue(column: DataTableColumn, item: T): any {
    if (column.displayFn) {
      return column.displayFn(item);
    }
    return this.getCellData(item, column);
  }
}
