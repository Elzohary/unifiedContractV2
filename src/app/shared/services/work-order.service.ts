import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, from, timer } from 'rxjs';
import { map, catchError, switchMap, delay, mergeMap, tap } from 'rxjs/operators';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, WorkOrderRemark, WorkOrderIssue, Task } from '../models/work-order.model';
import { ActivityLogService } from './activity-log.service';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {
  private mockWorkOrders: WorkOrder[] = [
    {
      id: 'wo1',
      orderNumber: 'WO-2024-001',
      title: 'Commercial Building Renovation',
      description: 'Renovation of the 3rd floor office space at Downtown Business Center',
      status: 'in-progress' as WorkOrderStatus,
      priority: 'high' as WorkOrderPriority,
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date().toISOString(),
      targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['user1', 'user2'],
      location: {
        address: '123 Business Street, Downtown Business Center'
      },
      category: 'Renovation',
      department: 'Facilities',
      client: {
        name: 'Acme Corporation',
        contactPerson: 'John Doe',
        contactEmail: 'john.doe@acme.com',
        contactPhone: '+1-555-0123'
      },
      engineerInCharge: {
        id: 'eng1',
        name: 'Jane Smith'
      },
      estimatedCost: 50000,
      completionPercentage: 35,
      createdBy: 'Admin',
      tasks: [],
      manpower: [],
      notes: [],
      issues: [],
      materials: [],
      remarks: [],
      actions: [],
      actionsNeeded: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: []
    },
    {
      id: 'wo2',
      orderNumber: 'WO-2024-002',
      title: 'Electrical System Upgrade',
      description: 'Upgrade of electrical panel and wiring in the main office building',
      status: 'pending' as WorkOrderStatus,
      priority: 'urgent' as WorkOrderPriority,
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['user3'],
      location: {
        address: '456 Main Avenue, Tech Park'
      },
      category: 'Electrical',
      department: 'Facilities',
      client: {
        name: 'TechCorp Solutions',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.j@techcorp.com',
        contactPhone: '+1-555-4567'
      },
      engineerInCharge: {
        id: 'eng2',
        name: 'Robert Chen'
      },
      estimatedCost: 25000,
      completionPercentage: 0,
      createdBy: 'Admin',
      tasks: [],
      manpower: [],
      notes: [],
      issues: [],
      materials: [],
      remarks: [],
      actions: [],
      actionsNeeded: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: []
    },
    {
      id: 'wo3',
      orderNumber: 'WO-2024-003',
      title: 'HVAC Maintenance',
      description: 'Quarterly maintenance of HVAC systems in all floors',
      status: 'completed' as WorkOrderStatus,
      priority: 'medium' as WorkOrderPriority,
      createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['user4', 'user5'],
      location: {
        address: '789 Corporate Blvd, Business Park'
      },
      category: 'HVAC',
      department: 'Maintenance',
      client: {
        name: 'Global Enterprises',
        contactPerson: 'Michael Wong',
        contactEmail: 'm.wong@global.com',
        contactPhone: '+1-555-7890'
      },
      engineerInCharge: {
        id: 'eng3',
        name: 'Lisa Turner'
      },
      estimatedCost: 12000,
      completionPercentage: 100,
      createdBy: 'Admin',
      tasks: [],
      manpower: [],
      notes: [],
      issues: [],
      materials: [],
      remarks: [],
      actions: [],
      actionsNeeded: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: []
    },
    {
      id: 'wo4',
      orderNumber: 'WO-2024-004',
      title: 'Plumbing Repair',
      description: 'Emergency repair of leaking pipe in server room',
      status: 'in-progress' as WorkOrderStatus,
      priority: 'urgent' as WorkOrderPriority,
      createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['user6'],
      location: {
        address: '101 Tech Avenue, Data Center'
      },
      category: 'Plumbing',
      department: 'Emergency',
      client: {
        name: 'DataHost Inc',
        contactPerson: 'Alex Rivera',
        contactEmail: 'alex@datahost.com',
        contactPhone: '+1-555-1234'
      },
      engineerInCharge: {
        id: 'eng4',
        name: 'David Park'
      },
      estimatedCost: 8000,
      completionPercentage: 75,
      createdBy: 'Admin',
      tasks: [],
      manpower: [],
      notes: [],
      issues: [],
      materials: [],
      remarks: [],
      actions: [],
      actionsNeeded: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: []
    },
    {
      id: 'wo5',
      orderNumber: 'WO-2024-005',
      title: 'Landscaping Project',
      description: 'Redesign and installation of garden area at main entrance',
      status: 'pending' as WorkOrderStatus,
      priority: 'low' as WorkOrderPriority,
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      targetEndDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['user7', 'user8'],
      location: {
        address: '222 Corporate Drive, Headquarters'
      },
      category: 'Landscaping',
      department: 'Facilities',
      client: {
        name: 'Corporate Holdings Ltd',
        contactPerson: 'Emily Chen',
        contactEmail: 'e.chen@corp.com',
        contactPhone: '+1-555-5555'
      },
      engineerInCharge: {
        id: 'eng5',
        name: 'James Wilson'
      },
      estimatedCost: 30000,
      completionPercentage: 0,
      createdBy: 'Admin',
      tasks: [],
      manpower: [],
      notes: [],
      issues: [],
      materials: [],
      remarks: [],
      actions: [],
      actionsNeeded: [],
      photos: [],
      forms: [],
      expenses: [],
      invoices: []
    }
  ];

  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>(this.mockWorkOrders);
  workOrders$ = this.workOrdersSubject.asObservable();
  
  // Simulation settings
  private networkDelay = 0; // Set to 0 to remove artificial delay
  private shouldSimulateError = false; // Set to true to simulate errors
  private errorRate = 0.1; // 10% chance of error
  
  constructor(private activityLogService: ActivityLogService) {
    console.log('WorkOrderService initialized with mock data:', this.mockWorkOrders);
  }

  // Utility function to simulate network delay and possible errors
  private simulateNetwork<T>(data: T): Observable<T> {
    // Simulate random network errors
    if (this.shouldSimulateError && Math.random() < this.errorRate) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error('Network error - simulated failure')))
      );
    }
    
    // If network delay is 0, don't use delay operator
    if (this.networkDelay === 0) {
      return of(data);
    }
    
    // Simulate network delay
    return of(data).pipe(delay(this.networkDelay));
  }

  // Get all work orders
  getWorkOrders(): Observable<WorkOrder[]> {
    console.log('Fetching all work orders');
    return this.simulateNetwork(this.workOrdersSubject.value).pipe(
      catchError(error => {
        console.error('Error fetching work orders:', error);
        return throwError(() => new Error('Failed to fetch work orders'));
      })
    );
  }

  // Get work orders by status
  getWorkOrdersByStatus(status: WorkOrderStatus): Observable<WorkOrder[]> {
    console.log(`Fetching work orders with status: ${status}`);
    const filteredOrders = this.mockWorkOrders.filter(wo => wo.status === status);
    return this.simulateNetwork(filteredOrders).pipe(
      catchError(error => {
        console.error(`Error fetching work orders with status ${status}:`, error);
        return throwError(() => new Error(`Failed to fetch work orders with status ${status}`));
      })
    );
  }

  // Get work order details by ID
  getWorkOrderById(id: string): Observable<WorkOrder> {
    console.log(`Fetching work order with ID: ${id}`);
    const workOrder = this.mockWorkOrders.find(wo => wo.id === id);
    
    if (!workOrder) {
      console.warn(`Work order with ID ${id} not found`);
      return throwError(() => new Error(`Work order with ID ${id} not found`));
    }
    
    return this.simulateNetwork(workOrder).pipe(
      catchError(error => {
        console.error(`Error fetching work order with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to fetch work order with ID ${id}`));
      })
    );
  }
  
  // Helper method to validate if a string is a valid work order ID
  isValidWorkOrderId(id: string): boolean {
    return this.mockWorkOrders.some(wo => wo.id === id);
  }

  updateWorkOrderStatus(id: string, status: WorkOrderStatus): Observable<WorkOrder> {
    console.log(`Updating work order ${id} status to: ${status}`);
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === id);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${id} not found`)))
      );
    }

    const updatedWorkOrder = {
      ...workOrders[workOrderIndex],
      status
    };

    workOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next(workOrders);

    return this.simulateNetwork(updatedWorkOrder).pipe(
      catchError(error => {
        console.error(`Error updating work order status for ID ${id}:`, error);
        return throwError(() => new Error(`Failed to update work order status for ID ${id}`));
      })
    );
  }

  // Add a new work order
  addWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    console.log('Adding new work order:', workOrder);
    if (!workOrder.id) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error('Work order ID is required')))
      );
    }

    const existingWorkOrder = this.workOrdersSubject.value.find(wo => wo.id === workOrder.id);
    if (existingWorkOrder) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${workOrder.id} already exists`)))
      );
    }

    try {
      const updatedWorkOrders = [...this.workOrdersSubject.value, workOrder];
      this.workOrdersSubject.next(updatedWorkOrders);
      return this.simulateNetwork(workOrder);
    } catch (error) {
      console.error('Error adding work order:', error);
      return throwError(() => new Error('Failed to add work order'));
    }
  }

  // Create a new work order
  createWorkOrder(workOrderData: Partial<WorkOrder>): Observable<WorkOrder> {
    console.log('Creating new work order with data:', workOrderData);
    try {
      const newWorkOrder: WorkOrder = {
        id: `wo${this.workOrdersSubject.value.length + 1}`,
        orderNumber: `WO-${new Date().getFullYear()}-${String(this.workOrdersSubject.value.length + 1).padStart(3, '0')}`,
        title: workOrderData.title || '',
        description: workOrderData.description || '',
        status: workOrderData.status || 'pending',
        priority: workOrderData.priority || 'medium',
        createdDate: new Date().toISOString(),
        dueDate: workOrderData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: workOrderData.startDate || new Date().toISOString(),
        targetEndDate: workOrderData.targetEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: workOrderData.assignedTo || [],
        location: workOrderData.location || { address: '' },
        category: workOrderData.category || '',
        department: workOrderData.department || '',
        client: workOrderData.client || {
          name: '',
          contactPerson: '',
          contactEmail: '',
          contactPhone: ''
        },
        engineerInCharge: workOrderData.engineerInCharge ? { 
          id: workOrderData.engineerInCharge.id || 'eng-default', 
          name: workOrderData.engineerInCharge.name || 'Unassigned' 
        } : { 
          id: 'eng-default', 
          name: 'Unassigned' 
        },
        estimatedCost: workOrderData.estimatedCost || 0,
        completionPercentage: workOrderData.completionPercentage || 0,
        createdBy: workOrderData.createdBy || 'System',
        tasks: workOrderData.tasks || [],
        manpower: workOrderData.manpower || [],
        notes: workOrderData.notes || [],
        issues: workOrderData.issues || [],
        materials: workOrderData.materials || [],
        remarks: workOrderData.remarks || [],
        actions: workOrderData.actions || [],
        actionsNeeded: workOrderData.actionsNeeded || [],
        photos: workOrderData.photos || [],
        forms: workOrderData.forms || [],
        expenses: workOrderData.expenses || [],
        invoices: workOrderData.invoices || []
      };

      const workOrders = [...this.workOrdersSubject.value, newWorkOrder];
      this.workOrdersSubject.next(workOrders);

      return this.simulateNetwork(newWorkOrder);
    } catch (error) {
      console.error('Error creating work order:', error);
      return throwError(() => new Error('Failed to create work order'));
    }
  }

  // Update an existing work order
  updateWorkOrder(id: string, workOrderData: Partial<WorkOrder>): Observable<WorkOrder> {
    console.log(`Updating work order ${id} with data:`, workOrderData);
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === id);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${id} not found`)))
      );
    }

    try {
      const updatedWorkOrder = {
        ...workOrders[workOrderIndex],
        ...workOrderData
      };

      workOrders[workOrderIndex] = updatedWorkOrder;
      this.workOrdersSubject.next(workOrders);

      return this.simulateNetwork(updatedWorkOrder);
    } catch (error) {
      console.error(`Error updating work order with ID ${id}:`, error);
      return throwError(() => new Error(`Failed to update work order with ID ${id}`));
    }
  }

  // Delete a work order
  deleteWorkOrder(id: string): Observable<boolean> {
    console.log(`Deleting work order with ID: ${id}`);
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === id);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${id} not found`)))
      );
    }

    try {
      workOrders.splice(workOrderIndex, 1);
      this.workOrdersSubject.next(workOrders);
      return this.simulateNetwork(true);
    } catch (error) {
      console.error(`Error deleting work order with ID ${id}:`, error);
      return throwError(() => new Error(`Failed to delete work order with ID ${id}`));
    }
  }

  // --- Remark Methods ---
  
  // Add a remark to a work order
  addRemarkToWorkOrder(workOrderId: string, remarkData: any): Observable<WorkOrder> {
    console.log(`Adding remark to work order ${workOrderId}:`, remarkData);
    
    // Find the work order
    const workOrderIndex = this.mockWorkOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }
    
    // Create a new remark with generated ID
    const remarkId = `remark-${Date.now()}`; // Generate a unique ID
    const newRemark = {
      id: remarkId,
      workOrderId: workOrderId,
      content: remarkData.content,
      type: remarkData.type,
      createdDate: new Date().toISOString(),
      createdBy: remarkData.createdBy || 'System User',
      peopleInvolved: remarkData.peopleInvolved || []
    };
    
    // Clone the work order and add the new remark
    const updatedWorkOrder = { ...this.mockWorkOrders[workOrderIndex] };
    
    // Initialize remarks array if it doesn't exist
    if (!updatedWorkOrder.remarks) {
      updatedWorkOrder.remarks = [];
    }
    
    updatedWorkOrder.remarks = [...updatedWorkOrder.remarks, newRemark];
    
    // Update the mock data
    this.mockWorkOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next([...this.mockWorkOrders]);
    
    // Log the activity
    return this.activityLogService.logRemarkCreation(
      remarkId,
      workOrderId,
      newRemark.type,
      remarkData.userId || 'system',
      remarkData.createdBy || 'System User'
    ).pipe(
      switchMap(() => this.simulateNetwork(updatedWorkOrder)),
      catchError(error => {
        console.error('Error adding remark:', error);
        return throwError(() => new Error('Failed to add remark'));
      })
    );
  }
  
  // Update an existing remark
  updateRemark(workOrderId: string, remarkId: string, remarkData: any): Observable<WorkOrder> {
    console.log(`Updating remark ${remarkId} for work order ${workOrderId}:`, remarkData);
    
    // Find the work order
    const workOrderIndex = this.mockWorkOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }
    
    // Clone the work order
    const updatedWorkOrder = { ...this.mockWorkOrders[workOrderIndex] };
    
    // Find the remark index
    if (!updatedWorkOrder.remarks) {
      return throwError(() => new Error(`No remarks found for work order ${workOrderId}`));
    }
    
    const remarkIndex = updatedWorkOrder.remarks.findIndex(r => r.id === remarkId);
    if (remarkIndex === -1) {
      return throwError(() => new Error(`Remark with ID ${remarkId} not found`));
    }
    
    // Get the remark type for activity logging
    const remarkType = remarkData.type || updatedWorkOrder.remarks[remarkIndex].type;
    
    // Update the remark
    updatedWorkOrder.remarks[remarkIndex] = {
      ...updatedWorkOrder.remarks[remarkIndex],
      content: remarkData.content,
      type: remarkType,
      peopleInvolved: remarkData.peopleInvolved || []
    };
    
    // Update the mock data
    this.mockWorkOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next([...this.mockWorkOrders]);
    
    // Log the activity
    return this.activityLogService.logRemarkUpdate(
      remarkId,
      workOrderId,
      remarkType,
      remarkData.userId || 'system',
      remarkData.updatedBy || 'System User'
    ).pipe(
      switchMap(() => this.simulateNetwork(updatedWorkOrder)),
      catchError(error => {
        console.error('Error updating remark:', error);
        return throwError(() => new Error('Failed to update remark'));
      })
    );
  }
  
  // Delete a remark
  deleteRemark(workOrderId: string, remarkId: string): Observable<WorkOrder> {
    console.log(`Deleting remark ${remarkId} from work order ${workOrderId}`);
    
    // First check if the work order exists
    const workOrderIndex = this.mockWorkOrders.findIndex(wo => wo.id === workOrderId);
    if (workOrderIndex === -1) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }
    
    // Clone the work order
    const updatedWorkOrder = { ...this.mockWorkOrders[workOrderIndex] };
    
    // Check if remarks array exists
    if (!updatedWorkOrder.remarks || !Array.isArray(updatedWorkOrder.remarks)) {
      return throwError(() => new Error(`No remarks found for work order ${workOrderId}`));
    }
    
    // Find the remark to get its type for activity logging
    const remarkToDelete = updatedWorkOrder.remarks.find(r => r.id === remarkId);
    if (!remarkToDelete) {
      return throwError(() => new Error(`Remark with ID ${remarkId} not found in work order ${workOrderId}`));
    }
    
    // Store original remarks for potential rollback
    const originalRemarks = [...updatedWorkOrder.remarks];
    
    // Filter out the remark to delete
    updatedWorkOrder.remarks = updatedWorkOrder.remarks.filter(r => r.id !== remarkId);
    
    // Update the mock data
    this.mockWorkOrders[workOrderIndex] = updatedWorkOrder;
    this.workOrdersSubject.next([...this.mockWorkOrders]);
    
    // Log the activity
    return this.activityLogService.logRemarkDeletion(
      remarkId,
      workOrderId,
      remarkToDelete.type,
      'system', // In a real app, pass the current user ID
      'System User' // In a real app, pass the current user name
    ).pipe(
      switchMap(() => this.simulateNetwork(updatedWorkOrder)),
      catchError(error => {
        console.error('Error deleting remark:', error);
        
        // Rollback changes in case of error
        updatedWorkOrder.remarks = originalRemarks;
        this.mockWorkOrders[workOrderIndex] = updatedWorkOrder;
        this.workOrdersSubject.next([...this.mockWorkOrders]);
        
        return throwError(() => new Error(`Failed to delete remark: ${error.message || 'Unknown error'}`));
      })
    );
  }
  
  // Get all remarks for a work order
  getRemarksForWorkOrder(workOrderId: string): Observable<any[]> {
    console.log(`Fetching remarks for work order ${workOrderId}`);
    
    // Find the work order
    const workOrder = this.mockWorkOrders.find(wo => wo.id === workOrderId);
    if (!workOrder) {
      return throwError(() => new Error(`Work order with ID ${workOrderId} not found`));
    }
    
    // Return the remarks or an empty array if none exist
    const remarks = workOrder.remarks || [];
    
    return this.simulateNetwork(remarks).pipe(
      catchError(error => {
        console.error('Error fetching remarks:', error);
        return throwError(() => new Error('Failed to fetch remarks'));
      })
    );
  }

  // --- Task Methods ---

  // Update a task in a work order
  updateWorkOrderTask(workOrderId: string, taskIndex: number, updatedTask: Task): Observable<WorkOrder> {
    console.log(`Updating task at index ${taskIndex} in work order ${workOrderId}:`, updatedTask);
    
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${workOrderId} not found`)))
      );
    }
    
    try {
      const workOrder = { ...workOrders[workOrderIndex] };
      
      if (!workOrder.tasks || !Array.isArray(workOrder.tasks)) {
        return timer(this.networkDelay).pipe(
          mergeMap(() => throwError(() => new Error(`Tasks array not found in work order ${workOrderId}`)))
        );
      }
      
      if (taskIndex < 0 || taskIndex >= workOrder.tasks.length) {
        return timer(this.networkDelay).pipe(
          mergeMap(() => throwError(() => new Error(`Task index ${taskIndex} is out of bounds`)))
        );
      }
      
      // Update the specific task
      workOrder.tasks[taskIndex] = updatedTask;
      
      // Update the work order in the subject
      workOrders[workOrderIndex] = workOrder;
      this.workOrdersSubject.next(workOrders);
      
      return this.simulateNetwork(workOrder);
    } catch (error) {
      console.error(`Error updating task in work order ${workOrderId}:`, error);
      return throwError(() => new Error(`Failed to update task in work order ${workOrderId}`));
    }
  }

  // Add a task to a work order
  addTaskToWorkOrder(workOrderId: string, taskData: Partial<Task>): Observable<WorkOrder> {
    console.log(`Adding task to work order ${workOrderId}:`, taskData);
    
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${workOrderId} not found`)))
      );
    }
    
    try {
      const workOrder = { ...workOrders[workOrderIndex] };
      
      // Initialize tasks array if it doesn't exist
      if (!workOrder.tasks) {
        workOrder.tasks = [];
      }
      
      // Create a new task with generated ID
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        startDate: taskData.startDate || new Date().toISOString(),
        dueDate: taskData.dueDate || undefined,
        assignedTo: taskData.assignedTo || '',
        completed: taskData.completed || false,
        workOrderId: Number(workOrderId)
      };
      
      // Add the task to the work order
      workOrder.tasks.push(newTask);
      
      // Update the work order in the subject
      workOrders[workOrderIndex] = workOrder;
      this.workOrdersSubject.next(workOrders);
      
      return this.simulateNetwork(workOrder);
    } catch (error) {
      console.error(`Error adding task to work order ${workOrderId}:`, error);
      return throwError(() => new Error(`Failed to add task to work order ${workOrderId}`));
    }
  }

  // Delete a task from a work order
  deleteTask(workOrderId: string, taskIndex: number): Observable<WorkOrder> {
    console.log(`Deleting task at index ${taskIndex} from work order ${workOrderId}`);
    
    const workOrders = this.workOrdersSubject.value;
    const workOrderIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    
    if (workOrderIndex === -1) {
      return timer(this.networkDelay).pipe(
        mergeMap(() => throwError(() => new Error(`Work order with ID ${workOrderId} not found`)))
      );
    }
    
    try {
      const workOrder = { ...workOrders[workOrderIndex] };
      
      if (!workOrder.tasks || !Array.isArray(workOrder.tasks)) {
        return timer(this.networkDelay).pipe(
          mergeMap(() => throwError(() => new Error(`Tasks array not found in work order ${workOrderId}`)))
        );
      }
      
      if (taskIndex < 0 || taskIndex >= workOrder.tasks.length) {
        return timer(this.networkDelay).pipe(
          mergeMap(() => throwError(() => new Error(`Task index ${taskIndex} is out of bounds`)))
        );
      }
      
      // Remove the task at the specified index
      workOrder.tasks.splice(taskIndex, 1);
      
      // Update the work order in the subject
      workOrders[workOrderIndex] = workOrder;
      this.workOrdersSubject.next(workOrders);
      
      return this.simulateNetwork(workOrder);
    } catch (error) {
      console.error(`Error deleting task from work order ${workOrderId}:`, error);
      return throwError(() => new Error(`Failed to delete task from work order ${workOrderId}`));
    }
  }

  // When creating a task, use the correct properties
  createTask(workOrderId: string, taskData: Partial<Task>): Observable<Task> {
    return of({
      id: String(Math.floor(Math.random() * 10000)),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo || '',
      startDate: taskData.startDate || new Date(),
      dueDate: taskData.dueDate || undefined,
      completed: taskData.completed || false,
      workOrderId: workOrderId,
      createdBy: 'Current User',
      createdAt: new Date()
    }).pipe(delay(500));
  }
} 