import { User as WorkOrderUser } from './work-order.model';

export interface Employee {
  id: string;
  name: string;
  photo: string;
  jobTitle: string;
  badgeNumber: string;
  workLocation: string;
  homeAddress: string;
  homeType: 'company' | 'personal';
  companyPhone: string;
  personalPhone: string;
  iqamaNumber: string;
  age: number;
  nationality: string;
  directManager?: Employee;
  managedEmployees?: Employee[];
  attendance: AttendanceRecord[];
  workTimeRatio: number; // Percentage of expected work hours fulfilled
  monthlyHours: number; // Expected monthly hours
  avgLateMinutes: number;
  cv: Document;
  certificates: Certificate[];
  pastExperience: WorkExperience[];
  joinDate: Date;
  currentProject?: string;
  sickLeaveCounter: number;
  assignedTasks: Task[];
  sentRequests: EmployeeRequest[];
  receivedRequests?: EmployeeRequest[]; // Only for managers
  identifications: Identification[];
  warnings: Warning[];
  sickLeaves: SickLeave[];
  offDays: number; // Remaining vacation days
  cost: EmployeeCost;
  // Link to user account for authentication
  user: EmployeeUser;
}

export interface EmployeeCost {
  salary: number;
  homeAllowance: number;
  iqamaFees: number;
  drivingLicenseFees: number;
  insuranceFees: number;
  carAllowance: number;
  simCardFees: number;
  certificatesFees: number;
  otherCosts: OtherCost[];
  totalCost: number;
}

export interface OtherCost {
  id: string;
  name: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'yearly';
  description?: string;
}

export interface AttendanceRecord {
  id: string;
  employee: Employee;
  date: Date;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'halfDay' | 'vacation' | 'sickLeave' | 'remote';
  lateMinutes: number;
  totalHours: string | number;
  notes?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
  verified: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  referenceName?: string;
  referenceContact?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  hoursLogged: number;
}

export interface EmployeeRequest {
  id: string;
  employee: Employee;
  type: 'vacation' | 'sickLeave' | 'remote' | 'permission' | 'resignation' | 'other';
  requestDate: Date;
  startDate: Date;
  endDate: Date;
  reason: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  responseDate: Date | null;
  responseBy: Employee | null;
  responseNotes: string;
}

export interface RequestComment {
  id: string;
  content: string;
  createdBy: Employee;
  createdDate: Date;
  isPrivate: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: Date;
  uploadedBy: Employee;
  size: number; // in bytes
  description?: string;
}

export interface Identification {
  id: string;
  type: 'passport' | 'id-card' | 'driver-license' | 'iqama' | 'other';
  number: string;
  issueDate: Date;
  expiryDate: Date;
  issuingCountry: string;
  documentUrl?: string;
}

export interface Warning {
  id: string;
  title: string;
  description: string;
  issueDate: Date;
  issuedBy: Employee;
  severity: 'minor' | 'moderate' | 'severe';
  acknowledgement?: {
    acknowledged: boolean;
    date?: Date;
    comments?: string;
  };
}

export interface SickLeave {
  id: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  medicalCertificate?: Document;
  approved: boolean;
  approvedBy?: Employee;
  comments?: string;
}

export enum PermissionLevel {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
  APPROVE = 'approve',
  ADMIN = 'admin'
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: {
    employees: PermissionLevel;
    attendance: PermissionLevel;
    requests: PermissionLevel;
    warnings: PermissionLevel;
    reports: PermissionLevel;
    settings: PermissionLevel;
    costs: PermissionLevel;
  };
  createdDate: Date;
  modifiedDate?: Date;
}

export interface EmployeeChange {
  id: string;
  employeeId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: Employee;
  changeDate: Date;
  reason?: string;
  approvedBy?: Employee;
  approvalDate?: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: Employee;
  createdDate: Date;
  expiryDate?: Date;
  priority: 'low' | 'medium' | 'high';
  targetDepartments?: string[];
  targetEmployees?: string[];
  attachments?: Document[];
  acknowledgement?: boolean;
  acknowledgedBy?: Employee[];
}

export interface EmployeeUser {
  id: string;
  name: string;
  email: string;
  role?: string;
} 