export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: ActivityLogAction;
  entityType: ActivityLogEntityType;
  entityId: string;
  entityName: string;
  details: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export enum ActivityLogAction {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  View = 'view',
  Login = 'login',
  Logout = 'logout',
  Export = 'export',
  Import = 'import',
  Approve = 'approve',
  Reject = 'reject',
  Assign = 'assign',
  Unassign = 'unassign',
  Start = 'start',
  Complete = 'complete',
  Cancel = 'cancel',
  Comment = 'comment',
  Upload = 'upload',
  Download = 'download',
  Print = 'print',
  Share = 'share',
  Other = 'other'
}

export enum ActivityLogEntityType {
  WorkOrder = 'work_order',
  Employee = 'employee',
  Manpower = 'manpower',
  Equipment = 'equipment',
  Material = 'material',
  Supplier = 'supplier',
  User = 'user',
  Role = 'role',
  Permission = 'permission',
  Department = 'department',
  Location = 'location',
  Document = 'document',
  Report = 'report',
  Setting = 'setting',
  Other = 'other'
} 