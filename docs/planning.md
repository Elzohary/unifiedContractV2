Work Order Overview {

}



export interface workOrderDetail {
  ✅workOrderNumber: string;
  ✅internalOrderNumber: string;
  ✅title?: string;
  ✅description?: string;
  client: string;
  location: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  category: string;
  completionPercentage: number;
  receivedDate: string | Date;
  startDate?: string | Date;
  dueDate?: string | Date;
  targetEndDate?: string | Date;
  createdDate: string | Date;
  createdBy: string;
  lastUpdated?: string | Date;
}