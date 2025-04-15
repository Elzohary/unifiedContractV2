import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { WorkOrder, WorkOrderRemark, User } from '../../../../../shared/models/work-order.model';
import { Observable, map, startWith } from 'rxjs';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmployeeService } from '../../../../../shared/services/employee.service';
import { Employee } from '../../../../../shared/models/employee.model';

interface DialogData {
  title: string;
  remark?: WorkOrderRemark;
  workOrders: WorkOrder[];
  users: User[];
}

@Component({
  selector: 'app-remark-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="remarkForm">
        <!-- Work Order Field with Search -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Work Order</mat-label>
          <input 
            #workOrderInput
            type="text"
            placeholder="Search work orders"
            matInput 
            formControlName="workOrderId"
            [matAutocomplete]="workOrderAuto">
          <button 
            *ngIf="remarkForm.get('workOrderId')?.value" 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="clearWorkOrder()"
            aria-label="Clear">
            <mat-icon>close</mat-icon>
          </button>
          <mat-autocomplete 
            #workOrderAuto="matAutocomplete" 
            [displayWith]="displayWorkOrder" 
            (optionSelected)="onWorkOrderSelected($event)"
            [autoActiveFirstOption]="false">
            <mat-option *ngFor="let workOrder of filteredWorkOrders | async" [value]="workOrder.id">
              {{ workOrder.id | uppercase }} - {{ workOrder.title }}
            </mat-option>
          </mat-autocomplete>
          <mat-error *ngIf="remarkForm.get('workOrderId')?.hasError('required')">
            Work order is required
          </mat-error>
        </mat-form-field>
        
        <!-- Remark Type Field with Custom Input -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="general">General</mat-option>
            <mat-option value="technical">Technical</mat-option>
            <mat-option value="safety">Safety</mat-option>
            <mat-option value="quality">Quality</mat-option>
            <mat-option value="client-communication">Client Communication</mat-option>
            <mat-option value="internal-communication">Internal Communication</mat-option>
            <mat-option value="feedback">Feedback</mat-option>
            <mat-option value="custom">Custom Type...</mat-option>
          </mat-select>
          <mat-error *ngIf="remarkForm.get('type')?.hasError('required')">
            Type is required
          </mat-error>
        </mat-form-field>
        
        <!-- Custom Type Input (shown conditionally) -->
        <mat-form-field *ngIf="remarkForm.get('type')?.value === 'custom'" appearance="outline" class="full-width">
          <mat-label>Custom Type</mat-label>
          <input matInput formControlName="customType" placeholder="Enter custom type" required>
          <mat-error *ngIf="remarkForm.get('customType')?.hasError('required')">
            Custom type is required
          </mat-error>
        </mat-form-field>
        
        <!-- People Involved Field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>People Involved</mat-label>
          <mat-chip-grid #chipGrid aria-label="People selection">
            <mat-chip-row 
              *ngFor="let person of selectedPeople" 
              (removed)="removePerson(person)"
              [editable]="false"
              [removable]="true">
              {{ person.name }}
              <button matChipRemove [attr.aria-label]="'remove ' + person.name">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input 
              placeholder="Search for people..."
              [matChipInputFor]="chipGrid"
              [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
              [matChipInputAddOnBlur]="true"
              (matChipInputTokenEnd)="add($event)"
              [matAutocomplete]="peopleAuto"
              [formControl]="peopleCtrl"/>
            <mat-autocomplete #peopleAuto="matAutocomplete" (optionSelected)="selected($event)">
              <mat-option *ngFor="let person of filteredPeople | async" [value]="person">
                {{ person.name }} ({{ person.role }})
              </mat-option>
            </mat-autocomplete>
          </mat-chip-grid>
        </mat-form-field>
        
        <!-- Send Notifications Option -->
        <div class="notification-option">
          <mat-checkbox formControlName="sendNotifications" color="primary">
            Send notifications to people involved
          </mat-checkbox>
        </div>
        
        <!-- Remark Content Field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Content</mat-label>
          <textarea 
            matInput 
            formControlName="content" 
            placeholder="Enter remark details..." 
            rows="5" 
            required>
          </textarea>
          <mat-error *ngIf="remarkForm.get('content')?.hasError('required')">
            Content is required
          </mat-error>
          <mat-error *ngIf="remarkForm.get('content')?.hasError('maxlength')">
            Content cannot exceed 1000 characters
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="remarkForm.invalid || (remarkForm.get('type')?.value === 'custom' && !remarkForm.get('customType')?.value)" 
        [mat-dialog-close]="prepareRemarkData()">
        {{ data.remark ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    mat-dialog-content {
      min-width: 400px;
      padding: 24px;
      background-color: var(--card-background);
      border-radius: 8px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    h2[mat-dialog-title] {
      margin: 0;
      padding: 24px 24px 0;
      font-size: 24px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    textarea {
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
      line-height: 1.6;
      padding: 12px;
      font-size: 14px;
    }
    
    .notification-option {
      margin-bottom: 20px;
      padding: 8px 0;
      color: var(--text-primary);
      
      mat-checkbox {
        font-size: 14px;
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      border-top: 1px solid var(--border-color);
      background-color: var(--card-background);
      border-radius: 0 0 8px 8px;
      gap: 12px;
      
      button {
        min-width: 100px;
        font-weight: 500;
        
        &[color="primary"] {
          background-color: var(--primary);
          color: white;
          
          &:disabled {
            background-color: var(--disabled-background);
            color: var(--disabled-text);
          }
        }
      }
    }
    
    ::ng-deep {
      .mat-mdc-form-field {
        background-color: transparent;
        
        .mat-mdc-form-field-wrapper {
          padding-bottom: 0;
        }
        
        .mat-mdc-form-field-subscript-wrapper {
          margin-top: 4px;
        }
        
        .mat-mdc-form-field-infix {
          padding: 12px 0;
          min-height: 48px;
        }
        
        .mat-mdc-text-field-wrapper {
          background-color: var(--input-background);
          border-radius: 8px;
          
          &.mdc-text-field--outlined {
            --mdc-outlined-text-field-container-height: auto;
            
            .mdc-notched-outline__leading,
            .mdc-notched-outline__trailing {
              border-color: var(--border-color);
            }
          }
        }
        
        .mat-mdc-form-field-label-wrapper {
          top: -0.75em;
          
          .mat-mdc-form-field-label {
            font-size: 14px;
          }
        }
        
        &.mat-focused {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__trailing {
            border-color: var(--primary) !important;
          }
        }
      }
      
      .mat-mdc-chip-grid {
        width: 100%;
        padding: 8px 0;
        background-color: transparent;
        min-height: 48px;
        
        .mat-mdc-chip {
          margin: 4px;
          background-color: var(--primary-light);
          color: var(--primary);
          border-radius: 16px;
          height: 32px;
          font-size: 14px;
          transition: all 0.2s ease;
          
          &:hover {
            background-color: var(--primary);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .mat-mdc-chip-remove {
            color: currentColor;
            opacity: 0.7;
            
            &:hover {
              opacity: 1;
            }
          }
        }
        
        input {
          margin: 8px;
          height: 32px;
          font-size: 14px;
          
          &::placeholder {
            color: var(--text-secondary);
          }
        }
      }
      
      .mat-mdc-select-panel {
        background-color: var(--card-background);
        border-radius: 8px;
        
        .mat-mdc-option {
          min-height: 40px;
          font-size: 14px;
          
          &.mat-mdc-option-active {
            background-color: var(--primary-light);
          }
          
          &.mat-mdc-selected:not(.mat-mdc-option-multiple) {
            background-color: var(--primary);
            color: white;
          }
        }
      }
      
      .mat-mdc-autocomplete-panel {
        background-color: var(--card-background);
        border-radius: 8px;
        
        .mat-mdc-option {
          min-height: 40px;
          font-size: 14px;
          
          &.mat-mdc-option-active {
            background-color: var(--primary-light);
          }
        }
      }
    }
    
    @media (max-width: 599px) {
      mat-dialog-content {
        min-width: unset;
        padding: 16px;
      }
      
      h2[mat-dialog-title] {
        padding: 16px 16px 0;
        font-size: 20px;
      }
      
      mat-dialog-actions {
        padding: 16px;
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class RemarkDialogComponent implements OnInit {
  remarkForm: FormGroup;
  
  // For people chips
  separatorKeysCodes: number[] = [ENTER, COMMA];
  peopleCtrl = new FormControl('');
  filteredPeople: Observable<User[]>;
  selectedPeople: User[] = [];
  employees: Employee[] = [];
  
  // For work order search
  filteredWorkOrders: Observable<WorkOrder[]>;
  
  @ViewChild('workOrderInput') workOrderInput!: ElementRef<HTMLInputElement>;
  @ViewChild('workOrderAuto') workOrderAutocomplete!: MatAutocomplete;
  
  constructor(
    public dialogRef: MatDialogRef<RemarkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private announcer: LiveAnnouncer,
    private employeeService: EmployeeService
  ) {
    this.remarkForm = this.fb.group({
      workOrderId: ['', Validators.required],
      type: ['general', Validators.required],
      customType: [''],
      content: ['', [Validators.required, Validators.maxLength(1000)]],
      sendNotifications: [true]
    });
    
    // Filter for people autocomplete
    this.filteredPeople = this.peopleCtrl.valueChanges.pipe(
      startWith(null),
      map((userInput: string | User | null) => {
        if (userInput === null) {
          return this.filterAvailablePeople('');
        }
        
        const name = typeof userInput === 'string' ? userInput : userInput.name;
        return this.filterAvailablePeople(name);
      }),
    );
    
    // Filter for work orders autocomplete
    this.filteredWorkOrders = this.remarkForm.get('workOrderId')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : '';
        return this.filterWorkOrders(name);
      })
    );
  }
  
  ngOnInit(): void {
    // Get employees from the employee service
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
      
      // Map employees to User format for compatibility with proper role conversion
      const employeeUsers = this.employees.map(emp => {
        // Convert employee job titles to User role types
        let role: 'administrator' | 'engineer' | 'foreman' | 'worker' = 'worker';
        
        // Map job titles to appropriate roles based on keywords
        const jobTitle = emp.jobTitle.toLowerCase();
        if (jobTitle.includes('director') || jobTitle.includes('manager') || jobTitle.includes('admin')) {
          role = 'administrator';
        } else if (jobTitle.includes('engineer')) {
          role = 'engineer';
        } else if (jobTitle.includes('foreman') || jobTitle.includes('supervisor') || jobTitle.includes('lead')) {
          role = 'foreman';
        }
        
        return {
          id: emp.id,
          name: emp.name,
          role: role,
          email: emp.user?.email || ''
        };
      });
      
      // Replace the mock users with employees
      this.data.users = employeeUsers;
    });
    
    // If editing an existing remark, populate the form
    if (this.data.remark) {
      // Initialize basic fields
      this.remarkForm.patchValue({
        workOrderId: this.data.remark.workOrderId,
        content: this.data.remark.content,
        sendNotifications: true
      });
      
      // Handle custom type
      if (['general', 'technical', 'safety', 'quality', 'client-communication', 
           'internal-communication', 'feedback'].includes(this.data.remark.type)) {
        this.remarkForm.patchValue({ type: this.data.remark.type });
      } else {
        this.remarkForm.patchValue({ 
          type: 'custom',
          customType: this.data.remark.type
        });
      }
      
      // Load people involved if available
      if (this.data.remark.peopleInvolved && this.data.remark.peopleInvolved.length > 0) {
        this.selectedPeople = this.data.users.filter(user => 
          this.data.remark!.peopleInvolved!.includes(user.id)
        );
      }
    }
    
    // Watch for type changes to validate custom type
    this.remarkForm.get('type')!.valueChanges.subscribe(value => {
      const customTypeControl = this.remarkForm.get('customType');
      if (value === 'custom') {
        customTypeControl!.setValidators(Validators.required);
      } else {
        customTypeControl!.clearValidators();
      }
      customTypeControl!.updateValueAndValidity();
    });
  }
  
  // Methods for people chips
  add(event: any): void {
    // This method can be implemented to handle manual entry, but for now
    // we'll rely on autocomplete selection only
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedUser = event.option.value as User;
    if (!this.selectedPeople.some(person => person.id === selectedUser.id)) {
      this.selectedPeople.push(selectedUser);
      this.announcer.announce(`Added ${selectedUser.name}`);
    }
    this.peopleCtrl.setValue(null);
  }

  removePerson(person: User): void {
    const index = this.selectedPeople.findIndex(p => p.id === person.id);
    if (index >= 0) {
      this.selectedPeople.splice(index, 1);
      this.announcer.announce(`Removed ${person.name}`);
    }
  }
  
  // Work order display and filtering
  displayWorkOrder = (workOrderId: string): string => {
    if (!workOrderId) return '';
    const workOrder = this.data.workOrders.find(wo => wo.id === workOrderId);
    return workOrder ? `${workOrder.id.toUpperCase()} - ${workOrder.title}` : '';
  }
  
  filterWorkOrders(value: string): WorkOrder[] {
    const filterValue = value.toLowerCase();
    return this.data.workOrders.filter(workOrder => 
      workOrder.id.toLowerCase().includes(filterValue) || 
      workOrder.title.toLowerCase().includes(filterValue) ||
      workOrder.orderNumber.toLowerCase().includes(filterValue)
    );
  }
  
  // Filter available people (excluding already selected)
  filterAvailablePeople(value: string): User[] {
    const filterValue = value.toLowerCase();
    
    // First filter out already selected people
    // Then filter by name or role containing the search term
    return this.data.users
      .filter(user => !this.selectedPeople.some(person => person.id === user.id))
      .filter(user => 
        user.name.toLowerCase().includes(filterValue) || 
        user.role.toLowerCase().includes(filterValue)
      );
  }
  
  // Clear work order selection
  clearWorkOrder(): void {
    this.remarkForm.get('workOrderId')?.setValue('');
    setTimeout(() => {
      this.workOrderInput.nativeElement.focus();
    });
  }
  
  // Handle work order selection
  onWorkOrderSelected(event: MatAutocompleteSelectedEvent): void {
    // Update the form value
    this.remarkForm.get('workOrderId')?.setValue(event.option.value);
    
    // Close the panel and blur the input
    this.workOrderAutocomplete.options.forEach(option => option.deselect());
    this.workOrderInput.nativeElement.blur();
  }
  
  // Prepare final data for submission
  prepareRemarkData(): any {
    const formValue = this.remarkForm.value;
    
    // Determine the actual type value (standard or custom)
    const finalType = formValue.type === 'custom' 
      ? formValue.customType 
      : formValue.type;
    
    return {
      workOrderId: formValue.workOrderId,
      type: finalType,
      content: formValue.content,
      peopleInvolved: this.selectedPeople.map(person => person.id),
      sendNotifications: formValue.sendNotifications,
      createdBy: 'Current User', // This should be replaced with the actual logged-in user
      createdDate: new Date().toISOString() // Current date
    };
  }
} 