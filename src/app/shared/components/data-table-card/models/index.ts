export * from './data-table-card.model';

export interface DataTableColumn {
  property: string;
  header: string;
  displayFn?: (item: any) => string | number; // Function to format display value
  customTemplate?: string; // Name of the <ng-template #name> for custom cell rendering
  sortable?: boolean;
  sticky?: boolean;
  cellClass?: string | ((item: any) => string); // CSS class(es) for the cell
  headerClass?: string; // CSS class(es) for the header
}

export interface DataTableAction {
  action: string; // Unique identifier for the action
  label: string;
  icon?: string;
  color?: 'primary' | 'accent' | 'warn'; // Material theme colors
  tooltip?: string;
  showFn?: (item: any) => boolean; // Conditionally show action
  disableFn?: (item: any) => boolean; // Conditionally disable action
}

export interface DataTableFilter {
  label: string;
  value: any; // Value to filter by (can be string, number, boolean, etc.)
}

// New Interfaces for Clarity

export interface EmptyStateConfig {
  message: string;
  icon?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonAction?: string; // Action emitted when create button is clicked
}

export interface PaginatorOptions {
  showPaginator: boolean;
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons?: boolean;
}

// Configuration object (optional alternative to individual inputs)
export interface DataTableConfig {
  title?: string;
  columns: DataTableColumn[];
  filters?: DataTableFilter[]; // Kept for config object compatibility, but filterOptions input preferred
  actions?: DataTableAction[];
  options?: {
    showSearch?: boolean;
    // showFilters is implied by presence of filterOptions input
    showPagination?: boolean;
    showTitle?: boolean;
    pageSizeOptions?: number[];
    pageSize?: number;
    hoverEffect?: boolean;
    selectable?: boolean; // Corresponds to allowRowClick input
    emptyStateConfig?: EmptyStateConfig; // Use the specific interface
    paginatorConfig?: PaginatorOptions; // Use the specific interface
    // Loading/Error states are handled by direct inputs
  };
}
