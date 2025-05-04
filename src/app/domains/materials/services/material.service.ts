/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
   * Add a new material to the system
   */
  addMaterial(material: BaseMaterial): Observable<BaseMaterial> {
    return this.materialDataService.addMaterial(material).pipe(
      tap(() => {
        // Refresh the materials list after adding
        this.refreshMaterials();
      })
    );
  }

  /**
   * Update an existing material
   */
  updateMaterial(material: BaseMaterial): Observable<BaseMaterial> {
    return this.materialDataService.updateMaterial(material).pipe(
      tap(() => {
        // Refresh the materials list after updating
        this.refreshMaterials();
      })
    );
  }

  /**
   * Delete a material by ID
   */
  deleteMaterial(id: string): Observable<boolean> {
    return this.materialDataService.deleteMaterial(id).pipe(
      tap(() => {
        // Refresh the materials list after deleting
        this.refreshMaterials();
      })
    );
  }

  /**
   * Refresh the materials list from the data service
   */
  private refreshMaterials(): void {
    console.log('[DEBUG] Refreshing materials list');
    this.materialDataService.getAllMaterials().subscribe(materials => {
      console.log('[DEBUG] Got updated materials list. Count:', materials.length);
      this.materialsSubject.next(materials);
    });
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
