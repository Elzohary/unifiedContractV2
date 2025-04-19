1.  Database Configuration: SQL Server

2.  API Authentication:

    - JWT authentication.
    - roles/permissions to implement: 'administrator' | 'engineer' | 'foreman' | 'worker' | 'client' | 'coordinator' and in the beginning every one has all permissions but later will be updated
    - login page
    - there's no registration page, new users are created by the system admin. // keep the admin module for later.

3.  Specific Business Requirements:

    -

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
  - Repository Pattern & Unit of Work.
  - Chacing mechanism should be implemented later (it's important).

