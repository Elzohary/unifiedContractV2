import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BaseMaterial, ClientType, MaterialType, SecMaterial } from '../models/material.model';
import { MaterialEnvironmentConfig } from '../config/material-env.config';
import { mockMaterials, mockSecMaterials } from '../data/mock-materials';

/**
 * Material Data Service
 *
 * This service handles the data access layer for materials.
 * It can switch between real API calls and mock data based on configuration.
 */
@Injectable({
  providedIn: 'root'
})
export class MaterialDataService {
  private apiConfig = MaterialEnvironmentConfig.api;

  constructor(private http: HttpClient) { }

  /**
   * Get all materials with optional filtering
   */
  getAllMaterials(clientType?: ClientType): Observable<BaseMaterial[]> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = this.apiConfig.baseUrl + this.apiConfig.endpoints.getAllMaterials;
      const queryParams = clientType ? `?clientType=${clientType}` : '';

      return this.http.get<BaseMaterial[]>(`${endpoint}${queryParams}`);
    } else {
      // Use mock data with simulated delay
      let filteredMaterials = [...mockMaterials];

      if (clientType) {
        filteredMaterials = filteredMaterials.filter(m => m.clientType === clientType);
      }

      // Simulate network delay
      return of(filteredMaterials).pipe(delay(500));
    }
  }

  /**
   * Add a new material
   */
  addMaterial(material: BaseMaterial): Observable<BaseMaterial> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      return this.http.post<BaseMaterial>(this.apiConfig.baseUrl, material);
    } else {
      // Create a new ID for the material in mock data
      const newMaterial: BaseMaterial = {
        ...material,
        id: `${Date.now()}` // Generate a timestamp-based ID
      };

      // Add to mock data
      mockMaterials.push(newMaterial);

      // If it's a SEC material, add to SEC materials as well
      if (newMaterial.clientType === ClientType.SEC) {
        mockSecMaterials.push(newMaterial as SecMaterial);
      }

      // Simulate network delay
      return of(newMaterial).pipe(delay(500));
    }
  }

  /**
   * Update an existing material
   */
  updateMaterial(material: BaseMaterial): Observable<BaseMaterial> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = `${this.apiConfig.baseUrl}/${material.id}`;
      return this.http.put<BaseMaterial>(endpoint, material);
    } else {
      // Update in mock data
      const index = mockMaterials.findIndex(m => m.id === material.id);

      if (index !== -1) {
        mockMaterials[index] = {...material};

        // If it's a SEC material, update in SEC materials as well
        if (material.clientType === ClientType.SEC) {
          const secIndex = mockSecMaterials.findIndex(m => m.id === material.id);
          if (secIndex !== -1) {
            mockSecMaterials[secIndex] = {...material} as SecMaterial;
          } else {
            mockSecMaterials.push(material as SecMaterial);
          }
        }
      }

      // Simulate network delay
      return of(material).pipe(delay(500));
    }
  }

  /**
   * Delete a material by ID
   */
  deleteMaterial(id: string): Observable<boolean> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = `${this.apiConfig.baseUrl}/${id}`;
      return this.http.delete<boolean>(endpoint);
    } else {
      // Delete from mock data
      const index = mockMaterials.findIndex(m => m.id === id);

      if (index !== -1) {
        const material = mockMaterials[index];
        mockMaterials.splice(index, 1);

        // If it's a SEC material, delete from SEC materials as well
        if (material.clientType === ClientType.SEC) {
          const secIndex = mockSecMaterials.findIndex(m => m.id === id);
          if (secIndex !== -1) {
            mockSecMaterials.splice(secIndex, 1);
          }
        }
      }

      // Simulate network delay and always return success
      return of(true).pipe(delay(500));
    }
  }

  /**
   * Get materials by material type
   */
  getMaterialsByType(materialType: MaterialType): Observable<BaseMaterial[]> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = this.apiConfig.baseUrl +
        this.apiConfig.endpoints.getByMaterialType.replace(':type', materialType);

      return this.http.get<BaseMaterial[]>(endpoint);
    } else {
      // Use mock data with simulated delay
      const filteredMaterials = mockMaterials.filter(m => m.materialType === materialType);

      // Simulate network delay
      return of(filteredMaterials).pipe(delay(500));
    }
  }

  /**
   * Get SEC materials specifically
   */
  getSecMaterials(): Observable<SecMaterial[]> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = this.apiConfig.baseUrl +
        this.apiConfig.endpoints.getByClientType.replace(':clientType', ClientType.SEC);

      return this.http.get<SecMaterial[]>(endpoint);
    } else {
      // Use mock data with simulated delay
      return of(mockSecMaterials).pipe(delay(500));
    }
  }

  /**
   * Assign material to a work order
   */
  assignMaterialToWorkOrder(materialId: string, workOrderId: string, quantity: number): Observable<boolean> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = this.apiConfig.baseUrl + this.apiConfig.endpoints.assignToWorkOrder;

      return this.http.post<boolean>(endpoint, {
        materialId,
        workOrderId,
        quantity
      });
    } else {
      // Just return success with delay for mock
      console.log(`[MOCK] Assigned material ${materialId} to work order ${workOrderId} with quantity ${quantity}`);
      return of(true).pipe(delay(500));
    }
  }

  /**
   * Track material usage in a work order
   */
  trackMaterialUsage(materialId: string, workOrderId: string, quantity: number): Observable<boolean> {
    if (this.apiConfig.useRealApi) {
      // Use real API
      const endpoint = this.apiConfig.baseUrl + this.apiConfig.endpoints.trackUsage;

      return this.http.post<boolean>(endpoint, {
        materialId,
        workOrderId,
        quantity
      });
    } else {
      // Just return success with delay for mock
      console.log(`[MOCK] Tracked usage of material ${materialId} in work order ${workOrderId} with quantity ${quantity}`);
      return of(true).pipe(delay(500));
    }
  }
}
