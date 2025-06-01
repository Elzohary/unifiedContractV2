import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WorkOrderIssue } from '../../../../../models/work-order.model';

export interface IssueDialogData {
  issue?: WorkOrderIssue;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-issue-dialog',
  templateUrl: './issue-dialog.component.html',
  styleUrls: ['./issue-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class IssueDialogComponent {
  issueForm: FormGroup;
  isEditMode: boolean;

  priorities = [
    { value: 'low', label: 'Low', icon: 'low_priority', color: 'primary' },
    { value: 'medium', label: 'Medium', icon: 'priority_high', color: 'accent' },
    { value: 'high', label: 'High', icon: 'warning', color: 'warn' }
  ];

  severities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  statuses = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<IssueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IssueDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.issueForm = this.createForm();
    
    if (this.isEditMode && data.issue) {
      this.populateForm(data.issue);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      priority: ['medium', Validators.required],
      severity: ['medium', Validators.required],
      status: ['open', Validators.required],
      reportedBy: ['', [Validators.required, Validators.maxLength(100)]],
      assignedTo: ['', Validators.maxLength(100)]
    });
  }

  private populateForm(issue: WorkOrderIssue): void {
    this.issueForm.patchValue({
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      severity: issue.severity,
      status: issue.status,
      reportedBy: issue.reportedBy,
      assignedTo: issue.assignedTo || ''
    });
  }

  onSubmit(): void {
    if (this.issueForm.valid) {
      const formValue = this.issueForm.value;
      
      const issueData: Partial<WorkOrderIssue> = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        severity: formValue.severity,
        status: formValue.status,
        reportedBy: formValue.reportedBy,
        assignedTo: formValue.assignedTo || undefined
      };

      if (this.isEditMode && this.data.issue) {
        issueData.id = this.data.issue.id;
        issueData.reportedDate = this.data.issue.reportedDate;
      }

      this.dialogRef.close(issueData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.issueForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be less than ${maxLength} characters`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      title: 'Title',
      description: 'Description',
      priority: 'Priority',
      severity: 'Severity',
      status: 'Status',
      reportedBy: 'Reported By',
      assignedTo: 'Assigned To'
    };
    return labels[fieldName] || fieldName;
  }
} 