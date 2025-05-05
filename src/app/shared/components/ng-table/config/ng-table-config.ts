import { TableAction } from '../ng-table.component';
import { User, UserRole, UserStatus } from '../data/mock-table-data';

/**
 * Type guard to check if an item is a User
 */
function isUser(item: unknown): item is User {
  return (
    item !== null &&
    typeof item === 'object' &&
    'role' in item &&
    'status' in item
  );
}

/**
 * Default table configuration
 */
export const DEFAULT_TABLE_CONFIG = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  showPaginator: true,
  showSearch: true,
  showActionColumn: true,
  showHeader: true,
  showAddButton: true,
  emptyMessage: 'No data available'
};

/**
 * Example action handlers for users
 */
export const USER_TABLE_ACTIONS: TableAction[] = [
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
    color: 'warn',
    // Only allow deleting users who are not admins
    isVisible: (item: unknown) => {
      if (isUser(item)) {
        return item.role !== UserRole.ADMIN;
      }
      return false;
    }
  },
  {
    label: 'View Details',
    icon: 'visibility',
    action: 'view',
    color: 'accent'
  },
  {
    label: 'Suspend',
    icon: 'block',
    action: 'custom',
    color: 'warn',
    // Only show suspend option for active users who are not admins
    isVisible: (item: unknown) => {
      if (isUser(item)) {
        return (
          item.status === UserStatus.ACTIVE &&
          item.role !== UserRole.ADMIN
        );
      }
      return false;
    }
  },
  {
    label: 'Activate',
    icon: 'check_circle',
    action: 'custom',
    color: 'accent',
    // Only show activate option for inactive or suspended users
    isVisible: (item: unknown) => {
      if (isUser(item)) {
        return (
          item.status === UserStatus.INACTIVE ||
          item.status === UserStatus.SUSPENDED
        );
      }
      return false;
    }
  }
];

/**
 * Theme configurations
 */
export const TABLE_THEMES = {
  default: {
    tableHeaderColor: '#f5f5f5',
    tableHoverColor: '#f0f7ff',
    tableOddRowColor: '#ffffff',
    tableEvenRowColor: '#fafafa',
    tableBorderColor: '#e0e0e0'
  },
  dark: {
    tableHeaderColor: '#2c2c2c',
    tableHoverColor: '#3a3a3a',
    tableOddRowColor: '#242424',
    tableEvenRowColor: '#2a2a2a',
    tableBorderColor: '#444444'
  },
  primary: {
    tableHeaderColor: '#e3f2fd',
    tableHoverColor: '#bbdefb',
    tableOddRowColor: '#ffffff',
    tableEvenRowColor: '#f5f9ff',
    tableBorderColor: '#90caf9'
  }
};

/**
 * Example of how to configure date formatters
 */
export const DATE_FORMATS = {
  short: 'MM/dd/yyyy',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a'
};

/**
 * Example of how to configure currency formatters
 */
export const CURRENCY_FORMATS = {
  USD: {
    currency: 'USD',
    symbolDisplay: true,
    digits: '1.2-2'
  },
  EUR: {
    currency: 'EUR',
    symbolDisplay: true,
    digits: '1.2-2'
  },
  SAR: {
    currency: 'SAR',
    symbolDisplay: true,
    digits: '1.2-2'
  }
};
