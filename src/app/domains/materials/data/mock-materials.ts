import { BaseMaterial, ClientType, MaterialType, SecMaterial } from '../models/material.model';

// SEC materials mock data
export const mockSecMaterials: SecMaterial[] = [
  {
    id: '1',
    code: 'SEC-001',
    description: 'Electrical Meter Type A',
    unit: 'PCS',
    materialType: MaterialType.RECEIVABLE,
    clientType: ClientType.SEC,
    groupCode: 'ELM',
    groupCodeDescription: 'Electrical Meters',
    SEQ: 1001,
    materialMasterCode: 'SEC-ELM-001'
  },
  {
    id: '2',
    code: 'SEC-002',
    description: 'Cable 16mm',
    unit: 'M',
    materialType: MaterialType.RECEIVABLE,
    clientType: ClientType.SEC,
    groupCode: 'ELC',
    groupCodeDescription: 'Electrical Cables',
    SEQ: 2001,
    materialMasterCode: 'SEC-ELC-001'
  },
  {
    id: '3',
    code: 'SEC-003',
    description: 'Junction Box Type B',
    unit: 'PCS',
    materialType: MaterialType.RECEIVABLE,
    clientType: ClientType.SEC,
    groupCode: 'ELJ',
    groupCodeDescription: 'Electrical Junctions',
    SEQ: 3001,
    materialMasterCode: 'SEC-ELJ-001'
  }
];

// Purchasable materials mock data
export const mockPurchasableMaterials: BaseMaterial[] = [
  {
    id: '4',
    code: 'ASP-001',
    description: 'Asphalt Mix Type A',
    unit: 'TON',
    materialType: MaterialType.PURCHASABLE,
    clientType: ClientType.OTHER
  },
  {
    id: '5',
    code: 'CON-001',
    description: 'Concrete Mix 40MPa',
    unit: 'M3',
    materialType: MaterialType.PURCHASABLE,
    clientType: ClientType.OTHER
  },
  {
    id: '6',
    code: 'BAS-001',
    description: 'Base Course Aggregate',
    unit: 'M3',
    materialType: MaterialType.PURCHASABLE,
    clientType: ClientType.OTHER
  }
];

// Combined mock data
export const mockMaterials: BaseMaterial[] = [
  ...mockSecMaterials,
  ...mockPurchasableMaterials
];
