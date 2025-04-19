Work Order
{
  id: string;                  // Unique identifier for the work order
  details: WorkOrderDetail;    // Basic information about the work order
  estimatedCost: number;       // Estimated cost for the entire work order
  remarks: WorkOrderRemark[];  // Comments and notes related to the work order
  engineerInCharge?: {         // Engineer responsible for the work order
    id: string;
    name: string;
  };
  actionsNeeded?: ActionItem[];  // Action items requiring attention
  issues: WorkOrderIssue[];      // Problems or issues reported
  materials?: Material[];        // Materials required for the work order
  permits?: Permit[];            // Permits and approvals for the work order
  tasks?: Task[];                // Tasks needed to complete the work order
  manpower?: Manpower[];         // Personnel assigned to the work order
  actions?: WorkOrderAction[];   // Actions taken on the work order
  photos?: WorkOrderPhoto[];     // Photos documenting the work
  forms?: WorkOrderForm[];       // Forms and documentation
  expenses?: WorkOrderExpense[]; // Expenses incurred
  invoices?: WorkOrderInvoice[]; // Invoices related to the work order
  expenseBreakdown?: {           // Breakdown of expenses by category
    materials: number;
    labor: number;
    other: number;
  }
}

Work Order Detail
{
  workOrderNumber: string;        // Public-facing work order number
  internalOrderNumber: string;    // Internal reference number
  title: string;                  // Title of the work order
  description: string;            // Detailed description
  client: string;                 // Client requesting the work
  location: string;               // Location where work is performed
  status: WorkOrderStatus;        // Current status (see status enum)
  priority: WorkOrderPriority;    // Priority level (low/medium/high/critical)
  category: string;               // Category or type of work
  completionPercentage: number;   // Percentage of completion (0-100)
  receivedDate: string | Date;    // Date the order was received
  startDate: string | Date;       // Date work started
  dueDate: string | Date;         // Due date for completion
  targetEndDate?: string | Date;  // Target completion date
  createdDate: string | Date;     // Date the work order was created
  createdBy: string;              // Person who created the work order
  lastUpdated?: string | Date;    // Last time the work order was updated
}

Task
{
  id: string | number;
  title: string;
  description?: string;
  manpower?: Manpower[];          // Personnel assigned to this task
  equipment?: Equipment[];        // Equipment needed for the task
  dueDate?: Date | string;
  startDate?: Date | string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in-progress' | 'Waiting Confirmation' | 'Confirmed' | 'delayed';
  completed?: boolean;            // Whether the task is completed
  workOrderId?: string | number;  // Reference to parent work order
  attachments?: string[];         // Related documents
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  confirmedBy?: Manpower;         // Person who confirmed completion
}

Work Order Remark
{
  id: string;
  content: string;                // Content of the remark
  createdDate: string;            // Date the remark was created
  createdBy: string;              // Person who created the remark
  type: 'general' | 'technical' | 'safety' | 'quality' | string;  // Type of remark
  workOrderId: string;            // Reference to parent work order
  peopleInvolved?: string[];      // IDs of people involved who should be notified
}

Work Order Issue
{
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

Material
{
  id: string;
  materialType: 'purchasable' | 'receivable';
  purchasableMaterial?: {        // For materials that need to be purchased
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
  };
  receivableMaterial?: {         // For materials that need to be received
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
}

Manpower
{
  id: string;
  badgeNumber: string;
  name: string;
  user?: User;
  role?: string;
  hoursAssigned: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

Permit
{
  id: string;
  type: string;                  // E.g., 'Municipality', 'Electrical', 'Plumbing'
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

Equipment
{
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

ActionNeeded
{
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

Work Order Expense
{
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

Work Order Photo
{
  id: string;
  url: string;
  caption?: string;
  uploadedDate: string;
  uploadedBy: string;
  type: 'before' | 'during' | 'after' | 'issue';
}

User
{
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'engineer' | 'foreman' | 'worker' | 'client' | 'coordinator';
  avatar?: string;
  isEmployee: boolean;
  employeeId?: string;
}

export enum WorkOrderStatus {
  // Basic statuses
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  OnHold = 'on-hold',
  
  // Extended statuses
  UpdatedAlreadyUDSProblem = 'Updated already UDS-problem',
  ReadyForCompleteCertificateWithRequirement = 'Ready to complete certificate with requirement',
  ReadyForUpdatingUDISProblem = 'Ready for updating UDS problem',
  UpdatedAlreadyNeedRTIOnly = 'Updated already need RTI only',
  UnderCheckingAndSignatures = 'Under checking and signatures',
  PaidWithVAT = 'Paid with VAT',
  UpdatedAlreadyRTIAndReceivingInProcess = 'Updated already RTI-receiving in process',
  NeedDP = 'need DP',
  ReadyForCheckingNeedPrepareDocuments = 'Ready for checking need prepare documents',
  UpdatedAlreadyEngSectionForApproval = 'Updated already Engr. section for approval',
  WaitingShutdown = 'Waiting Shutdown',
  InProgressForPermission = 'In progress for permission',
  CancelWorkOrder = 'Cancel work-order',
  NeedReplacementEquipment = 'Need replacement equipment',
  WaitingFinancial = 'Waiting financial',
  ReadyForChecking = 'Ready for checking',
  ClosedWithMustakhlasNeed1stApproval = 'Closed with mustakhlas need 1st approval',
  NeedMustakhlasWithoutRequirements = 'Need mustakhlas without requirements',
  UpdatedAlreadyNeedReceivingMaterialsOnly = 'Updated already need receiving materials only',
  CompleteCertificateNeed2ndApproval = 'Complete certificate need 2nd approval',
  ClosedWithMustakhlasNeed2ndApproval = 'Closed with mustakhlas need 2nd approval',
  MaterialsReceivedNeed155 = 'Materials received need 155',
  ReadyForCompleteCertificateWithoutRequirement = 'Ready for complete certificate without requirement',
  ClosedWithMustakhlasNeed1stApprovalNeedReturnScSrap = 'Closed with mustakhlas need 1st approval return scrap'
} 

type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical';

