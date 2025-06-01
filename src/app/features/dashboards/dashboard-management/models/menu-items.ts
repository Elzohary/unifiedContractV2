export const projectMenuItems = [
    {
        label: 'Dashboard',
        icon: 'dashboard',
        subItems: [
            {
                label: 'Overview',
                link: '/dashboard/overview',
                icon: 'home'
            },
            {
                label: 'Analytics',
                link: '/dashboard/analytics',
                icon: 'analytics'
            },
            {
                label: 'Projects',
                link: '/dashboard/projects',
                icon: 'work'
            }
        ]
    },
    {
        label: 'Work Orders',
        icon: 'work',
        subItems: [
            {
                label: 'All Work Orders',
                link: '/work-orders',
                icon: 'list'
            },
            {
                label: 'Remarks',
                link: '/work-order-sections/remarks',
                icon: 'comment'
            },
            {
                label: 'Issues',
                link: '/work-order-sections/issues',
                icon: 'error'
            },
            {
                label: 'Actions Needed',
                link: '/work-order-sections/actions',
                icon: 'assignment'
            },
            {
                label: 'Photos',
                link: '/work-order-sections/photos',
                icon: 'photo_library'
            },
            {
                label: 'Forms',
                link: '/work-order-sections/forms',
                icon: 'description'
            },
            {
                label: 'Expenses',
                link: '/work-order-sections/expenses',
                icon: 'attach_money'
            },
            {
                label: 'Invoices',
                link: '/work-order-sections/invoices',
                icon: 'receipt'
            },
            {
                label: 'Items',
                link: '/work-order-sections/items-list',
                icon: 'list_alt'
            }
        ]
    },
    {
        label: 'Resources',
        icon: 'inventory_2',
        subItems: [
            {
                label: 'Manpower',
                link: '/resources/manpower',
                icon: 'people'
            },
            {
                label: 'Equipment',
                link: '/resources/equipment',
                icon: 'build'
            },
            {
              label: 'Material Dashboard',
              link: '/materials/dashboard',
              icon: 'dashboard'
            },
            {
                label: 'Materials Catalouge',
                link: '/resources/materials',
                icon: 'warehouse'
            }
        ]
    },
    {
        label: 'HR Management',
        icon: 'people',
        subItems: [
            {
                label: 'Dashboard',
                link: '/hr/dashboard',
                icon: 'dashboard'
            },
            {
                label: 'Employees',
                link: '/hr/employees',
                icon: 'badge'
            },
            {
                label: 'Requests',
                link: '/hr/requests',
                icon: 'assignment'
            },
            {
                label: 'Attendance',
                link: '/hr/attendance',
                icon: 'access_time'
            },
            {
                label: 'Warnings',
                link: '/hr/warnings',
                icon: 'warning'
            },
            {
                label: 'Announcements',
                link: '/hr/announcements',
                icon: 'announcement'
            }
        ]
    },
    {
        label: 'Reports',
        icon: 'assessment',
        subItems: [
            {
                label: 'Monthly Reports',
                link: '/reports/monthly',
                icon: 'calendar_today'
            },
            {
                label: 'Performance Reports',
                link: '/reports/performance',
                icon: 'trending_up'
            },
            {
                label: 'Custom Reports',
                link: '/reports/custom',
                icon: 'tune'
            }
        ]
    },
    {
        label: 'Administration',
        icon: 'admin_panel_settings',
        subItems: [
            {
                label: 'User Management',
                link: '/admin/users',
                icon: 'manage_accounts'
            },
            {
                label: 'Settings',
                link: '/admin/settings',
                icon: 'settings'
            }
        ]
    }
];
