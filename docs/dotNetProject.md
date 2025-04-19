1.  Database Configuration: SQL Server

2.  API Authentication:

    - JWT authentication.
    - roles/permissions to implement: 'administrator' | 'engineer' | 'foreman' | 'worker' | 'client' | 'coordinator' and in the beginning every one has all permissions but later will be updated
    - login page
    - there's no registration page, new users are created by the system admin. // keep the admin module for later.

3.  Specific Business Requirements:

    -
  // Modules: Work Order, Resources Managment, HR, Authentacation, User Managment
4.  Create Domain Models for: - 
            
          1. Work Order with all related entities: 

            - Work Order full properties:

              export interface WorkOrder {
                id: string;
                details: workOrderDetail;
                estimatedCost: number;  // Total amount of the Work Order "items"'s estimatedPrice
                remarks: WorkOrderRemark[];
                engineerInCharge?: {
                  id: string;
                  name: string;
                };
                actionsNeeded?: ActionNeeded[];
                issues: WorkOrderIssue[];
                materials?: materialAssignment[];
                permits?: Permit[];
                tasks?: Task[];
                manpower?: ManpowerAssignment[];
                actions?: WorkOrderAction[];
                photos?: WorkOrderPhoto[];
                forms?: WorkOrderForm[];
                expenses?: WorkOrderExpense[];
                invoices?: WorkOrderInvoice[];
                expenseBreakdown?: {
                  materials: number;
                  labor: number;
                  other: number;
                };
              }
            
            - Details
              // Each work order has its main details:

              export interface workOrderDetail {
                workOrderNumber: string;
                internalOrderNumber: string;
                title: string;
                description: string;
                client: string;
                location: string;
                status: string;
                priority: string;
                category: string;
                completionPercentage: number;
                receivedDate: string | Date;
                startDate: string | Date;
                dueDate: string | Date;
                targetEndDate?: string | Date;
                createdDate: string | Date;
                createdBy: string;
                lastUpdated?: string | Date;
              }


            - Tasks

            - Items
              // ("Items" are list of items each one describes an activity has been done at the site)
              
              workOrderItem {
                id: string;
                itemNumber: string;
                description: string;
                unit: string;
                unitPrice: number;
                estimatedQuantity: number;
                estimatedPrice: number;
                estimatedPriceWithVAT: number;
                actualQuantity: number;
                actualPrice: number;
                actualPriceWithVAT: number;
                reasonForFinalQuantity: string;
              }

            - Material
              // each material (materials are 2 types) is assigned to one work order. if it receivable so it means that it has no cost on us and we will receive it from the client. but if it purchasable so that's means that we will purchase it and it has cost will be added to the work order cost in the expenses.

            - Expensses
              // expenses is calculated for each work order depending on:
                1. number of days * the daily cost of each person / equipment assigned to the work order
                2. plus the cost of the material has been purchased for the work order.
              // It should be a seperate Module to manage all work orders Expenses and the functions that will be added later.

                WorkOrderExpense {
                  id: string;
                  description: string;
                  amount: number;
                  currency: string;
                  category: string;
                  date: string;
                  submittedBy: string;
                  status: 'pending' | 'approved' | 'rejected';
                  approvedBy?: string;
                  approvedDate?: string;
                  receipt?: string;
                }

            - Permits
              // each work order has a list of permits which issued in order to do the site works. typically the permit will be uploaded as a pdf of photo.

              Permit {
                id: string;
                type: string; // e.g., 'Municipality', 'Electrical', 'Plumbing', etc.
                title: string;
                description: string;
                number: string;
                issueDate: Date;
                expiryDate: Date;
                status: 'pending' | 'approved' | 'rejected' | 'expired';
                issuedBy: string;
                authority: string;
                documentRef: string;
                attachments?: Attachment[];
              }

            - Remarks
              // any one who has access to the work order can add a remark and assign (or mention people in it).

              WorkOrderRemark {
                id: string;
                content: string;
                createdDate: string;
                createdBy: string;
                type: 'general' | 'technical' | 'safety' | 'quality' | string;
                workOrderId: string;
                peopleInvolved?: string[]; // IDs of people involved who should be notified
              }


            - Issues
              // as same as the remarks; any one who has access to the work order can add a remark and assign (or mention people in it).

              Issue {
                id: string;
                title: string;
                description: string;
                priority: 'low' | 'medium' | 'high' | 'critical';
                status: 'open' | 'in-progress' | 'resolved' | 'closed';
                createdBy: User;
                createdDate: Date;
                assignedTo?: User;
                resolutionDate?: Date;
                resolutionNotes?: string;
                attachments?: Attachment[];
              }


            // Resources: Manpower, Equipment and Material (it should be a seperate modules (Material Managment, Equipment Managment, Manpower Managment)). Please note that every manpower is an employee and his full data will come from the HR Module

            - ManpowerAssignment
              // Every Employee can be assigned to a work order for a period of time.
              // (it's a list of all the people assigned to the work order, it's important to track all the people assigned to this work order and knowing the number of days they worked on this work order will be included in the expenses calculation).

              ManpowerAssignment {
                id: string;
                badgeNumber: string;
                name: string;
                userId?: string;
                role?: string;
                hoursAssigned: number;
                startDate: string;
                endDate?: string;
                notes?: string;
                workOrderNumber: string;
              }

            
            - EquipmentAssignment
              // Every Equipment can be assigned to a work order for a period of time.
              // (it's a list of all the Equipment assigned to the work order, it's important to track all the Equipment assigned to this work order and knowing the number of days they worked on this work order will be included in the expenses calculation).

              equipmentAssignment {
                id: string;
                companyNumber: string;
                type: string;
                operatorBadgeNumber?: string;

                hoursAssigned: number;
                startDate: Date;
                endDate?: string;
                notes?: string;
                workOrderNumber: string;
              }
          
            - Material
              // Materials are 2 types (Receivable and Purchasable) and each piece of material can be allocated to a work order or unallocated and placed in the warehouse.
              
              materialAssignment {
                id: string;
                materialType: 'purchasable' | 'receivable';
                purchasableMaterial?: purchasableMaterial;
                receivableMaterial?: receivableMaterial;
                workOrderNumber?: string;
                assignDate: string | Date;
                assignedBy: string;
                storingLocation?: string;
              }

              purchasableMaterial {
                id: string;
                name: string;
                description?: string;
                quantity: number;
                unit: string;
                unitCost?: number;
                totalCost?: number;
                status: string;
                supplier?: string;
                orderDate?: string | Date;
                deliveryDate?: string | Date;
              }

              receivableMaterial {
                id: string;
                name: string;
                description?: string;
                unit: string;
                estimatedQuantity: number;
                receivedQuantity?: number;
                actualQuantity?: number;
                remainingQuantity?: number;
                returnedQuantity?: number;
                status: 'pending' | 'ordered' | 'received' | 'used';
                receivedDate?: string;
                returnedDate?: string;
                receivedBy?: ManpowerAssignment;
                returnedBy?: ManpowerAssignment;
              }

            - Shared models:

              Attachment {
                id: string;
                fileName: string;
                fileType: string;
                fileSize: number;
                uploadDate: Date;
                uploadedBy: User;
                url: string;
              }

              WorkOrderPhoto {
                id: string;
                url: string;
                caption: string;
                uploadedDate: string;
                uploadedBy: string;
                type: 'before' | 'during' | 'after' | 'issue';
              }


