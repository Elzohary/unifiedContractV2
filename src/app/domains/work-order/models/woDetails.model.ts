import { WorkOrderStatus } from "./work-order.model";


export interface workOrderDetails {
  workOrderNumber: string;
  title?: string;
  description?: string;
  status: WorkOrderStatus;
  category: string;
  type: 'Consumer' | 'Project' | 'Maintenance' | 'Emergency' |'Other'; // New
  completionPercentage: number;
  location: string;
}


// Moved TO
export interface importantDates {
  receivedDate: string | Date;
  startDate?: string | Date;
  dueDate?: string | Date;
  targetEndDate?: string | Date;
  createdDate: string | Date;
  createdBy: string;
  lastUpdated?: string | Date;
}




/* Move */
/*
  client: string;
*/

// DELETED
/*
  priority: WorkOrderPriority;
  internalOrderNumber: string;
*/