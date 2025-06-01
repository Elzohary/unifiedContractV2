// Usage Tracking Models for comprehensive material usage across all entities

export interface MaterialUsageRecord {
  id: string;
  recordNumber: string;
  materialId: string;
  materialCode: string;
  materialDescription: string;

  // Usage details
  usageType: 'consumption' | 'installation' | 'wastage' | 'return' | 'damage' | 'transfer';
  quantity: number;
  unit: string;
  usageDate: Date;

  // Entity that used the material
  usedBy: {
    entityType: 'work-order' | 'expense' | 'manpower' | 'activity' | 'issue' | 'action' | 'maintenance';
    entityId: string;
    entityReference: string;
    entityDescription?: string;
  };

  // Location where material was used
  location: {
    type: 'warehouse' | 'site' | 'workshop' | 'office';
    id: string;
    name: string;
    specificLocation?: string; // e.g., "Floor 3, Room 301"
  };

  // Person who used/recorded the usage
  recordedBy: {
    userId: string;
    name: string;
    role: string;
    badgeNumber?: string;
  };

  // For work order specific usage
  workOrderDetails?: {
    workOrderId: string;
    workOrderNumber: string;
    taskId?: string;
    taskName?: string;
    activityPhase?: string;
  };

  // For manpower specific usage
  manpowerDetails?: {
    employeeId: string;
    employeeName: string;
    department: string;
    purpose: 'personal-protective-equipment' | 'tools' | 'consumables' | 'other';
  };

  // Financial impact
  financialImpact?: {
    unitCost: number;
    totalCost: number;
    costCenter?: string;
    budgetCode?: string;
  };

  // Quality and compliance
  qualityInfo?: {
    batchNumber?: string;
    expiryDate?: Date;
    qualityCheckPassed?: boolean;
    certificationNumber?: string;
  };

  // Supporting documentation
  evidence?: UsageEvidence[];

  // Additional information
  notes?: string;
  approvedBy?: string;
  approvalDate?: Date;
}

export interface UsageEvidence {
  id: string;
  type: 'photo' | 'document' | 'signature' | 'form';
  fileName: string;
  fileUrl: string;
  description?: string;
  uploadedBy: string;
  uploadedDate: Date;
}

export interface MaterialUsageSummary {
  materialId: string;
  materialCode: string;
  materialDescription: string;

  // Period
  period: {
    startDate: Date;
    endDate: Date;
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  };

  // Usage statistics
  statistics: {
    totalQuantityUsed: number;
    totalCost: number;
    averageDailyUsage: number;
    peakUsageDate: Date;
    peakUsageQuantity: number;
  };

  // Usage by entity type
  usageByEntity: EntityUsageBreakdown[];

  // Usage by location
  usageByLocation: LocationUsageBreakdown[];

  // Usage trend
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
    projectedNextPeriod: number;
  };

  // Top consumers
  topConsumers: TopConsumer[];
}

export interface EntityUsageBreakdown {
  entityType: string;
  totalQuantity: number;
  totalCost: number;
  percentage: number;
  recordCount: number;
}

export interface LocationUsageBreakdown {
  locationId: string;
  locationName: string;
  totalQuantity: number;
  totalCost: number;
  percentage: number;
}

export interface TopConsumer {
  entityType: string;
  entityId: string;
  entityReference: string;
  totalQuantity: number;
  totalCost: number;
  lastUsageDate: Date;
}

export interface MaterialAllocation {
  id: string;
  allocationNumber: string;
  materialId: string;

  // Allocation details
  allocationType: 'reserved' | 'committed' | 'planned';
  quantity: number;

  // Allocated to
  allocatedTo: {
    entityType: 'work-order' | 'activity' | 'project' | 'maintenance-schedule';
    entityId: string;
    entityReference: string;
  };

  // Validity
  allocationDate: Date;
  validFrom: Date;
  validUntil: Date;

  // Status
  status: 'active' | 'partially-consumed' | 'fully-consumed' | 'cancelled' | 'expired';
  consumedQuantity: number;
  remainingQuantity: number;

  // Allocation source
  source: {
    type: 'manual' | 'automatic' | 'requisition' | 'planning';
    sourceId?: string;
    sourceReference?: string;
  };

  // Approval
  approvedBy?: string;
  approvalDate?: Date;

  // Notes
  notes?: string;
}

export interface UsageAnalytics {
  // Material efficiency metrics
  efficiency: {
    plannedVsActual: {
      plannedQuantity: number;
      actualQuantity: number;
      variance: number;
      variancePercentage: number;
    };
    wastageRate: number;
    returnRate: number;
    damageRate: number;
  };

  // Cost analysis
  costAnalysis: {
    totalMaterialCost: number;
    laborCostSaved: number;
    overheadAllocation: number;
    costPerUnit: number;
    costTrend: CostTrend[];
  };

  // Consumption patterns
  consumptionPatterns: {
    seasonalVariation: SeasonalPattern[];
    peakPeriods: PeakPeriod[];
    unusualConsumption: UnusualConsumption[];
  };

  // Predictive analytics
  predictions: {
    nextMonthUsage: number;
    reorderDate: Date;
    stockoutRisk: 'low' | 'medium' | 'high';
    suggestedOrderQuantity: number;
  };
}

export interface CostTrend {
  period: Date;
  cost: number;
  quantity: number;
  averageUnitCost: number;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageUsage: number;
  percentageOfAnnual: number;
}

export interface PeakPeriod {
  startDate: Date;
  endDate: Date;
  totalUsage: number;
  reason?: string;
}

export interface UnusualConsumption {
  date: Date;
  quantity: number;
  deviation: number; // Standard deviations from mean
  possibleReason?: string;
  investigationRequired: boolean;
}

export interface MaterialTransfer {
  id: string;
  transferNumber: string;
  transferDate: Date;

  // Material details
  materialId: string;
  materialCode: string;
  materialDescription: string;
  quantity: number;
  unit: string;

  // Transfer locations
  from: {
    locationType: 'warehouse' | 'site' | 'work-order';
    locationId: string;
    locationName: string;
    specificLocation?: string;
  };
  to: {
    locationType: 'warehouse' | 'site' | 'work-order';
    locationId: string;
    locationName: string;
    specificLocation?: string;
  };

  // Transfer reason
  reason: 'reallocation' | 'emergency' | 'optimization' | 'project-completion' | 'other';
  reasonDetails?: string;

  // Authorization
  requestedBy: string;
  authorizedBy: string;
  authorizationDate: Date;

  // Execution
  executedBy?: string;
  executionDate?: Date;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';

  // Transportation
  transportation?: {
    method: 'company-vehicle' | 'third-party' | 'manual';
    vehicleNumber?: string;
    driverName?: string;
    estimatedArrival?: Date;
    actualArrival?: Date;
  };

  // Documentation
  transferDocuments?: UsageEvidence[];
  notes?: string;
}

export interface UsageAlert {
  id: string;
  alertType: 'unusual-usage' | 'excessive-wastage' | 'unauthorized-usage' | 'stock-discrepancy';
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Alert details
  materialId: string;
  materialCode: string;
  description: string;
  detectedDate: Date;

  // Context
  context: {
    expectedValue: number;
    actualValue: number;
    deviation: number;
    location?: string;
    entity?: string;
  };

  // Status
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false-alarm';

  // Actions
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedDate?: Date;
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
}
