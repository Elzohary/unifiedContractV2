import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="equipment-list-container">
      <div class="header">
        <h2>Equipment List</h2>
        <button mat-raised-button color="primary" routerLink="new">
          <mat-icon>add</mat-icon>
          Add Equipment
        </button>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="error-container" *ngIf="error">
        <p class="error-message">{{ error }}</p>
      </div>

      <div class="table-container" *ngIf="!isLoading && !error">
        <table mat-table [dataSource]="equipment" class="equipment-table">
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let item">{{ item.id }}</td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let item">{{ item.name }}</td>
          </ng-container>

          <!-- Type Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let item">{{ item.type }}</td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let item">
              <span [class]="'status-badge ' + item.status">
                {{ item.status }}
              </span>
            </td>
          </ng-container>

          <!-- Department Column -->
          <ng-container matColumnDef="department">
            <th mat-header-cell *matHeaderCellDef>Department</th>
            <td mat-cell *matCellDef="let item">{{ item.department }}</td>
          </ng-container>

          <!-- Location Column -->
          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Location</th>
            <td mat-cell *matCellDef="let item">{{ item.location }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let item">
              <button mat-icon-button [routerLink]="[item.id]" matTooltip="View Details">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="[item.id, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="[item.id, 'maintenance']" matTooltip="Maintenance">
                <mat-icon>build</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .equipment-list-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
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

    .table-container {
      overflow-x: auto;
    }

    .equipment-table {
      width: 100%;
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

    .mat-column-actions {
      width: 120px;
      text-align: center;
    }
  `]
})
export class EquipmentListComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private stateService = inject(StateService);

  equipment: Equipment[] = [];
  displayedColumns: string[] = ['id', 'name', 'type', 'status', 'department', 'location', 'actions'];
  isLoading = false;
  error: string | null = null;

  ngOnInit() {
    this.loadEquipment();
  }

  private loadEquipment() {
    this.isLoading = true;
    this.equipmentService.getAllEquipment().subscribe({
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
} 