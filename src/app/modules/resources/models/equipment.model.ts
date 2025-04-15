export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  status: EquipmentStatus;
  department: string;
  location: string;
  purchaseDate: Date;
  purchaseCost: number;
  currentValue: number;
  specifications: Record<string, string>;
  maintenanceHistory: MaintenanceRecord[];
  currentAssignment?: Assignment;
  nextMaintenanceDate?: Date;
  nextMaintenanceType?: string;
  lastActivityDate?: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
}

export interface MaintenanceRecord {
  id: string;
  type: string;
  date: Date;
  description: string;
  cost: number;
  performedBy: string;
  nextMaintenanceDate: Date;
  nextMaintenanceType?: string;
}

export interface Assignment {
  id: string;
  workOrderId: string;
  startDate: Date;
  endDate?: Date;
  status: AssignmentStatus;
  assignedTo: string;
  hours: number;
  rate: number;
}

export interface EquipmentSpecification {
  manufacturer: string;
  modelYear: number;
  capacity?: string;
  power?: string;
  dimensions?: string;
  weight?: string;
  operatingConditions?: string;
  safetyFeatures?: string[];
}

export interface EquipmentDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
}

export enum EquipmentStatus {
  Available = 'Available',
  InUse = 'InUse',
  Maintenance = 'Maintenance',
  OutOfService = 'OutOfService'
}

export enum AssignmentStatus {
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum DocumentType {
  Manual = 'manual',
  Warranty = 'warranty',
  Certificate = 'certificate',
  Inspection = 'inspection',
  Other = 'other'
} 