5. Technical Preferences:
  - Latest stable .net web API version.
  - Scalar.
  - Entity Framework Core.
  - FluentValidation.
  - SQL Server.
  - Serilog for logging.
  - Moq for mocking.
  - SignalR.
  - AutoMapper.
  - JWT authentication.
  - 
  - Repository Pattern & Unit of Work.
  - DTO Layer.
  - Business Logic layer.
  - Activity Tracking Log Layer.
  - Validators.
  - CRUD operations.
  - Chacing mechanism should be implemented later (it's important).


  ---------------

  Looking at the dotNetProject.md file, I notice the following modules are specified:

1. **Main Modules**:
   - Work Order Module
   - Resources Management Module
   - HR Module
   - Authentication Module
   - User Management Module

2. **Sub-Modules under Resources Management**:
   - Material Management
   - Equipment Management
   - Manpower Management

Let me revise the architecture to better reflect these modules:

```
backend/
├── src/
│   ├── UnifiedContract.API/
│   │   ├── HR/
│   │   │   ├── Employees/
│   │   │   │   ├── EmployeeController.cs
│   │   │   │   ├── EmployeeDocumentController.cs
│   │   │   │   ├── LeaveController.cs
│   │   │   │   ├── PerformanceReviewController.cs
│   │   │   │   ├── TrainingController.cs
│   │   │   │   └── SalaryController.cs
│   │   │   └── Departments/
│   │   │       └── DepartmentController.cs
│   │
│   ├── UnifiedContract.Application/
│   │   ├── HR/
│   │   │   ├── Employees/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateEmployee/
│   │   │   │   │   ├── UpdateEmployee/
│   │   │   │   │   ├── DeleteEmployee/
│   │   │   │   │   ├── AssignLeave/
│   │   │   │   │   ├── AddPerformanceReview/
│   │   │   │   │   └── UpdateSalary/
│   │   │   │   └── Queries/
│   │   │   │       ├── GetEmployee/
│   │   │   │       ├── GetEmployeeDocuments/
│   │   │   │       ├── GetEmployeeLeaves/
│   │   │   │       └── GetEmployeePerformance/
│   │   │   └── Departments/
│   │
│   ├── UnifiedContract.Domain/
│   │   ├── HR/
│   │   │   ├── Entities/
│   │   │   │   ├── Employee.cs
│   │   │   │   ├── Certification.cs
│   │   │   │   ├── EmergencyContact.cs
│   │   │   │   ├── Address.cs
│   │   │   │   ├── EmployeeDocument.cs
│   │   │   │   ├── Leave.cs
│   │   │   │   ├── PerformanceReview.cs
│   │   │   │   ├── Training.cs
│   │   │   │   ├── Salary.cs
│   │   │   │   ├── BankDetails.cs
│   │   │   │   ├── Allowance.cs
│   │   │   │   └── Deduction.cs
│   │   │   ├── Enums/
│   │   │   │   ├── EmployeeRole.cs
│   │   │   │   ├── EmployeeStatus.cs
│   │   │   │   ├── DocumentType.cs
│   │   │   │   ├── LeaveType.cs
│   │   │   │   ├── LeaveStatus.cs
│   │   │   │   ├── TrainingStatus.cs
│   │   │   │   └── PaymentFrequency.cs
│   │   │   └── Interfaces/
│   │
│   ├── UnifiedContract.Infrastructure/
│   │   ├── HR/
│   │   │   ├── Repositories/
│   │   │   │   ├── EmployeeRepository.cs
│   │   │   │   ├── LeaveRepository.cs
│   │   │   │   └── PerformanceReviewRepository.cs
│   │   │   └── Services/
│   │
│   └── UnifiedContract.Persistence/
│       └── Configurations/
│           └── HR/
│               ├── EmployeeConfiguration.cs
│               ├── LeaveConfiguration.cs
│               └── PerformanceReviewConfiguration.cs

Key Implementation Details for Each Module:

1. **Work Order Module**:
   - Work Order CRUD operations
   - Tasks management
   - Items (activities) tracking
   - Expenses tracking
   - Permits management
   - Remarks system
   - Issues tracking
   - Photos and attachments
   - Forms management
   - Invoices handling

2. **Resources Management Module**:
   - Material Management:
     - Receivable materials
     - Purchasable materials
     - Inventory tracking
     - Material assignments
   
   - Equipment Management:
     - Equipment tracking
     - Equipment assignments
     - Maintenance records
   
   - Manpower Management:
     - Employee assignments
     - Time tracking
     - Role management

3. **HR Module**:
   - Employee management
   - Role management
   - Department management
   - Attendance tracking
   - Performance management

4. **Authentication Module**:
   - JWT implementation
   - Role-based access control
   - Login/logout functionality
   - Token management

5. **User Management Module**:
   - User CRUD operations (admin only)
   - Role assignments
   - Permission management
   - User profile management

Each module will have:
- Its own domain models
- Application services
- Repository implementations
- API controllers
- DTOs
- Validators
- Unit tests

Would you like me to proceed with creating this structure and implementing the initial setup? I'll start with:

1. Creating the solution and projects
2. Setting up the core domain models for each module
3. Implementing the database context with proper relationships
4. Setting up authentication and authorization
5. Creating the basic API structure for each module

Please let me know if you want me to proceed or if you'd like to make any adjustments to the proposed architecture based on the modules.


