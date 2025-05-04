/* eslint-disable @typescript-eslint/no-explicit-any */
// Base Material interface for all types of materials
export interface BaseMaterial {
  id?: string;
  code: string;
  description: string;
  unit: string;
  materialType: MaterialType;
  clientType: ClientType;
  // Dynamic attributes for client-specific properties
  attributes?: Record<string, any>;
}

// Enum for material types
export enum MaterialType {
  RECEIVABLE = 'receivable',
  PURCHASABLE = 'purchasable'
}

// Enum for client types
export enum ClientType {
  SEC = 'sec',
  // Add other clients as needed
  OTHER = 'other'
}

// SEC specific material interface
export interface SecMaterial extends BaseMaterial {
  clientType: ClientType.SEC;
  groupCode: string;
  groupCodeDescription: string;
  SEQ: number;
  materialMasterCode: string;
}

// Helper function to create a SEC material
export function createSecMaterial(data: Omit<SecMaterial, 'clientType' | 'materialType'>): SecMaterial {
  return {
    ...data,
    clientType: ClientType.SEC,
    materialType: MaterialType.RECEIVABLE,
    code: data.materialMasterCode,
  };
}

// Helper function to convert legacy SEC material to new format
export function convertLegacySecMaterial(legacy: {
  groupCode: string;
  groupCodeDescription: string;
  SEQ: number;
  materialMasterCode: string;
  materialDescription: string;
  unit: string;
}): SecMaterial {
  return {
    groupCode: legacy.groupCode,
    groupCodeDescription: legacy.groupCodeDescription,
    SEQ: legacy.SEQ,
    materialMasterCode: legacy.materialMasterCode,
    code: legacy.materialMasterCode,
    description: legacy.materialDescription,
    unit: legacy.unit,
    clientType: ClientType.SEC,
    materialType: MaterialType.RECEIVABLE
  };
}