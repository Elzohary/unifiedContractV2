import { Iitem } from './work-order-item.model';
export type { Iitem };

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

export interface ManpowerAssignment {
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

export interface equipmentAssignment {
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


export interface materialAssignment {
  id: string;
  materialType: 'purchasable' | 'receivable';
  purchasableMaterial?: PurchasableMaterial;
  receivableMaterial?: ReceivableMaterial;
  workOrderNumber: string;
  assignDate: Date | string;
  assignedBy: string;
  storingLocation?: string;
}

export interface PurchasableMaterial {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  status: 'pending' | 'ordered' | 'delivered' | 'in-use' | 'used';
  supplier?: string;
  orderDate?: Date | string;
  deliveryDate?: Date | string;
  
  // Invoice management
  invoice?: {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedDate: Date | string;
    uploadedBy: string;
    documentType: 'pdf' | 'image';
  };
  
  // Delivery details
  delivery?: {
    receivedDate: Date | string;
    receivedBy: string; // Badge number or ID
    receivedByName: string;
    storageLocation: 'warehouse' | 'site-direct';
    warehouseDetails?: {
      warehouseId: string;
      warehouseName: string;
      binLocation?: string;
    };
    deliveryNote?: string;
    deliveryPhotos?: Array<{
      id: string;
      fileUrl: string;
      uploadedDate: Date | string;
    }>;
  };
  
  // Site usage tracking - Changed to array for multiple usage records
  siteUsageRecords?: SiteUsageRecord[];
  
  // Keep legacy field for backward compatibility
  siteUsage?: {
    issuedToSite: boolean;
    issuedDate?: Date | string;
    issuedBy?: string; // System user who recorded the issue
    releasedBy?: string; // Warehouse keeper badge number
    releasedByName?: string; // Warehouse keeper name
    receivedBySite?: string; // Manpower ID who received at site
    receivedBySiteName?: string;
    actualQuantityUsed?: number;
    usagePercentage?: number;
    usageCompletedDate?: Date | string;
    usageNotes?: string;
    usagePhotos?: Array<{
      id: string;
      fileUrl: string;
      description: string;
      uploadedDate: Date | string;
      uploadedBy: string;
    }>;
  };
}

// New interface for tracking individual usage records
export interface SiteUsageRecord {
  id: string;
  recordType: 'site-issue' | 'usage-update' | 'return' | 'waste';
  recordDate: Date | string;
  recordedBy: string;
  recordedByName?: string;
  
  // For site issue
  issuedToSite?: boolean;
  issuedDate?: Date | string;
  issuedBy?: string;
  releasedBy?: string; // Warehouse keeper badge number
  releasedByName?: string; // Warehouse keeper name
  receivedBySite?: string;
  receivedBySiteName?: string;
  
  // For usage update
  quantityUsed?: number;
  cumulativeQuantityUsed?: number;
  usagePercentage?: number;
  remainingQuantity?: number;
  usageNotes?: string;
  
  // For returns/waste
  quantityReturned?: number;
  quantityWasted?: number;
  wasteReason?: string;
  reservedForWorkOrder?: boolean; // For returns - whether to reserve for same work order
  
  // Photos for any record type
  photos?: Array<{
    id: string;
    fileUrl: string;
    description: string;
    uploadedDate: Date | string;
    uploadedBy: string;
  }>;
}

export interface ReceivableMaterial {
  id: string;
  name: string;
  description: string;
  unit: string;
  estimatedQuantity: number;
  receivedQuantity?: number;
  actualQuantity?: number;
  remainingQuantity?: number;
  status: 'pending' | 'ordered' | 'received' | 'used';
  receivedDate?: string;
  
  // Usage tracking records
  usageRecords?: UsageRecord[];
  
  // Enhanced receiving details
  receiving?: {
    materialMan: string; // Badge number
    materialManName: string;
    receivedDate: Date | string;
    storageLocation: string;
    storageDetails?: string;
    receivingPhotos?: Array<{
      id: string;
      fileUrl: string;
      uploadedDate: Date | string;
    }>;
  };
  
  // Installation tracking
  installation?: {
    installedBy: string; // Manpower ID
    installedByName: string;
    installationStartDate?: Date | string;
    installationEndDate?: Date | string;
    actualQuantityInstalled: number;
    remainingQuantity: number;
    installationNotes?: string;
    installationPhotos?: Array<{
      id: string;
      fileUrl: string;
      description: string;
      uploadedDate: Date | string;
    }>;
  };
  
  receivedBy?: ManpowerAssignment;
}

// Interface for receivable material usage records
export interface UsageRecord {
  id: string;
  recordType: 'usage-update' | 'return-to-client' | 'reserve-for-later';
  recordDate: Date | string;
  recordedBy: string;
  recordedByName?: string;
  
  // Usage details
  quantityUsed?: number;
  cumulativeQuantityUsed?: number;
  usagePercentage?: number;
  remainingQuantity?: number;
  usageNotes?: string;
  
  // For returns to client
  quantityReturned?: number;
  returnReason?: string;
  
  // For reservations
  reservedForWorkOrder?: boolean; // true = same WO, false = available for others
  reservationNotes?: string;
  
  // Photos
  photos?: Array<{
    id: string;
    fileUrl: string;
    description: string;
    uploadedDate: Date | string;
    uploadedBy: string;
  }>;
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
  items: workOrderItem[];
  remarks: WorkOrderRemark[];
  engineerInCharge?: {
    id: string;
    name: string;
  };
  actionsNeeded?: ActionNeeded[];
  issues: WorkOrderIssue[];
  materials?: materialAssignment[];
  permits?: Permit[];
  // Additional properties used in services and mock data
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

export interface workOrderDetail {
  workOrderNumber: string;
  internalOrderNumber: string;
  title?: string;
  description?: string;
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

export interface workOrderItem {
  id: string;
  itemDetail: Iitem;
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
  manpower?: ManpowerAssignment[];
  equipment?: equipmentAssignment[];
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
  confirmedBy?: ManpowerAssignment ;
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

// Repeated
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

// Repeated
export interface ActionNeeded {
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
