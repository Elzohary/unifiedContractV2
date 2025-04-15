export interface Manpower {
  id: string;
  employeeId: string;
  role: string;
  department: string;
  skills: string[];
  certifications: Certification[];
  availability: Availability;
  currentAssignments: Assignment[];
  historicalAssignments: Assignment[];
  performance: Performance;
  training: Training[];
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

export interface Availability {
  status: AvailabilityStatus;
  startDate: Date;
  endDate?: Date;
  reason?: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  workOrderId: string;
  role: string;
  startDate: Date;
  endDate: Date;
  status: AssignmentStatus;
  hours: number;
  rate: number;
  notes?: string;
}

export interface Performance {
  rating: number;
  lastReviewDate: Date;
  strengths: string[];
  areasForImprovement: string[];
  incidents: Incident[];
}

export interface Incident {
  id: string;
  date: Date;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  actionTaken: string;
  resolved: boolean;
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

export enum AvailabilityStatus {
  Available = 'available',
  Assigned = 'assigned',
  OnLeave = 'on_leave',
  Unavailable = 'unavailable'
}

export enum AssignmentStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum IncidentType {
  Safety = 'safety',
  Performance = 'performance',
  Conduct = 'conduct',
  Other = 'other'
}

export enum IncidentSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum TrainingStatus {
  Planned = 'planned',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled'
} 