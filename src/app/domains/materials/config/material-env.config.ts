/**
 * Material module environment configuration
 * This allows switching between real API and mock data
 */
export const MaterialEnvironmentConfig = {
  /**
   * API configuration
   */
  api: {
    useRealApi: false, // Set to true to use real API, false to use mock data
    baseUrl: '/api/materials', // Base URL for material API endpoints
    endpoints: {
      getAllMaterials: '', // Empty means use baseUrl
      getMaterialById: '/:id',
      getByMaterialType: '/type/:type',
      getByClientType: '/client/:clientType',
      assignToWorkOrder: '/assign',
      trackUsage: '/track-usage'
    }
  },

  /**
   * Feature flags
   */
  features: {
    enableMaterialTracking: true,
    enableWorkOrderAssignment: true,
    enableImportExport: false
  }
};
