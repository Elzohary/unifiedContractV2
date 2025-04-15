/**
 * PageHeaderAction interface defines the structure for header action buttons
 */
export interface PageHeaderAction {
  /** The text label for the button */
  label: string;

  /** Optional icon name (Material icons) */
  icon?: string;

  /** Angular Material color options */
  color?: 'primary' | 'accent' | 'warn' | '';

  /** Button style variant */
  variant?: 'basic' | 'raised' | 'stroked' | 'flat' | 'icon';

  /**
   * Callback identifier string - will be emitted when button is clicked
   * This should match a method name in your component
   */
  callback: string;

  /** Whether the action button should be visible */
  visible?: boolean;

  /** Whether the action button should be disabled */
  disabled?: boolean;
}

/**
 * PageHeaderConfig interface for the main configuration of the header
 */
export interface PageHeaderConfig {
  /** Main header title */
  title: string;

  /** Optional subtitle text */
  subtitle?: string;

  /** List of action buttons to display */
  actions?: PageHeaderAction[];
}
