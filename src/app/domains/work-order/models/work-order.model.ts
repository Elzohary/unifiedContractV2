export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'engineer' | 'foreman' | 'worker' | 'client' | 'coordinator';
  avatar?: string;
  isEmployee: boolean;
  employeeId?: string;
}

export interface LogEntry {
  id: string;
  date: Date;
  action: string;
  description: string;
  createdBy: User;
  attachments?: Attachment[];
}

export interface Permit {
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

export interface Manpower {
  id: string;
  badgeNumber: string;
  user?: User;
  role?: string;
  hoursAssigned: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber?: string;
  quantity: number;
  assignedFrom: Date;
  assignedTo?: Date;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  notes?: string;
}

export interface Material {
  id: string;
  materialType: 'purchasable' | 'receivable';
  purchasableMaterial?: purchasableMaterial;
  receivableMaterial?: receivableMaterial;
}

export interface purchasableMaterial {
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

export interface receivableMaterial {
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
  receivedBy?: Manpower;
  returnedBy?: Manpower;
}

export interface Issue {
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


export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: User;
  url: string;
}


import { WorkOrderStatus } from './work-order-status.enum';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';
export {WorkOrderStatus} from './work-order-status.enum';

export interface WorkOrder {
  id: string;
  details: workOrderDetail;
  estimatedCost: number;
  remarks: WorkOrderRemark[];
  engineerInCharge?: {
    id: string;
    name: string;
  };
  actionsNeeded?: ActionItem[];
  issues: WorkOrderIssue[];
  materials?: Material[];
  permits?: Permit[];

  // Additional properties used in services and mock data
  tasks?: Task[];
  manpower?: Manpower[];
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

export interface workOrderDetail {
  workOrderNumber: string;
  internalOrderNumber: string;
  title: string;
  description: string;
  client: string;
  location: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
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

export interface workOrderItem {
  id: string;
  itemNumber: string;
  title: string;
  description: string;
  unit: string;
  unitPrice: number;
  status: string;
  estimatedQuantity: number;
  estimatedPrice: number;
  estimatedPriceWithVAT: number;
  actualQuantity: number;
  actualPrice: number;
  actualPriceWithVAT: number;
  reasonForFinalQuantity: string;
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  manpower?: Manpower[];
  equipment?: Equipment[];
  dueDate?: Date | string;
  startDate?: Date | string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in-progress' | 'Waiting Confirmation' | 'Confirmed' | 'delayed';
  completed?: boolean;
  workOrderId?: string | number;
  attachments?: string[];
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  confirmedBy?: Manpower ;
}

export interface WorkOrderRemark {
  id: string;
  content: string;
  createdDate: string;
  createdBy: string;
  type: 'general' | 'technical' | 'safety' | 'quality' | string;
  workOrderId: string;
  peopleInvolved?: string[]; // IDs of people involved who should be notified
}

export interface WorkOrderIssue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  reportedDate: string | Date;
  assignedTo?: string;
  resolutionDate?: string | Date;
  resolutionNotes?: string;
}

export interface WorkOrderAction {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: WorkOrderPriority;
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
  completedBy?: string;
}

export interface WorkOrderPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedDate: string;
  uploadedBy: string;
  type: 'before' | 'during' | 'after' | 'issue';
}

export interface WorkOrderForm {
  id: string;
  title: string;
  type: 'checklist' | 'inspection' | 'safety' | 'quality' | 'permit' | 'material';
  status: 'pending' | 'completed';
  submittedDate?: string;
  submittedBy?: string;
  url: string;
}

export interface WorkOrderExpense {
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

export interface WorkOrderInvoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paidDate?: string;
  paidBy?: string;
  url: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  dueDate: string | Date;
  assignedTo?: string;
  completedDate?: string | Date;
  completedBy?: string;
  notes?: string;
}
