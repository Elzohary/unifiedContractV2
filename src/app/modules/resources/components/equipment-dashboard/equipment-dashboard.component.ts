import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { EquipmentService } from '../../services/equipment.service';
import { StateService } from '../../../../core/services/state.service';
import { Equipment, EquipmentStatus } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="equipment-dashboard-container">
      <div class="header">
        <h1>Equipment Dashboard</h1>
        <button mat-raised-button color="primary" (click)="navigateToAdd()">
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

      <div class="dashboard-grid" *ngIf="!isLoading && !error">
        <mat-card class="status-card">
          <mat-card-header>
            <mat-card-title>Equipment Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-count">{{ getStatusCount(EquipmentStatus.Available) }}</span>
                <span class="status-label">Available</span>
              </div>
              <div class="status-item">
                <span class="status-count">{{ getStatusCount(EquipmentStatus.InUse) }}</span>
                <span class="status-label">In Use</span>
              </div>
              <div class="status-item">
                <span class="status-count">{{ getStatusCount(EquipmentStatus.Maintenance) }}</span>
                <span class="status-label">Maintenance</span>
              </div>
              <div class="status-item">
                <span class="status-count">{{ getStatusCount(EquipmentStatus.OutOfService) }}</span>
                <span class="status-label">Out of Service</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="maintenance-card">
          <mat-card-header>
            <mat-card-title>Upcoming Maintenance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="getUpcomingMaintenance()" class="maintenance-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Equipment</th>
                <td mat-cell *matCellDef="let item">{{ item.name }}</td>
              </ng-container>

              <ng-container matColumnDef="nextMaintenance">
                <th mat-header-cell *matHeaderCellDef>Next Maintenance</th>
                <td mat-cell *matCellDef="let item">{{ item.nextMaintenanceDate | date }}</td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let item">{{ item.nextMaintenanceType }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="maintenanceColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: maintenanceColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card class="recent-activity-card">
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="getRecentActivity()" class="activity-table">
              <ng-container matColumnDef="equipment">
                <th mat-header-cell *matHeaderCellDef>Equipment</th>
                <td mat-cell *matCellDef="let item">{{ item.name }}</td>
              </ng-container>

              <ng-container matColumnDef="activity">
                <th mat-header-cell *matHeaderCellDef>Activity</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip-set>
                    <mat-chip [color]="getActivityColor(item.status)" selected>
                      {{ item.status }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let item">{{ item.lastActivityDate | date }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="activityColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: activityColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .equipment-dashboard-container {
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

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      padding: 20px;
    }

    .status-item {
      text-align: center;
    }

    .status-count {
      display: block;
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .status-label {
      display: block;
      color: #666;
    }

    .maintenance-table, .activity-table {
      width: 100%;
      margin: 20px 0;
    }

    .mat-mdc-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
  `]
})
export class EquipmentDashboardComponent implements OnInit {
  private equipmentService = inject(EquipmentService);
  private stateService = inject(StateService);
  private router = inject(Router);

  equipment: Equipment[] = [];
  isLoading = false;
  error: string | null = null;
  maintenanceColumns: string[] = ['name', 'nextMaintenance', 'type'];
  activityColumns: string[] = ['equipment', 'activity', 'date'];
  EquipmentStatus = EquipmentStatus;

  ngOnInit() {
    this.loadEquipment();
  }

  private loadEquipment() {
    this.isLoading = true;
    this.equipmentService.getAllEquipment().subscribe({
      next: (equipment) => {
        this.equipment = equipment;
        this.stateService.updateEquipment(equipment);
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = err.message;
        this.stateService.setError(err.message);
        this.isLoading = false;
      }
    });
  }

  getStatusCount(status: EquipmentStatus): number {
    return this.equipment.filter(e => e.status === status).length;
  }

  getUpcomingMaintenance() {
    return this.equipment
      .filter(e => e.nextMaintenanceDate)
      .sort((a, b) => new Date(a.nextMaintenanceDate!).getTime() - new Date(b.nextMaintenanceDate!).getTime())
      .slice(0, 5);
  }

  getRecentActivity() {
    return this.equipment
      .filter(e => e.lastActivityDate)
      .sort((a, b) => new Date(b.lastActivityDate!).getTime() - new Date(a.lastActivityDate!).getTime())
      .slice(0, 5);
  }

  getActivityColor(status: EquipmentStatus): string {
    switch (status) {
      case EquipmentStatus.Available:
        return 'primary';
      case EquipmentStatus.InUse:
        return 'accent';
      case EquipmentStatus.Maintenance:
        return 'warn';
      case EquipmentStatus.OutOfService:
        return 'warn';
      default:
        return '';
    }
  }

  navigateToAdd() {
    this.router.navigate(['/equipment/add']);
  }
} 