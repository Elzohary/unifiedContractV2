Work Order Overview {

}



export interface workOrderDetail {
  
  
  ✅title?: string;
  ✅description?: string;
  client: string;

  
  completionPercentage: number;
  
  receivedDate: string | Date;
  startDate?: string | Date;
  dueDate?: string | Date;
  targetEndDate?: string | Date;
  createdDate: string | Date;
  createdBy: string;
  lastUpdated?: string | Date;
}


overview:
✅ workOrderNumber: string;
✅ internalOrderNumber: string;
✅ location: string;
✅ status: WorkOrderStatus;
✅ priority: WorkOrderPriority;
✅ category: string;