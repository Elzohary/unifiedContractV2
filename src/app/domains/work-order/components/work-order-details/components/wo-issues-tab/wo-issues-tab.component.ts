import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Models and ViewModels
import { WorkOrderIssue } from '../../../../models/work-order.model';
import { WorkOrderIssuesViewModel } from '../../../../viewModels/work-order-issues.viewmodel';
import { IssueDialogComponent, IssueDialogData } from './issue-dialog/issue-dialog.component';
import { ResolveIssueDialogComponent, ResolveIssueDialogData } from './resolve-issue-dialog/resolve-issue-dialog.component';

@Component({
  selector: 'app-wo-issues-tab',
  templateUrl: './wo-issues-tab.component.html',
  styleUrls: ['./wo-issues-tab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class WoIssuesTabComponent implements OnInit {
  @Input() workOrderId!: string;
  
  issues$: Observable<WorkOrderIssue[]>;
  loading$: Observable<boolean>;
  openIssuesCount$: Observable<number>;
  
  constructor(
    private issuesViewModel: WorkOrderIssuesViewModel,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.issues$ = this.issuesViewModel.issues$;
    this.loading$ = this.issuesViewModel.loading$;
    this.openIssuesCount$ = this.issuesViewModel.openIssuesCount$;
  }
  
  ngOnInit(): void {
    this.issuesViewModel.loadIssuesForWorkOrder(this.workOrderId);
  }
  
  addIssue(): void {
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      width: '600px',
      data: {
        mode: 'create'
      } as IssueDialogData
    });

    dialogRef.afterClosed().subscribe((result: Partial<WorkOrderIssue>) => {
      if (result) {
        this.issuesViewModel.addIssue(result as Omit<WorkOrderIssue, 'id'>).subscribe(success => {
          if (success) {
            this.snackBar.open('Issue reported successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to report issue', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  editIssue(issue: WorkOrderIssue): void {
    const dialogRef = this.dialog.open(IssueDialogComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        issue: issue
      } as IssueDialogData
    });

    dialogRef.afterClosed().subscribe((result: Partial<WorkOrderIssue>) => {
      if (result) {
        this.issuesViewModel.updateIssue(issue.id, result).subscribe(success => {
          if (success) {
            this.snackBar.open('Issue updated successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to update issue', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  resolveIssue(issue: WorkOrderIssue): void {
    const dialogRef = this.dialog.open(ResolveIssueDialogComponent, {
      width: '500px',
      data: {
        issue: issue
      } as ResolveIssueDialogData
    });

    dialogRef.afterClosed().subscribe((resolutionNotes: string) => {
      if (resolutionNotes) {
        this.issuesViewModel.resolveIssue(issue.id, resolutionNotes).subscribe(success => {
          if (success) {
            this.snackBar.open('Issue resolved successfully', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Failed to resolve issue', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  closeIssue(issue: WorkOrderIssue): void {
    this.issuesViewModel.updateIssue(issue.id, { status: 'closed' }).subscribe(success => {
      if (success) {
        this.snackBar.open('Issue closed successfully', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Failed to close issue', 'Close', { duration: 3000 });
      }
    });
  }
  
  deleteIssue(issueId: string): void {
    if (confirm('Are you sure you want to delete this issue?')) {
      this.issuesViewModel.deleteIssue(issueId).subscribe(success => {
        if (success) {
          this.snackBar.open('Issue deleted successfully', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to delete issue', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  onFilterStatusChange(status: string): void {
    this.issuesViewModel.updateFilters({ 
      status: status ? status as 'open' | 'in-progress' | 'resolved' | 'closed' : undefined 
    });
  }
  
  onFilterPriorityChange(priority: string): void {
    this.issuesViewModel.updateFilters({ 
      priority: priority ? priority as 'low' | 'medium' | 'high' : undefined 
    });
  }
  
  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.issuesViewModel.updateFilters({ searchTerm });
  }
  
  getPriorityColor(priority: string): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      default: return 'primary';
    }
  }
  
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return 'warning';
      case 'medium': return 'priority_high';
      default: return 'low_priority';
    }
  }
  
  getStatusClass(status: string): string {
    return `status-${status}`;
  }
  
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 