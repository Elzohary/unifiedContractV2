/**
 * DataTableFilter interface for filter tabs
 */
export interface DataTableFilter {
  /** Display label for the filter tab */
  label: string;

  /** Value associated with this filter (used for filtering logic) */
  value: string;

  /** Whether this filter is currently active (optional) */
  active?: boolean;

  /** Any additional metadata needed for this filter (optional) */
  metadata?: any;
}

/**
 * DataTableColumn interface for defining table columns
 */
export interface DataTableColumn {
  /** Property name in the data object to display in this column */
  property: string;

  /** Display header text for the column */
  header: string;

  /** Column width (can be px, %, etc) */
  width?: string;

  /** Whether the column is sortable */
  sortable?: boolean;

  /** Custom cell template name (if using custom cell rendering) */
  customTemplate?: string;

  /** Function to transform the display data (optional) */
  displayFn?: (item: any) => string;

  /** CSS class to apply to this column */
  class?: string;

  /** Additional cell styling */
  style?: { [key: string]: any };
}

/**
 * DataTableAction interface for row actions
 */
export interface DataTableAction {
  /** Action identifier (used in event emissions) */
  action: string;

  /** Display label */
  label: string;

  /** Material icon name */
  icon?: string;

  /** Material theme color for the action button ('primary', 'accent', 'warn', etc.) */
  color?: 'primary' | 'accent' | 'warn' | '';

  /** Function to determine if action should be visible for the row */
  showFn?: (item: any) => boolean;

  /** Function to determine if action should be disabled for the row */
  disableFn?: (item: any) => boolean;

  /** CSS class to apply to the action button */
  class?: string;
}

/**
 * DataTableOptions interface for table configuration
 */
export interface DataTableOptions {
  /** Whether to show the search input */
  showSearch?: boolean;

  /** Whether to show the filter tabs */
  showFilters?: boolean;

  /** Whether to show the pagination controls */
  showPagination?: boolean;

  /** Whether to show the table title */
  showTitle?: boolean;

  /** Page size options for pagination */
  pageSizeOptions?: number[];

  /** Default page size */
  pageSize?: number;

  /** Whether the table has hover effect on rows */
  hoverEffect?: boolean;

  /** Whether rows are selectable */
  selectable?: boolean;

  /** Whether to show empty state */
  showEmptyState?: boolean;

  /** Whether to show loading state */
  showLoadingState?: boolean;

  /** Whether to show error state */
  showErrorState?: boolean;

  /** Empty state configuration */
  emptyState?: {
    icon?: string;
    title?: string;
    message?: string;
    buttonLabel?: string;
    buttonAction?: string;
  };

  /** Error state configuration */
  errorState?: {
    icon?: string;
    title?: string;
    message?: string;
    buttonLabel?: string;
    buttonAction?: string;
  };

  /** Loading state configuration */
  loadingState?: {
    spinnerDiameter?: number;
    message?: string;
  };
}

/**
 * DataTableConfig interface for the main configuration of the data table card
 */
export interface DataTableConfig {
  /** Table title */
  title?: string;

  /** Columns configuration */
  columns: DataTableColumn[];

  /** Filter tabs (optional) */
  filters?: DataTableFilter[];

  /** Row actions */
  actions?: DataTableAction[];

  /** Table options */
  options?: DataTableOptions;
}
