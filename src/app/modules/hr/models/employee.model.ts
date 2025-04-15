export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  hireDate: Date;
  terminationDate?: Date;
  managerId?: string;
  skills: string[];
  certifications: Certification[];
  emergencyContact: EmergencyContact;
  address: Address;
  documents: EmployeeDocument[];
  leaves: Leave[];
  performanceReviews: PerformanceReview[];
  training: Training[];
  salary: Salary;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface EmployeeDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
}

export interface Leave {
  id: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface PerformanceReview {
  id: string;
  reviewDate: Date;
  reviewerId: string;
  rating: number;
  comments: string;
  goals: string[];
  achievements: string[];
  areasForImprovement: string[];
}

export interface Training {
  id: string;
  name: string;
  provider: string;
  startDate: Date;
  endDate: Date;
  status: TrainingStatus;
  certificateUrl?: string;
}

export interface Salary {
  baseSalary: number;
  currency: string;
  paymentFrequency: PaymentFrequency;
  bankDetails: BankDetails;
  allowances: Allowance[];
  deductions: Deduction[];
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  branch: string;
  accountType: string;
}

export interface Allowance {
  type: string;
  amount: number;
  frequency: PaymentFrequency;
}

export interface Deduction {
  type: string;
  amount: number;
  frequency: PaymentFrequency;
}

export enum EmployeeRole {
  Admin = 'admin',
  Manager = 'manager',
  Supervisor = 'supervisor',
  Employee = 'employee',
  Contractor = 'contractor'
}

export enum EmployeeStatus {
  Active = 'active',
  OnLeave = 'on_leave',
  Terminated = 'terminated',
  Suspended = 'suspended'
}

export enum DocumentType {
  ID = 'id',
  Contract = 'contract',
  Resume = 'resume',
  Certificate = 'certificate',
  Other = 'other'
}

export enum LeaveType {
  Annual = 'annual',
  Sick = 'sick',
  Maternity = 'maternity',
  Paternity = 'paternity',
  Unpaid = 'unpaid',
  Other = 'other'
}

export enum LeaveStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

export enum TrainingStatus {
  Planned = 'planned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum PaymentFrequency {
  Weekly = 'weekly',
  BiWeekly = 'bi_weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Annually = 'annually'
} 