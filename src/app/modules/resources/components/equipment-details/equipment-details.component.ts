import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="equipment-details-container">
      <div class="header">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
        <div class="actions">
          <button mat-button color="primary" (click)="editEquipment()">
            <mat-icon>edit</mat-icon>
            Edit
          </button>
          <button mat-button color="warn" (click)="deleteEquipment()">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
        </div>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="error-container" *ngIf="error">
        <p class="error-message">{{ error }}</p>
      </div>

      <mat-card *ngIf="equipment && !isLoading && !error" class="equipment-card">
        <mat-card-header>
          <mat-card-title>{{ equipment.name }}</mat-card-title>
          <mat-card-subtitle>
            <span [class]="'status-badge ' + equipment.status">
              {{ equipment.status }}
            </span>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="details-grid">
            <div class="detail-item">
              <h3>Basic Information</h3>
              <p><strong>Type:</strong> {{ equipment.type }}</p>
              <p><strong>Model:</strong> {{ equipment.model }}</p>
              <p><strong>Serial Number:</strong> {{ equipment.serialNumber }}</p>
              <p><strong>Manufacturer:</strong> {{ equipment.manufacturer }}</p>
            </div>

            <div class="detail-item">
              <h3>Location & Department</h3>
              <p><strong>Department:</strong> {{ equipment.department }}</p>
              <p><strong>Location:</strong> {{ equipment.location }}</p>
            </div>

            <div class="detail-item">
              <h3>Financial Information</h3>
              <p><strong>Purchase Date:</strong> {{ equipment.purchaseDate | date }}</p>
              <p><strong>Purchase Cost:</strong> {{ equipment.purchaseCost | currency }}</p>
              <p><strong>Current Value:</strong> {{ equipment.currentValue | currency }}</p>
            </div>

            <div class="detail-item">
              <h3>Maintenance</h3>
              <p><strong>Last Inspection:</strong> {{ equipment.lastInspectionDate | date }}</p>
              <p><strong>Next Inspection:</strong> {{ equipment.nextInspectionDate | date }}</p>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="specifications">
            <h3>Specifications</h3>
            <div class="specs-grid">
              <div *ngFor="let spec of getSpecifications()" class="spec-item">
                <strong>{{ spec.key }}:</strong> {{ spec.value }}
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="current-assignment" *ngIf="equipment.currentAssignment">
            <h3>Current Assignment</h3>
            <p><strong>Work Order:</strong> {{ equipment.currentAssignment.workOrderId }}</p>
            <p><strong>Start Date:</strong> {{ equipment.currentAssignment.startDate | date }}</p>
            <p><strong>Status:</strong> {{ equipment.currentAssignment.status }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .equipment-details-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .error-container {
      padding: 20px;
      text-align: center;
    }

    .error-message {
      color: #f44336;
    }

    .equipment-card {
      max-width: 1200px;
      margin: 0 auto;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .detail-item {
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .specifications {
      margin: 20px 0;
    }

    .specs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .spec-item {
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .current-assignment {
      margin-top: 20px;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.available {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.in_use {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-badge.maintenance {
      background-color: #fff3e0;
      color: #e65100;
    }

    .status-badge.out_of_service {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class EquipmentDetailsComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private stateService = inject(StateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  equipment: Equipment | null = null;
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEquipment(id);
    }
  }

  private loadEquipment(id: string) {
    this.isLoading = true;
    this.equipmentService.getEquipmentById(id).subscribe({
      next: (equipment) => {
        this.equipment = equipment;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      }
    });
  }

  getSpecifications() {
    if (!this.equipment?.specifications) return [];
    return Object.entries(this.equipment.specifications).map(([key, value]) => ({
      key: this.formatKey(key),
      value: value
    }));
  }

  private formatKey(key: string): string {
    return key.split(/(?=[A-Z])/).join(' ').toLowerCase()
      .split('_').join(' ')
      .replace(/^\w/, c => c.toUpperCase());
  }

  goBack() {
    this.router.navigate(['/equipment']);
  }

  editEquipment() {
    if (this.equipment) {
      this.router.navigate(['/equipment', this.equipment.id, 'edit']);
    }
  }

  deleteEquipment() {
    if (this.equipment && confirm('Are you sure you want to delete this equipment?')) {
      this.equipmentService.deleteEquipment(this.equipment.id).subscribe({
        next: () => {
          this.router.navigate(['/equipment']);
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }
} 