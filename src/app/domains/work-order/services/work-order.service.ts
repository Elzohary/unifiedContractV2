import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, Subject } from 'rxjs';
import { map, catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { StateService } from '../../../core/services/state.service';
import { ActivityLogService } from '../../../shared/services/activity-log.service';
import {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderRemark,
  Task,
  WorkOrderIssue,
  materialAssignment
} from '../models/work-order.model';

export interface WorkOrderStatusResponse {
  id: string;
  name: string;
  code: string;
}

interface StatusTransitionHistory {
  id: string;
  workOrderId: string;
  fromStatus: WorkOrderStatus;
  toStatus: WorkOrderStatus;
  changedBy: string;
  changedDate: string;
  reason?: string;
}

interface RemarkData {
  content: string;
  createdBy?: string;
  type?: 'general' | 'technical' | 'safety' | 'quality';
  peopleInvolved?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private endpoint = 'work-orders';
  private statusEndpoint = 'work-order-statuses';
  private statusesCache$ = new BehaviorSubject<WorkOrderStatusResponse[]>([]);

  // Status transition rules
  private readonly allowedStatusTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.Pending]: [WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled],
    [WorkOrderStatus.InProgress]: [WorkOrderStatus.Completed, WorkOrderStatus.OnHold],
    [WorkOrderStatus.OnHold]: [WorkOrderStatus.InProgress, WorkOrderStatus.Cancelled],
    [WorkOrderStatus.Completed]: [WorkOrderStatus.InProgress], // Allow reopening if needed
    [WorkOrderStatus.Cancelled]: [WorkOrderStatus.Pending] // Allow reactivation
    ,

    [WorkOrderStatus.UpdatedAlreadyUDSProblem]: [],
    [WorkOrderStatus.ReadyForCompleteCertificateWithRequirement]: [],
    [WorkOrderStatus.ReadyForUpdatingUDISProblem]: [],
    [WorkOrderStatus.UpdatedAlreadyNeedRTIOnly]: [],
    [WorkOrderStatus.UnderCheckingAndSignatures]: [],
    [WorkOrderStatus.PaidWithVAT]: [],
    [WorkOrderStatus.UpdatedAlreadyRTIAndReceivingInProcess]: [],
    [WorkOrderStatus.NeedDP]: [],
    [WorkOrderStatus.ReadyForCheckingNeedPrepareDocuments]: [],
    [WorkOrderStatus.UpdatedAlreadySecEngForApproval]: [],
    [WorkOrderStatus.WaitingShutdown]: [],
    [WorkOrderStatus.InProgressForPermission]: [],
    [WorkOrderStatus.CancelWorkOrder]: [],
    [WorkOrderStatus.NeedReplacementEquipment]: [],
    [WorkOrderStatus.WaitingFinancial]: [],
    [WorkOrderStatus.ReadyForChecking]: [],
    [WorkOrderStatus.ClosedWithMustakhlasNeed1stApproval]: [],
    [WorkOrderStatus.NeedMustakhlasWithoutRequirements]: [],
    [WorkOrderStatus.UpdatedAlreadyNeedReceivingMaterialsOnly]: [],
    [WorkOrderStatus.CompleteCertificateNeed2ndApproval]: [],
    [WorkOrderStatus.ClosedWithMustakhlasNeed2ndApproval]: [],
    [WorkOrderStatus.MaterialsReceivedNeed155]: [],
    [WorkOrderStatus.ReadyForCompleteCertificateWithoutRequirement]: [],
    [WorkOrderStatus.ClosedWithMustakhlasNeed1stApprovalNeedReturnScSrap]: [],
  };

  private mockWorkOrders: WorkOrder[] = [
    {
      id: 'wo1',
      details: {
        workOrderNumber: 'WO-2024-001',
        internalOrderNumber: 'INT-2024-001',
        title: 'Commercial Building Renovation',
        description: 'Renovation of the 3rd floor office space at Downtown Business Center',
        status: 'in-progress' as WorkOrderStatus,
        priority: 'high' as WorkOrderPriority,
        createdDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date().toISOString(),
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Ras Tanura',
        category: 'Renovation',
        receivedDate: new Date().toISOString(),
        client: 'Saudi Electricity Company',
        completionPercentage: 35,
        createdBy: 'Admin'
      },
      items: [
        {
          id: 'item1',
          itemDetail: {
            id: 'item1',
            itemNumber: '123456',
            lineType: 'Description',
            shortDescription: 'Renovation of the 3rd floor office space at Downtown Business Center',
            longDescription: 'Renovation of the 3rd floor office space at Downtown Business Center',
            UOM: 'm2',
            currency: 'SAR',
            unitPrice: 100,
            paymentType: 'Cash',
            managementArea: 'Ras Tanura'
          },
          estimatedQuantity: 100,
          estimatedPrice: 100000,
          estimatedPriceWithVAT: 115000,
          actualQuantity: 100,
          actualPrice: 100000,
          actualPriceWithVAT: 115000,
          reasonForFinalQuantity: 'Renovation of the 3rd floor office space at Downtown Business Center'
        },
        {
          id: 'item2',
          itemDetail: {
            id: 'item2',
            itemNumber: '342432',
            lineType: 'Description',
            shortDescription: 'Renovation of the 3rd floor office space at Downtown Business Center',
            longDescription: 'Renovation of the 3rd floor office space at Downtown Business Center',
            UOM: 'm2',
            currency: 'SAR',
            unitPrice: 100,
            paymentType: 'Cash',
            managementArea: 'Ras Tanura'
          },
          estimatedQuantity: 100,
          estimatedPrice: 100000,
          estimatedPriceWithVAT: 115000,
          actualQuantity: 100,
          actualPrice: 100000,
          actualPriceWithVAT: 115000,
          reasonForFinalQuantity: 'Renovation of the 3rd floor office space at Downtown Business Center'
        }
      ],
      remarks: [],
      issues: [
        {
          id: 'issue1',
          title: 'Electrical wiring needs inspection',
          description: 'The electrical wiring in the northeast corner of the 3rd floor needs inspection before we can proceed with the renovation.',
          priority: 'high',
          severity: 'high',
          status: 'open',
          reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          reportedBy: 'John Smith',
          assignedTo: 'Mike Johnson'
        },
        {
          id: 'issue2',
          title: 'Material shortage - drywall',
          description: 'We are running low on drywall materials. Need to order additional 50 sheets to complete the project.',
          priority: 'medium',
          severity: 'medium',
          status: 'in-progress',
          reportedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          reportedBy: 'Sarah Davis',
          assignedTo: 'Tom Wilson'
        },
        {
          id: 'issue3',
          title: 'Water damage found behind wall',
          description: 'During demolition, we discovered water damage behind the south wall. This needs to be addressed before continuing.',
          priority: 'high',
          severity: 'high',
          status: 'resolved',
          reportedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          reportedBy: 'Mike Johnson',
          resolutionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          resolutionNotes: 'Water damage has been repaired. Source was a leaking pipe that has been replaced. Area has been dried and treated.'
        }
      ],
      materials: [
        {
          id: 'mat1',
          materialType: 'purchasable',
          purchasableMaterial: {
            id: 'pmat1',
            name: 'Electrical Cable 2.5mm',
            description: 'High-quality copper electrical cable for main wiring',
            quantity: 500,
            unit: 'meters',
            unitCost: 15,
            totalCost: 7500,
            status: 'ordered',
            supplier: 'Saudi Cables Company',
            orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          },
          workOrderNumber: 'wo1',
          assignDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          assignedBy: 'Ahmed Hassan',
          storingLocation: 'Warehouse A - Section 3'
        },
        {
          id: 'mat2',
          materialType: 'purchasable',
          purchasableMaterial: {
            id: 'pmat2',
            name: 'Drywall Sheets',
            description: 'Standard 12mm drywall sheets for interior walls',
            quantity: 100,
            unit: 'sheets',
            unitCost: 45,
            totalCost: 4500,
            status: 'delivered',
            supplier: 'Building Materials Co.',
            orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          workOrderNumber: 'wo1',
          assignDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          assignedBy: 'Mohammed Ali'
        },
        {
          id: 'mat3',
          materialType: 'receivable',
          receivableMaterial: {
            id: 'rmat1',
            name: 'SEC Standard Circuit Breakers',
            description: 'Standard circuit breakers provided by Saudi Electricity Company',
            unit: 'pieces',
            estimatedQuantity: 20,
            receivedQuantity: 15,
            actualQuantity: 0,
            remainingQuantity: 15,
            status: 'received',
            receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            usageRecords: [],
            receivedBy: {
              id: 'mp1',
              badgeNumber: 'B12345',
              name: 'Ali Ahmed',
              hoursAssigned: 8,
              startDate: new Date().toISOString(),
              workOrderNumber: 'wo1'
            }
          },
          workOrderNumber: 'wo1',
          assignDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          assignedBy: 'SEC Representative'
        }
      ],
      permits: [],
      tasks: [
        {
          id: 'task1',
          title: 'Prepare site and materials',
          description: 'Clear the site and gather all required materials for the first phase.',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date().toISOString(),
          priority: 'high',
          status: 'in-progress',
          completed: false,
          workOrderId: 'wo1'
        },
        {
          id: 'task2',
          title: 'Demolition of existing structures',
          description: 'Safely demolish and remove the specified interior walls.',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'pending',
          completed: false,
          workOrderId: 'wo1'
        },
        {
          id: 'task3',
          title: 'Framing and structural work',
          description: 'Complete the framing for the new office layout.',
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'pending',
          completed: false,
          workOrderId: 'wo1'
        }
      ],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 20000,
        labor: 25000,
        other: 5000
      }
    },
    {
      id: 'wo2',
      details: {
        workOrderNumber: 'WO-2024-002',
        internalOrderNumber: 'INT-2024-002',
        description: 'Renovation of the kitchen and bathroom at 456 Elm St.',
        status: 'completed' as WorkOrderStatus,
        priority: 'medium' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Hafr Al batin',
        category: 'Renovation',
        receivedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Homeowner',
        completionPercentage: 100,
        createdBy: 'Homeowner'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 5000,
        labor: 8000,
        other: 2000
      }
    },
    {
      id: 'wo3',
      details: {
        workOrderNumber: 'WO-2024-003',
        internalOrderNumber: 'INT-2024-003',
        title: 'Office Space Renovation',
        status: 'on-hold' as WorkOrderStatus,
        priority: 'high' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Hafr Al batin',
        category: 'Renovation',
        receivedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Acme Corporation',
        completionPercentage: 20,
        createdBy: 'Admin'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 10000,
        labor: 12000,
        other: 3000
      }
    },
    {
      id: 'wo4',
      details: {
        workOrderNumber: 'WO-2024-004',
        internalOrderNumber: 'INT-2024-004',
        status: 'completed' as WorkOrderStatus,
        priority: 'high' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Qarya',
        category: 'Electrical',
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Government Property Services',
        completionPercentage: 100,
        createdBy: 'System Alert'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 10000,
        labor: 12000,
        other: 3000
      }
    },
    {
      id: 'wo5',
      details: {
        workOrderNumber: 'WO-2024-005',
        internalOrderNumber: 'INT-2024-005',
        title: 'Emergency Plumbing Repair',
        description: 'Fix burst pipe in basement at 10 Downing St.',
        status: 'in-progress' as WorkOrderStatus,
        priority: 'high' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Nayriah',
        category: 'Plumbing',
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Government Property Services',
        completionPercentage: 50,
        createdBy: 'System Alert'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 300,
        labor: 800,
        other: 100
      }
    },
    {
      id: 'wo6',
      details: {
        workOrderNumber: 'WO-2024-006',
        internalOrderNumber: 'INT-2024-006',
        title: 'Quarterly Window Cleaning',
        description: 'Clean all exterior windows for the North Tower.',
        status: 'pending' as WorkOrderStatus,
        priority: 'low' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Nayriah',
        category: 'Janitorial',
        receivedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Building Management Inc.',
        completionPercentage: 0,
        createdBy: 'Admin'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 100,
        labor: 2000,
        other: 400
      }
    },
    {
      id: 'wo7',
      details: {
        workOrderNumber: 'WO-2023-999',
        internalOrderNumber: 'INT-2023-999',
        title: 'Server Room AC Unit Replacement',
        description: 'Replace failing AC unit in main server room.',
        status: 'completed' as WorkOrderStatus,
        priority: 'high' as WorkOrderPriority,
        createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString(),
        targetEndDate: new Date(Date.now() - 79 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Hafr Al batin',
        category: 'HVAC',
        receivedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        client: 'Tech Solutions Ltd.',
        completionPercentage: 100,
        createdBy: 'User Three'
      },
      items: [],
      remarks: [],
      issues: [],
      materials: [],
      permits: [],
      tasks: [],
      manpower: [],
      actions: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: [],
      expenseBreakdown: {
        materials: 5000,
        labor: 2500,
        other: 500
      }
    }
  ];
  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>(this.mockWorkOrders);
  workOrders$ = this.workOrdersSubject.asObservable();

  // Add a new subject to notify when a new work order is created
  private newWorkOrderSubject = new Subject<WorkOrder>();
  newWorkOrder$ = this.newWorkOrderSubject.asObservable();

  private simulateNetwork<T>(data: T): Observable<T> {
    return of(data);
  }

  constructor(
    private apiService: ApiService,
    private stateService: StateService,
    private activityLogService: ActivityLogService
  ) {
    this.loadStatuses();
    // Ensure the subject is initialized with the mock data
    if (this.mockWorkOrders && this.mockWorkOrders.length > 0) {
      this.workOrdersSubject.next(this.mockWorkOrders);
    }
  }

  private loadStatuses(): void {
    this.apiService.get<WorkOrderStatusResponse[]>(this.statusEndpoint).pipe(
      map(response => response.data),
      catchError(() => of([]))
    ).subscribe(
      statuses => this.statusesCache$.next(statuses)
    );
  }

  getStatuses(): Observable<WorkOrderStatusResponse[]> {
    if (this.statusesCache$.value.length > 0) {
      return this.statusesCache$.asObservable();
    }

    return this.apiService.get<WorkOrderStatusResponse[]>(this.statusEndpoint).pipe(
      map(response => response.data),
      tap(statuses => this.statusesCache$.next(statuses)),
      catchError(() => of([]))
    );
  }

  isValidStatus(status: string): boolean {
    return Object.values(WorkOrderStatus).includes(status as WorkOrderStatus);
  }

  getStatusDisplayName(status: WorkOrderStatus): string {
    return status.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  canTransitionTo(currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): boolean {
    return this.allowedStatusTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  updateWorkOrderStatus(id: string, newStatus: WorkOrderStatus, reason?: string): Observable<WorkOrder> {
    return this.getWorkOrderById(id).pipe(
      switchMap(workOrder => {
        if (!this.canTransitionTo(workOrder.details.status, newStatus)) {
          return throwError(() => new Error(
            `Invalid status transition from ${this.getStatusDisplayName(workOrder.details.status)} to ${this.getStatusDisplayName(newStatus)}`
          ));
        }

        this.activityLogService.logActivity({
          action: 'update',
          description: `Status changed from ${this.getStatusDisplayName(workOrder.details.status)} to ${this.getStatusDisplayName(newStatus)}${reason ? ` - Reason: ${reason}` : ''}`,
          entityId: id,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrder(id, {
          details: {
            ...workOrder.details,
            status: newStatus
          }
        });
      })
    );
  }

  getStatusHistory(workOrderId: string): Observable<StatusTransitionHistory[]> {
    return this.apiService.get<StatusTransitionHistory[]>(`${this.endpoint}/${workOrderId}/status-history`).pipe(
      map(response => response.data),
      catchError(() => of([]))
    );
  }

  getAllWorkOrders(): Observable<WorkOrder[]> {
    this.stateService.setLoading(true);
    this.stateService.setError(null);

    // Make sure we return a copy of the data to avoid reference issues
    const workOrders = [...this.workOrdersSubject.value];

    // For development, use mock data
    return this.simulateNetwork(workOrders).pipe(
      tap(workOrders => {
        this.stateService.updateWorkOrders(workOrders);
      }),
      catchError(error => {
        this.stateService.setError(error.message);
        return of([]);
      }),
      finalize(() => {
        this.stateService.setLoading(false);
      })
    );
  }

  getWorkOrderById(id: string): Observable<WorkOrder> {
    this.stateService.setLoading(false)
    this.stateService.setError(null);

    const workOrder = this.workOrdersSubject.value.find(wo => wo.id === id);
    if (!workOrder) {
      return throwError(() => new Error(`Work order with ID ${id} not found`));
    }

    return this.simulateNetwork(workOrder).pipe(
      catchError(error => {
        this.stateService.setError(error.message);
        console.log(error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.stateService.setLoading(false);
      })
    );
  }

  createWorkOrder(workOrderData: Partial<WorkOrder>): Observable<WorkOrder> {
    console.log('Creating new work order with data:', workOrderData);

    const newWorkOrder: WorkOrder = {
      id: `wo${this.workOrdersSubject.value.length + 1}`,
      details: {
        workOrderNumber: `WO-${new Date().getFullYear()}-${String(this.workOrdersSubject.value.length + 1).padStart(3, '0')}`,
        internalOrderNumber: `INT-${new Date().getFullYear()}-${String(this.workOrdersSubject.value.length + 1).padStart(3, '0')}`,
        title: workOrderData.details?.title || '',
        description: workOrderData.details?.description || '',
        status: workOrderData.details?.status || 'pending' as WorkOrderStatus,
        priority: workOrderData.details?.priority || 'medium' as WorkOrderPriority,
        createdDate: new Date().toISOString(),
        dueDate: workOrderData.details?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: workOrderData.details?.startDate || new Date().toISOString(),
        targetEndDate: workOrderData.details?.targetEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: workOrderData.details?.location || '',
        category: workOrderData.details?.category || '',
        client: workOrderData.details?.client || '',
        completionPercentage: workOrderData.details?.completionPercentage || 0,
        receivedDate: workOrderData.details?.receivedDate || new Date().toISOString(),
        createdBy: workOrderData.details?.createdBy || 'System'
      },
      items: workOrderData.items || [],
      remarks: workOrderData.remarks || [],
      issues: workOrderData.issues || [],
      materials: workOrderData.materials || [],
      permits: workOrderData.permits || [],
      tasks: workOrderData.tasks || [],
      manpower: workOrderData.manpower || [],
      actions: workOrderData.actions || [],
      photos: workOrderData.photos || [],
      forms: workOrderData.forms || [],
      expenses: workOrderData.expenses || [],
      invoices: workOrderData.invoices || [],
      expenseBreakdown: workOrderData.expenseBreakdown || {
        materials: 0,
        labor: 0,
        other: 0
      }
    };

    const workOrders = [...this.workOrdersSubject.value, newWorkOrder];
    this.workOrdersSubject.next(workOrders);
    this.stateService.updateWorkOrders(workOrders);

    // Emit the new work order
    this.newWorkOrderSubject.next(newWorkOrder);

    return this.simulateNetwork(newWorkOrder);
  }

  updateWorkOrder(id: string, workOrderData: Partial<WorkOrder>): Observable<WorkOrder> {
    console.log(`Updating work order ${id} with data:`, workOrderData);
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === id);

    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${id} not found`));
    }

    const updatedWorkOrder = {
      ...workOrders[workOrderIndex],
      ...workOrderData,
      details: {
        ...workOrders[workOrderIndex].details,
        ...workOrderData.details
      }
    };

    workOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next(workOrders);
    this.stateService.updateWorkOrders(workOrders);

    return this.simulateNetwork(updatedWorkOrder);
  }

  deleteWorkOrder(id: string): Observable<boolean> {
    console.log(`Deleting work order ${id}`);
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === id);

    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${id} not found`));
    }

    workOrders.splice(workOrderIndex, 1);
    this.workOrdersSubject.next(workOrders);
    this.stateService.updateWorkOrders(workOrders);

    return this.simulateNetwork(true);
  }

  updateWorkOrderPriority(id: string, priority: WorkOrderPriority): Observable<WorkOrder> {
    console.log(`Updating work order ${id} priority to ${priority}`);
    return this.getWorkOrderById(id).pipe(
      switchMap(workOrder => {
        return this.updateWorkOrder(id, {
          details: {
            ...workOrder.details,
            priority
          }
        });
      })
    );
  }

  // Remark Management
  addRemarkToWorkOrder(workOrderId: string, remarkData: RemarkData): Observable<WorkOrder> {
    console.log(`Adding remark to work order ${workOrderId}:`, remarkData);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const newRemark: WorkOrderRemark = {
      id: `rem${Date.now()}`,
      content: remarkData.content,
      createdDate: new Date().toISOString(),
      createdBy: remarkData.createdBy || 'System',
      type: remarkData.type || 'general',
      workOrderId: workOrderId,
      peopleInvolved: remarkData.peopleInvolved || []
    };

    const updatedWorkOrder = { ...workOrders[workOrderIndex] };
    updatedWorkOrder.remarks = [...(updatedWorkOrder.remarks || []), newRemark];

    workOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(updatedWorkOrder);
  }

  updateRemark(workOrderId: string, remarkId: string, remarkData: Partial<RemarkData>): Observable<WorkOrder> {
    console.log(`Updating remark ${remarkId} for work order ${workOrderId}:`, remarkData);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const updatedWorkOrder = { ...workOrders[workOrderIndex] };

    if (!updatedWorkOrder.remarks) {
      return throwError(() => new Error(`No remarks found for work order ${workOrderId}`));
    }

    const remarkIndex = updatedWorkOrder.remarks.findIndex(r => r.id === remarkId);
    if (remarkIndex === -1) {
      return throwError(() => new Error(`Remark with ID ${remarkId} not found`));
    }

    updatedWorkOrder.remarks[remarkIndex] = {
      ...updatedWorkOrder.remarks[remarkIndex],
      content: remarkData.content || updatedWorkOrder.remarks[remarkIndex].content,
      type: remarkData.type || updatedWorkOrder.remarks[remarkIndex].type,
      peopleInvolved: remarkData.peopleInvolved || updatedWorkOrder.remarks[remarkIndex].peopleInvolved
    };

    workOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(updatedWorkOrder);
  }

  deleteRemark(workOrderId: string, remarkId: string): Observable<WorkOrder> {
    console.log(`Deleting remark ${remarkId} from work order ${workOrderId}`);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const updatedWorkOrder = { ...workOrders[workOrderIndex] };

    if (!updatedWorkOrder.remarks || !Array.isArray(updatedWorkOrder.remarks)) {
      return throwError(() => new Error(`No remarks found for work order ${workOrderId}`));
    }

    const remarkToDelete = updatedWorkOrder.remarks.find(r => r.id === remarkId);
    if (!remarkToDelete) {
      return throwError(() => new Error(`Remark with ID ${remarkId} not found in work order ${workOrderId}`));
    }

    updatedWorkOrder.remarks = updatedWorkOrder.remarks.filter(r => r.id !== remarkId);

    workOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(updatedWorkOrder);
  }

  // Task Management
  updateWorkOrderTask(workOrderId: string, taskIndex: number, updatedTask: Task): Observable<WorkOrder> {
    console.log(`Updating task at index ${taskIndex} in work order ${workOrderId}:`, updatedTask);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const workOrder = { ...workOrders[workOrderIndex] };

    if (!workOrder.tasks || !Array.isArray(workOrder.tasks)) {
      return throwError(() => new Error(`Tasks array not found in work order ${workOrderId}`));
    }

    if (taskIndex < 0 || taskIndex >= workOrder.tasks.length) {
      return throwError(() => new Error('Invalid task index'));
    }

    // Update the task
    workOrder.tasks[taskIndex] = updatedTask;

    // Update the work order
    workOrders[workOrderIndex] = workOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(workOrder);
  }

  addTaskToWorkOrder(workOrderId: string, taskData: Partial<Task>): Observable<WorkOrder> {
    console.log(`Adding task to work order ${workOrderId}:`, taskData);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const workOrder = { ...workOrders[workOrderIndex] };

    // Initialize tasks array if it doesn't exist
    if (!workOrder.tasks) {
      workOrder.tasks = [];
    }

    // Create new task
    const newTask: Task = {
      id: `task${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: taskData.startDate || new Date().toISOString(),
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      completed: false,
      workOrderId: workOrderId
    };

    // Add the new task
    workOrder.tasks.push(newTask);

    // Update the work order
    workOrders[workOrderIndex] = workOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(workOrder);
  }

  deleteTask(workOrderId: string, taskIndex: number): Observable<WorkOrder> {
    console.log(`Deleting task at index ${taskIndex} from work order ${workOrderId}`);

    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);

    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }

    const workOrder = { ...workOrders[workOrderIndex] };

    if (!workOrder.tasks || !Array.isArray(workOrder.tasks)) {
      return throwError(() => new Error(`Tasks array not found in work order ${workOrderId}`));
    }

    if (taskIndex < 0 || taskIndex >= workOrder.tasks.length) {
      return throwError(() => new Error('Invalid task index'));
    }

    // Remove the task
    workOrder.tasks.splice(taskIndex, 1);

    // Update the work order
    workOrders[workOrderIndex] = workOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(workOrder);
  }

  /**
   * Add an issue to a work order
   */
  addIssue(workOrderId: string, issue: WorkOrderIssue): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const updatedWorkOrder = {
          ...workOrder,
          issues: [...(workOrder.issues || []), issue]
        };

        // Log activity
        this.activityLogService.logActivity({
          action: 'create',
          description: `Issue "${issue.title}" added with ${issue.priority} priority`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        // Update the work order with the new issue
        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error adding issue:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }

  /**
   * Update an issue in a work order
   */
  updateIssue(workOrderId: string, issueId: string, updates: Partial<WorkOrderIssue>): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const issueIndex = workOrder.issues?.findIndex(issue => issue.id === issueId) ?? -1;
        if (issueIndex === -1) {
          return throwError(() => new Error('Issue not found'));
        }

        const updatedIssues = [...(workOrder.issues || [])];
        updatedIssues[issueIndex] = { ...updatedIssues[issueIndex], ...updates };

        const updatedWorkOrder = {
          ...workOrder,
          issues: updatedIssues
        };

        // Log activity
        this.activityLogService.logActivity({
          action: 'update',
          description: `Issue "${updatedIssues[issueIndex].title}" updated`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error updating issue:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }

  /**
   * Delete an issue from a work order
   */
  deleteIssue(workOrderId: string, issueId: string): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const issueToDelete = workOrder.issues?.find(issue => issue.id === issueId);
        if (!issueToDelete) {
          return throwError(() => new Error('Issue not found'));
        }

        const updatedWorkOrder = {
          ...workOrder,
          issues: workOrder.issues?.filter(issue => issue.id !== issueId) || []
        };

        // Log activity
        this.activityLogService.logActivity({
          action: 'delete',
          description: `Issue "${issueToDelete.title}" deleted`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error deleting issue:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }

  /**
   * Helper method to update work order in memory
   */
  private updateWorkOrderInMemory(id: string, workOrderData: Partial<WorkOrder>): Observable<WorkOrder> {
    const currentWorkOrders = this.workOrdersSubject.value;
    const index = currentWorkOrders.findIndex(wo => wo.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Work order not found'));
    }

    const updatedWorkOrder = { ...currentWorkOrders[index], ...workOrderData };
    const updatedWorkOrders = [...currentWorkOrders];
    updatedWorkOrders[index] = updatedWorkOrder;
    
    this.workOrdersSubject.next(updatedWorkOrders);
    return of(updatedWorkOrder);
  }

  /**
   * Assign a material to a work order
   */
  assignMaterial(workOrderId: string, material: materialAssignment): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const updatedWorkOrder = {
          ...workOrder,
          materials: [...(workOrder.materials || []), material]
        };

        // Log activity
        const materialName = material.purchasableMaterial?.name || material.receivableMaterial?.name || 'Unknown';
        this.activityLogService.logActivity({
          action: 'create',
          description: `Material "${materialName}" assigned to work order`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error assigning material:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }

  /**
   * Update material assignment in a work order
   */
  updateMaterialAssignment(workOrderId: string, assignmentId: string, updates: Partial<materialAssignment>): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const materialIndex = workOrder.materials?.findIndex(m => m.id === assignmentId) ?? -1;
        if (materialIndex === -1) {
          return throwError(() => new Error('Material assignment not found'));
        }

        const updatedMaterials = [...(workOrder.materials || [])];
        updatedMaterials[materialIndex] = { ...updatedMaterials[materialIndex], ...updates };

        const updatedWorkOrder = {
          ...workOrder,
          materials: updatedMaterials
        };

        // Log activity
        const materialName = updatedMaterials[materialIndex].purchasableMaterial?.name || 
                           updatedMaterials[materialIndex].receivableMaterial?.name || 'Unknown';
        this.activityLogService.logActivity({
          action: 'update',
          description: `Material assignment "${materialName}" updated`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error updating material assignment:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }

  /**
   * Remove material assignment from a work order
   */
  removeMaterialAssignment(workOrderId: string, assignmentId: string): Observable<boolean> {
    return this.getWorkOrderById(workOrderId).pipe(
      switchMap(workOrder => {
        if (!workOrder) {
          return throwError(() => new Error('Work order not found'));
        }

        const materialToRemove = workOrder.materials?.find(m => m.id === assignmentId);
        if (!materialToRemove) {
          return throwError(() => new Error('Material assignment not found'));
        }

        const updatedWorkOrder = {
          ...workOrder,
          materials: workOrder.materials?.filter(m => m.id !== assignmentId) || []
        };

        // Log activity
        const materialName = materialToRemove.purchasableMaterial?.name || 
                           materialToRemove.receivableMaterial?.name || 'Unknown';
        this.activityLogService.logActivity({
          action: 'delete',
          description: `Material assignment "${materialName}" removed`,
          entityId: workOrderId,
          entityType: 'workOrder',
          userId: 'system',
          userName: 'System',
          systemGenerated: true
        });

        return this.updateWorkOrderInMemory(workOrderId, updatedWorkOrder).pipe(
          map(() => true),
          catchError(error => {
            console.error('Error removing material assignment:', error);
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Error finding work order:', error);
        return of(false);
      })
    );
  }
}
