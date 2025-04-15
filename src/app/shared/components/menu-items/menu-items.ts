export interface MenuItem {
  title: string;
  icon: string;
  link: string;
  badge?: {
    text: string;
    color: string;
  };
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}

export const MENU_ITEMS: MenuSection[] = [
  {
    section: 'Work Orders',
    items: [
      {
        title: 'All Work Orders',
        icon: 'engineering',
        link: '/work-orders',
        badge: {
          text: '5',
          color: 'primary'
        }
      },
      {
        title: 'New Work Order',
        icon: 'add_circle',
        link: '/work-orders/new'
      },
      {
        title: 'Remarks',
        icon: 'comment',
        link: '/work-order-sections/remarks'
      },
      {
        title: 'Issues',
        icon: 'error_outline',
        link: '/work-order-sections/issues'
      },
      {
        title: 'Actions Needed',
        icon: 'assignment_late',
        link: '/work-order-sections/actions-needed'
      },
      {
        title: 'Materials',
        icon: 'inventory_2',
        link: '/work-order-sections/materials'
      },
      {
        title: 'Activity Log',
        icon: 'history',
        link: '/activity-log'
      }
    ]
  },
  // ... other sections ...
];