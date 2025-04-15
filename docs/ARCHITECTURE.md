# Unified Contract Management Application Architecture

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Module Structure](#module-structure)
4. [Data Models](#data-models)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Security](#security)
8. [Performance](#performance)
9. [Development Guidelines](#development-guidelines)

## Overview

The Unified Contract Management Application is a comprehensive solution for managing contracts, work orders, and resources. Built with Angular, SASS, .NET APIs, and SQL database, it provides a modern, scalable, and maintainable architecture.

## Architecture

### Core Architecture Principles
- **Modularity**: Feature-based organization with standalone components
- **Reusability**: Shared components and services across modules
- **Scalability**: Microservices architecture with clear boundaries
- **Maintainability**: Clean code practices and comprehensive documentation
- **Performance**: Optimized state management and lazy loading

### Technology Stack
- **Frontend**: Angular 17+
- **State Management**: Angular Signals
- **Styling**: SCSS with Material Design
- **API Integration**: REST + WebSocket
- **Testing**: Jest + Angular Testing Library

## Module Structure

### Core Module
- **Services**:
  - `ApiService`: Centralized HTTP communication
  - `StateService`: Global state management
  - `WebsocketService`: Real-time updates
  - `AuthService`: Authentication and authorization

### Resources Module
- **Components**:
  - `EquipmentListComponent`: Displays all equipment with filtering and sorting
  - `EquipmentDetailsComponent`: Detailed view of equipment information
  - `EquipmentAssignmentComponent`: Manages equipment assignments to work orders
  - `EquipmentMaintenanceComponent`: Tracks maintenance records and schedules
  - `EquipmentDashboardComponent`: Overview of equipment status and activities

- **Services**:
  - `EquipmentService`: Manages equipment CRUD operations
  - `MaintenanceService`: Handles maintenance scheduling and records
  - `AssignmentService`: Manages equipment assignments

- **Models**:
  ```typescript
  interface Equipment {
    id: string;
    name: string;
    type: string;
    model: string;
    serialNumber: string;
    manufacturer: string;
    status: EquipmentStatus;
    department: string;
    location: string;
    purchaseDate: Date;
    purchaseCost: number;
    currentValue: number;
    specifications: Record<string, string>;
    maintenanceHistory: MaintenanceRecord[];
    currentAssignment?: Assignment;
    nextMaintenanceDate?: Date;
    nextMaintenanceType?: string;
    lastActivityDate?: Date;
  }

  interface MaintenanceRecord {
    id: string;
    type: string;
    date: Date;
    description: string;
    cost: number;
    performedBy: string;
    nextMaintenanceDate: Date;
  }

  interface Assignment {
    id: string;
    workOrderId: string;
    startDate: Date;
    endDate: Date;
    status: AssignmentStatus;
    assignedTo: string;
  }

  enum EquipmentStatus {
    Available = 'Available',
    InUse = 'InUse',
    Maintenance = 'Maintenance',
    OutOfService = 'OutOfService'
  }

  enum AssignmentStatus {
    Pending = 'Pending',
    Active = 'Active',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
  }
  ```

### Work Order Module
- **Components**:
  - `WorkOrderListComponent`
  - `WorkOrderDetailsComponent`
  - `WorkOrderFormComponent`

- **Services**:
  - `WorkOrderService`
  - `IssueService`
  - `RemarkService`

### HR Module
- **Components**:
  - `EmployeeListComponent`
  - `EmployeeDetailsComponent`
  - `EmployeeFormComponent`

- **Services**:
  - `EmployeeService`
  - `DepartmentService`

### Inventory Module
- **Components**:
  - `MaterialListComponent`
  - `MaterialDetailsComponent`
  - `MaterialFormComponent`

- **Services**:
  - `MaterialService`
  - `InventoryService`

### Finance Module
- **Components**:
  - `InvoiceListComponent`
  - `InvoiceDetailsComponent`
  - `ExpenseFormComponent`

- **Services**:
  - `InvoiceService`
  - `ExpenseService`

## Data Models

### Core Entities

#### Work Order
```typescript
interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  client: Client;
  location: Location;
  assignedTo: Employee[];
  issues: Issue[];
  remarks: Remark[];
  actions: Action[];
  materials: MaterialUsage[];
  photos: Photo[];
  forms: Form[];
  expenses: Expense[];
  invoices: Invoice[];
  manpower: ManpowerAssignment[];
  permits: Permit[];
  equipment: EquipmentAssignment[];
}
```

#### Employee/Manpower
```typescript
interface Employee {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    contactInfo: ContactInfo;
    emergencyContacts: EmergencyContact[];
  };
  employmentInfo: {
    position: string;
    department: string;
    startDate: Date;
    status: EmployeeStatus;
    skills: Skill[];
    certifications: Certification[];
  };
  workInfo: {
    availability: Availability;
    currentAssignments: WorkOrderAssignment[];
    timeTracking: TimeEntry[];
  };
}

interface Manpower {
  employeeId: string;  // References Employee
  currentAssignment: WorkOrderAssignment;
  skills: Skill[];
  availability: Availability;
  utilization: UtilizationMetrics;
}
```

### Relationships

1. **Work Order - Issues (1:N)**
   - One work order can have multiple issues
   - Issues can be linked to specific work order tasks
   - Issues have their own lifecycle and resolution process

2. **Work Order - Remarks (1:N)**
   - One work order can have multiple remarks
   - Remarks can be categorized (technical, general, safety)
   - Remarks can be linked to specific work order items

3. **Work Order - Actions (1:N)**
   - One work order can have multiple actions
   - Actions can have dependencies
   - Actions can be assigned to specific employees

4. **Work Order - Materials (N:M)**
   - Work orders can use multiple materials
   - Materials can be used in multiple work orders
   - Material usage is tracked with quantities and costs

5. **Work Order - Photos (1:N)**
   - One work order can have multiple photos
   - Photos can be categorized (before, during, after)
   - Photos can be linked to specific work order items

6. **Work Order - Forms (1:N)**
   - One work order can have multiple forms
   - Forms can be of different types (inspection, safety, quality)
   - Forms can be linked to specific work order items

7. **Work Order - Expenses (1:N)**
   - One work order can have multiple expenses
   - Expenses can be categorized (material, labor, equipment)
   - Expenses are linked to specific work order items

8. **Work Order - Invoices (1:N)**
   - One work order can have multiple invoices
   - Invoices can be for different purposes (client, vendor)
   - Invoices are linked to specific work order items

9. **Work Order - Manpower (N:M)**
   - Work orders can have multiple employees assigned
   - Employees can be assigned to multiple work orders
   - Assignments include time tracking and role information

10. **Work Order - Permits (1:N)**
    - One work order can have multiple permits
    - Permits have expiration dates and requirements
    - Permits are linked to specific work order items

11. **Work Order - Equipment (N:M)**
    - Work orders can use multiple equipment items
    - Equipment can be used in multiple work orders
    - Equipment usage includes scheduling and maintenance

## State Management

### Core State
```typescript
interface AppState {
  user: User;
  settings: Settings;
  notifications: Notification[];
}
```

### Module States
```typescript
interface ResourcesState {
  equipment: Equipment[];
  maintenance: MaintenanceRecord[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}
```

## API Integration

### REST Endpoints
```typescript
// Work Orders
GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PUT    /api/work-orders/:id
DELETE /api/work-orders/:id

// HR
GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id

// Resources
GET    /api/resources/manpower
GET    /api/resources/equipment
GET    /api/resources/materials

// Equipment
GET    /api/equipment
GET    /api/equipment/{id}/maintenance
GET    /api/equipment/{id}/assignments
```

### WebSocket Events
```typescript
// Real-time updates
'work-order:created'
'work-order:updated'
'work-order:deleted'
'employee:updated'
'resource:updated'
'equipment_status_changed'
'maintenance_scheduled'
'assignment_updated'
```

## Security

### Authentication
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- HTTPS encryption

### Authorization
- Module-level access control
- Feature-level permissions
- Data-level security
- Audit logging

## Performance

### Optimization Strategies
1. **Lazy Loading**
   - Module-based lazy loading
   - Component-level lazy loading
   - Route-based code splitting

2. **Caching**
   - Service worker caching
   - Memory caching
   - Local storage caching

3. **State Management**
   - Efficient state updates
   - Minimal re-renders
   - Optimized data flow

4. **API Optimization**
   - Request batching
   - Response caching
   - Efficient data structures

## Development Guidelines

### Code Style
- Follow Angular Style Guide
- Use TypeScript strict mode
- Implement proper error handling
- Write comprehensive tests

### Best Practices
1. **Component Design**
   - Keep components small and focused
   - Use presentational and container components
   - Implement proper lifecycle management

2. **Service Design**
   - Single responsibility principle
   - Dependency injection
   - Proper error handling

3. **State Management**
   - Use signals for local state
   - Implement proper state updates
   - Handle loading and error states

4. **Testing**
   - Unit tests for components
   - Integration tests for services
   - E2E tests for critical paths

### Deployment
- CI/CD pipeline
- Environment configuration
- Build optimization
- Performance monitoring

## Conclusion

This architecture provides a solid foundation for building a scalable and maintainable application. The modular approach allows for easy extension and modification, while the clear separation of concerns ensures code quality and maintainability. 