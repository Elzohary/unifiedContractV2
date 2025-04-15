# Work Order Domain Structure

This document outlines the recommended structure for the Work Order domain following Angular best practices, standalone components, and domain-driven design principles.

## Directory Structure

```
domains/work-order/
├── components/                          # Domain-specific standalone components
│   ├── work-order-list/                 # Work order listing page
│   │   ├── work-order-list.component.ts
│   │   ├── work-order-list.component.html
│   │   └── work-order-list.component.scss
│   ├── work-order-detail/               # Work order detail page
│   │   ├── work-order-detail.component.ts
│   │   ├── work-order-detail.component.html
│   │   └── work-order-detail.component.scss
│   ├── work-order-form/                 # Work order creation/edit form
│   │   ├── work-order-form.component.ts
│   │   ├── work-order-form.component.html
│   │   └── work-order-form.component.scss
│   ├── dashboards/                      # Dashboard components
│   │   ├── remarks-dashboard/
│   │   │   ├── remarks-dashboard.component.ts
│   │   │   ├── remarks-dashboard.component.html
│   │   │   └── remarks-dashboard.component.scss
│   │   ├── issues-dashboard/
│   │   │   ├── issues-dashboard.component.ts
│   │   │   ├── issues-dashboard.component.html
│   │   │   └── issues-dashboard.component.scss
│   │   ├── activity-dashboard/
│   │   │   ├── activity-dashboard.component.ts
│   │   │   ├── activity-dashboard.component.html
│   │   │   └── activity-dashboard.component.scss
│   │   ├── actions-dashboard/
│   │   │   ├── actions-dashboard.component.ts
│   │   │   ├── actions-dashboard.component.html
│   │   │   └── actions-dashboard.component.scss
│   │   ├── photos-dashboard/
│   │   │   ├── photos-dashboard.component.ts
│   │   │   ├── photos-dashboard.component.html
│   │   │   └── photos-dashboard.component.scss
│   │   ├── forms-dashboard/
│   │   │   ├── forms-dashboard.component.ts
│   │   │   ├── forms-dashboard.component.html
│   │   │   └── forms-dashboard.component.scss
│   │   ├── expenses-dashboard/
│   │   │   ├── expenses-dashboard.component.ts
│   │   │   ├── expenses-dashboard.component.html
│   │   │   └── expenses-dashboard.component.scss
│   │   ├── materials-dashboard/
│   │   ├── manpower-dashboard/
│   │   ├── equipment-dashboard/
│   │   └── tasks-dashboard/
│   │
│   └── details/                         # Detail page components
│       ├── remark-detail/
│       ├── issue-detail/
│       ├── action-detail/
│       ├── photo-detail/
│       ├── form-detail/
│       └── expense-detail/
│
├── models/                              # Domain data models
│   ├── work-order.model.ts              # Work order data model
│   ├── issue.model.ts                   # Issue data model
│   ├── remark.model.ts                  # Remark data model
│   ├── action.model.ts                  # Action data model
│   ├── activity-log.model.ts
│   ├── photo.model.ts
│   ├── form.model.ts
│   └── expense.model.ts
│
├── view-models/                         # View models for UI representation
│   ├── work-order.view-model.ts         # View model for work orders
│   ├── issue.view-model.ts              # View model for issues
│   ├── remark.view-model.ts             # View model for remarks
│   ├── action.view-model.ts             # View model for actions
│   ├── activity-log.view-model.ts
│   ├── photo.view-model.ts
│   ├── form.view-model.ts
│   └── expense.view-model.ts
│
├── adapters/                            # Adapters to transform models
│   ├── work-order.adapter.ts            # Adapter for work order data
│   ├── issue.adapter.ts                 # Adapter for issue data
│   ├── remark.adapter.ts                # Adapter for remark data
│   ├── action.adapter.ts                # Adapter for action data
│   ├── activity-log.adapter.ts
│   ├── photo.adapter.ts
│   ├── form.adapter.ts
│   └── expense.adapter.ts
│
├── services/                            # Domain-specific services
│   ├── work-order.service.ts
│   ├── remark.service.ts
│   ├── issue.service.ts
│   ├── activity-log.service.ts
│   ├── task.service.ts
│   ├── material.service.ts
│   ├── equipment.service.ts
│   ├── manpower.service.ts
│   ├── photo.service.ts
│   ├── form.service.ts
│   └── expense.service.ts
│
├── utils/                               # Utility functions for work orders
│   ├── work-order-helpers.ts
│   └── work-order-validators.ts
│
├── constants/                           # Constants and enums
│   ├── work-order-status.enum.ts
│   └── work-order-priority.enum.ts
│
├── guards/                              # Route guards specific to work orders
│   └── work-order-access.guard.ts
│
├── pipes/                               # Domain-specific pipes
│   ├── status-filter.pipe.ts
│   └── priority-filter.pipe.ts
├── guards/
│   └── work-order.guard.ts
├── resolvers/
│   └── work-order.resolver.ts
│
└── routes.ts                            # Work order routes definition
```

## Key Components

### Work Order List
- Standalone component displaying work orders with filtering and sorting
- Implements pagination for large datasets
- Quick actions for common operations

### Work Order Details
- Standalone component showing comprehensive information about a single work order
- Leverages shared components for related entities display
- Uses view-models to format and prepare data for display
- Reuses shared components for remarks, issues, actions, etc.

### Work Order Form
- Standalone component for creating/editing work orders
- Form validation and error handling
- Reuses shared form components

### Dashboard Components
- Standalone components for managing specific item types across all work orders
- Each dashboard provides a centralized management interface
- Reuses shared components from the shared module for consistent UI

### Detail Components
- Standalone components for viewing detailed information about specific items
- Reuses shared components from the shared module

## View Models & Adapters

### View Models
- Transform domain models into formats suitable for UI display
- Handle UI-specific logic and formatting
- Example: `RemarkViewModel` transforms a `Remark` for display in both work order details and dashboards

### Adapters
- Convert between API data models and application models
- Handle format conversions and transformations
- Example: `RemarkAdapter` converts API response data to `Remark` models and vice versa

## Services

### Work Order Service
- CRUD operations for work orders
- Business logic implementation
- API integration

### Related Services
- Task, material, equipment, and manpower management
- Each service handles a specific domain concern
- Services inject shared core services for API communication

## Additional Features

### Guards & Resolvers
- Route protection and data pre-fetching
- Permission checking
- Handle loading states

### Pipes
- Custom filtering and data transformation
- Reusable across components

## Shared Components Usage

The Work Order domain leverages components from the shared module:

```
shared/
└── components/
    ├── data-table/                # Reusable table component used across dashboards
    ├── item-list/                 # Generic list component for remarks, issues, etc.
    ├── item-detail/               # Generic detail component for viewing items
    ├── item-form/                 # Generic form component for creating/editing items
    ├── card/                      # Reusable card component
    ├── filters/                   # Filter components
    └── form-controls/             # Reusable form controls
```

## Best Practices

1. Use standalone components throughout
2. Leverage shared components for consistency and code reuse
3. Keep components focused on presentation, use view-models for data transformation
4. Follow Angular style guide and type safety practices
5. Implement proper error handling and loading states
6. Write comprehensive unit tests
7. Document components and services
8. Follow security best practices

## Integration Points

- Authentication/Authorization
- User management
- Notification system
- File upload/download
- Reporting system
- Analytics tracking
