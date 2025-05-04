import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BaseMaterial, ClientType, MaterialType } from '../../models/material.model';
import { MaterialViewModel } from '../../viewModels/material.viewmodel';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-materials-management',
  templateUrl: './materials-management.component.html',
  styleUrls: ['./materials-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MaterialsManagementComponent implements OnInit {
  // Materials data
  materials$: Observable<BaseMaterial[]>;
  loading$: Observable<boolean>;

  // Enums for template
  materialTypes = MaterialType;
  clientTypes = ClientType;

  // Table columns
  displayedColumns: string[] = ['code', 'description', 'unit', 'materialType', 'clientType', 'actions'];

  constructor(private materialViewModel: MaterialViewModel) {
    this.materials$ = this.materialViewModel.filteredMaterials$;
    this.loading$ = this.materialViewModel.loading$;
  }

  ngOnInit(): void {
    // Load all materials initially
    this.materialViewModel.loadMaterials();
  }

  onFilterByMaterialType(materialType: MaterialType): void {
    this.materialViewModel.updateFilters({ materialType });
  }

  onFilterByClientType(clientType: ClientType): void {
    this.materialViewModel.updateFilters({ clientType });
    // Optionally reload from server with specific client type
    this.materialViewModel.loadMaterials(clientType);
  }

  onSearch(searchTerm: string): void {
    this.materialViewModel.updateFilters({ searchTerm });
  }

  onResetFilters(): void {
    this.materialViewModel.resetFilters();
  }
}
