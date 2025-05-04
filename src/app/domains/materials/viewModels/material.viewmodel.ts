import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMaterial, ClientType, MaterialType } from '../models/material.model';
import { MaterialService } from '../services/material.service';

export interface MaterialFilters {
  materialType?: MaterialType;
  clientType?: ClientType;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialViewModel {
  // Filters
  private filtersSubject = new BehaviorSubject<MaterialFilters>({});
  public filters$ = this.filtersSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Filtered materials
  public filteredMaterials$: Observable<BaseMaterial[]>;

  constructor(private materialService: MaterialService) {
    // Combine materials with filters to get filtered materials
    this.filteredMaterials$ = combineLatest([
      this.materialService.materials$,
      this.filters$
    ]).pipe(
      map(([materials, filters]) => this.applyFilters(materials, filters))
    );
  }

  /**
   * Load materials with optional client type filter
   */
  loadMaterials(clientType?: ClientType): void {
    this.loadingSubject.next(true);
    this.materialService.loadMaterials(clientType).subscribe({
      next: () => this.loadingSubject.next(false),
      error: () => this.loadingSubject.next(false)
    });
  }

  /**
   * Update filters
   */
  updateFilters(filters: Partial<MaterialFilters>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.getValue(),
      ...filters
    });
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filtersSubject.next({});
  }

  /**
   * Apply filters to materials
   */
  private applyFilters(materials: BaseMaterial[], filters: MaterialFilters): BaseMaterial[] {
    let filtered = [...materials];

    // Filter by material type
    if (filters.materialType) {
      filtered = filtered.filter(m => m.materialType === filters.materialType);
    }

    // Filter by client type
    if (filters.clientType) {
      filtered = filtered.filter(m => m.clientType === filters.clientType);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.code.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }
}
