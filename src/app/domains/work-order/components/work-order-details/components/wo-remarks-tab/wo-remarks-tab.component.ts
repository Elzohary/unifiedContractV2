import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WorkOrderRemark } from '../../../../models/work-order.model';
import { WorkOrderRemarksViewModel } from '../../../../viewModels/work-order-remarks.viewmodel';
import { RemarkDialogComponent } from '../../../../../../features/dashboards/dashboard-management/components/remark-dialog/remark-dialog.component';

@Component({
  selector: 'app-wo-remarks-tab',
  template: `
    <div class="remarks-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Remarks</mat-card-title>
          <button mat-raised-button color="primary" (click)="addRemark()">
            <mat-icon>add</mat-icon> Add Remark
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Filter controls -->
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Filter by type</mat-label>
              <mat-select (selectionChange)="onFilterTypeChange($event.value)">
                <mat-option value="">All Types</mat-option>
                <mat-option value="general">General</mat-option>
                <mat-option value="technical">Technical</mat-option>
                <mat-option value="safety">Safety</mat-option>
                <mat-option value="quality">Quality</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Search remarks</mat-label>
              <input matInput (input)="onSearchChange($event)" placeholder="Search by content or author">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
          
          <!-- Loading state -->
          <div class="loading-container" *ngIf="loading$ | async">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
          
          <!-- Remarks list -->
          <div class="remarks-list" *ngIf="(remarks$ | async) as remarks">
            <div *ngIf="remarks.length === 0" class="empty-state">
              <mat-icon>comment</mat-icon>
              <p>No remarks found</p>
            </div>
            
            <mat-list>
              <mat-list-item *ngFor="let remark of remarks" class="remark-item">
                <div class="remark-content">
                  <div class="remark-header">
                    <div class="remark-meta">
                      <strong>{{ remark.createdBy }}</strong>
                      <span class="date">{{ formatDate(remark.createdDate) }}</span>
                    </div>
                    <div class="remark-actions">
                      <mat-chip [ngClass]="getRemarkTypeClass(remark.type)">
                        {{ remark.type }}
                      </mat-chip>
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="editRemark(remark)">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </button>
                        <button mat-menu-item (click)="deleteRemark(remark.id)">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </div>
                  </div>
                  
                  <div class="remark-body">
                    <p>{{ remark.content }}</p>
                    <div class="people-involved" *ngIf="remark.peopleInvolved && remark.peopleInvolved.length > 0">
                      <mat-icon>people</mat-icon>
                      <span>Involved: {{ remark.peopleInvolved.join(', ') }}</span>
                    </div>
                  </div>
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .remarks-container {
      padding: 16px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .filters mat-form-field {
      flex: 1;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .remarks-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .remark-item {
      height: auto !important;
      padding: 16px 0 !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .remark-item:last-child {
      border-bottom: none;
    }

    .remark-content {
      width: 100%;
    }

    .remark-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .remark-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .date {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
    }

    .remark-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remark-body p {
      margin: 0 0 8px 0;
    }

    .people-involved {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
    }

    .people-involved mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .type-general { background-color: #90CAF9 !important; }
    .type-technical { background-color: #CE93D8 !important; }
    .type-safety { background-color: #FFAB91 !important; }
    .type-quality { background-color: #A5D6A7 !important; }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule
  ]
})
export class WoRemarksTabComponent implements OnInit {
  @Input() workOrderId!: string;
  
  remarks$: Observable<WorkOrderRemark[]>;
  loading$: Observable<boolean>;
  
  constructor(
    private remarksViewModel: WorkOrderRemarksViewModel,
    private dialog: MatDialog
  ) {
    this.remarks$ = this.remarksViewModel.remarks$;
    this.loading$ = this.remarksViewModel.loading$;
  }
  
  ngOnInit(): void {
    this.remarksViewModel.loadRemarksForWorkOrder(this.workOrderId);
  }
  
  addRemark(): void {
    const dialogRef = this.dialog.open(RemarkDialogComponent, {
      width: '550px',
      data: {
        title: 'Add New Remark',
        workOrderId: this.workOrderId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.remarksViewModel.addRemark({
          workOrderId: this.workOrderId,
          content: result.content,
          type: result.type,
          createdBy: result.createdBy || 'System User',
          peopleInvolved: result.peopleInvolved || []
        }).subscribe();
      }
    });
  }
  
  editRemark(remark: WorkOrderRemark): void {
    const dialogRef = this.dialog.open(RemarkDialogComponent, {
      width: '550px',
      data: {
        title: 'Edit Remark',
        remark: remark
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.remarksViewModel.updateRemark(remark.id, {
          content: result.content,
          type: result.type,
          peopleInvolved: result.peopleInvolved || []
        }).subscribe();
      }
    });
  }
  
  deleteRemark(remarkId: string): void {
    if (confirm('Are you sure you want to delete this remark?')) {
      this.remarksViewModel.deleteRemark(remarkId).subscribe();
    }
  }
  
  onFilterTypeChange(type: string): void {
    this.remarksViewModel.updateFilters({ type: type || undefined });
  }
  
  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.remarksViewModel.updateFilters({ searchTerm });
  }
  
  getRemarkTypeClass(type: string): string {
    return `type-${type}`;
  }
  
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 