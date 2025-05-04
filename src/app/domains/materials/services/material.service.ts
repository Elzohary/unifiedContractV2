/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMaterial, ClientType, MaterialType, SecMaterial, convertLegacySecMaterial } from '../models/material.model';
import { MaterialDataService } from './material-data.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private materialsSubject = new BehaviorSubject<BaseMaterial[]>([]);
  public materials$ = this.materialsSubject.asObservable();

  constructor(private materialDataService: MaterialDataService) {}

  /**
   * Load materials from the server based on client type
   */
  loadMaterials(clientType?: ClientType): Observable<BaseMaterial[]> {
    return this.materialDataService.getAllMaterials(clientType).pipe(
      map(materials => {
        this.materialsSubject.next(materials);
        return materials;
      })
    );
  }

  /**
   * Format materials based on client type
   */
  private formatMaterialsByClientType(materials: any[], clientType?: ClientType): BaseMaterial[] {
    if (clientType === ClientType.SEC) {
      return materials.map(m => convertLegacySecMaterial(m));
    }

    // Handle other client types as needed
    return materials.map(m => ({
      ...m,
      clientType: m.clientType || ClientType.OTHER
    }));
  }

  /**
   * Get materials filtered by type
   */
  getMaterialsByType(materialType: MaterialType): Observable<BaseMaterial[]> {
    return this.materialDataService.getMaterialsByType(materialType);
  }

  /**
   * Get SEC materials specifically
   */
  getSecMaterials(): Observable<SecMaterial[]> {
    return this.materialDataService.getSecMaterials();
  }

  /**
   * Assign material to a work order
   */
  assignMaterialToWorkOrder(materialId: string, workOrderId: string, quantity: number): Observable<boolean> {
    return this.materialDataService.assignMaterialToWorkOrder(materialId, workOrderId, quantity);
  }

  /**
   * Track material usage in a work order
   */
  trackMaterialUsage(materialId: string, workOrderId: string, quantity: number): Observable<boolean> {
    return this.materialDataService.trackMaterialUsage(materialId, workOrderId, quantity);
  }
}
