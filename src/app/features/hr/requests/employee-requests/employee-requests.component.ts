import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Employee, EmployeeRequest } from '../../../../core/models/employee.model';
import { DataRepositoryService } from '../../../../core/services/data-repository.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { finalize, first, catchError, of, forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-employee-requests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './employee-requests.component.html',
  styleUrls: ['./employee-requests.component.scss']
})
export class EmployeeRequestsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  requestForm!: FormGroup;
  
  employees: Employee[] = [];
  employeeRequests: EmployeeRequest[] = [];
  
  displayedColumns: string[] = ['employee', 'type', 'startDate', 'endDate', 'reason', 'status', 'actions'];
  displayedColumnsWithoutEmployee: string[] = ['type', 'startDate', 'endDate', 'reason', 'status', 'actions'];
  
  // For single employee mode
  singleEmployeeMode = false;
  currentEmployee: Employee | null = null;
  
  // Request types
  requestTypes = [
    { value: 'vacation', label: 'Vacation', color: 'primary' },
    { value: 'sickLeave', label: 'Sick Leave', color: 'accent' },
    { value: 'remote', label: 'Remote Work', color: 'primary' },
    { value: 'permission', label: 'Permission', color: 'primary' },
    { value: 'resignation', label: 'Resignation', color: 'warn' },
    { value: 'other', label: 'Other', color: 'basic' }
  ];
  
  // Status options
  statusOptions = [
    { value: 'pending', label: 'Pending', color: 'accent' },
    { value: 'approved', label: 'Approved', color: 'primary' },
    { value: 'rejected', label: 'Rejected', color: 'warn' }
  ];
  
  // Current selected filters
  statusFilter: string = 'all';
  employeeFilter: string = 'all';
  typeFilter: string = 'all';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dataRepository: DataRepositoryService,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Check if we're in single employee mode
    this.route.params.subscribe(params => {
      const employeeId = params['id'];
      if (employeeId) {
        this.singleEmployeeMode = true;
        this.loadSingleEmployee(employeeId);
      } else {
        this.loadEmployees();
      }
    });
    
    this.initForm();
  }
  
  initForm(): void {
    this.requestForm = this.fb.group({
      employeeId: ['', Validators.required],
      type: ['vacation', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      details: [''],
      status: ['pending']
    });
  }
  
  loadSingleEmployee(employeeId: string): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dataRepository.getEmployeeById(employeeId)
      .pipe(
        first(),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = `Failed to load employee: ${err.message || 'Unknown error'}`;
          return of(null);
        })
      )
      .subscribe(employee => {
        if (employee) {
          this.currentEmployee = employee;
          this.employees = [employee]; // Set employees array to just this employee
          
          // Pre-select this employee in the form
          this.requestForm.patchValue({
            employeeId: employee.id
          });
          
          // Disable the employee selection field
          this.requestForm.get('employeeId')?.disable();
          
          // Load this employee's requests
          this.loadEmployeeRequests(employee.id);
        } else {
          this.router.navigate(['/hr/requests']);
        }
      });
  }
  
  loadEmployees(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.dataRepository.getEmployees()
      .pipe(
        first(),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = `Failed to load employees: ${err.message || 'Unknown error'}`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(employees => {
        this.employees = employees;
        this.loadAllRequests();
      });
  }
  
  loadEmployeeRequests(employeeId: string): void {
    this.isLoading = true;
    
    this.employeeService.getEmployeeRequests(employeeId)
      .pipe(
        first(),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = `Failed to load requests: ${err.message || 'Unknown error'}`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(requests => {
        this.employeeRequests = requests;
        
        // Sort by date (newest first)
        this.employeeRequests.sort((a, b) => {
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        });
      });
  }
  
  loadAllRequests(): void {
    this.isLoading = true;
    this.hasError = false;
    
    // Get requests for all employees
    const requests = this.employees.map(employee => 
      this.employeeService.getEmployeeRequests(employee.id)
        .pipe(
          catchError(err => {
            console.error(`Error loading requests for employee ${employee.id}:`, err);
            return of([]);
          })
        )
    );
    
    if (requests.length === 0) {
      this.employeeRequests = [];
      this.isLoading = false;
      return;
    }
    
    forkJoin(requests)
      .pipe(
        map(results => {
          // Flatten the array of arrays with proper typing
          return results.reduce<EmployeeRequest[]>((acc, val) => acc.concat(val as EmployeeRequest[]), [] as EmployeeRequest[]);
        }),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = `Failed to load employee requests: ${err.message || 'Unknown error'}`;
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(requests => {
        this.employeeRequests = requests;
        
        // Sort by date (newest first)
        this.employeeRequests.sort((a, b) => {
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        });
      });
  }
  
  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.markFormGroupTouched(this.requestForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    const formValues = this.requestForm.getRawValue(); // Use getRawValue to include disabled controls
    
    // Find the employee
    const employee = this.employees.find(emp => emp.id === formValues.employeeId);
    if (!employee) {
      this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }
    
    // Validate date range
    const startDate = new Date(formValues.startDate);
    const endDate = new Date(formValues.endDate);
    
    if (endDate < startDate) {
      this.snackBar.open('End date cannot be before start date', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }
    
    // Create request object
    const requestObj: EmployeeRequest = {
      id: '',
      employee: employee,
      type: formValues.type,
      requestDate: new Date(),
      startDate: startDate,
      endDate: endDate,
      reason: formValues.reason,
      details: formValues.details || '',
      status: 'pending',
      responseDate: null,
      responseBy: null,
      responseNotes: ''
    };
    
    this.employeeService.addEmployeeRequest(employee.id, requestObj)
      .pipe(
        first(),
        catchError(err => {
          this.snackBar.open(`Error: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(result => {
        if (result) {
          this.snackBar.open('Request submitted successfully', 'Close', { duration: 3000 });
          
          // Reset the form
          this.resetRequestForm();
          
          // Reload requests
          if (this.singleEmployeeMode && this.currentEmployee) {
            this.loadEmployeeRequests(this.currentEmployee.id);
          } else {
            this.loadAllRequests();
          }
        }
      });
  }
  
  approveRequest(request: EmployeeRequest): void {
    this.updateRequestStatus(request, 'approved');
  }
  
  rejectRequest(request: EmployeeRequest): void {
    this.updateRequestStatus(request, 'rejected');
  }
  
  updateRequestStatus(request: EmployeeRequest, status: 'pending' | 'approved' | 'rejected'): void {
    this.isLoading = true;
    
    // Create updated request
    const updatedRequest: EmployeeRequest = {
      ...request,
      status: status,
      responseDate: new Date(),
      responseBy: { id: 'admin', name: 'Admin User' } as Employee, // This should be the current user
      responseNotes: `Request ${status} by admin`
    };
    
    this.employeeService.updateEmployeeRequest(request.employee.id, updatedRequest)
      .pipe(
        first(),
        catchError(err => {
          this.snackBar.open(`Error: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Request ${status} successfully`, 'Close', { duration: 3000 });
          
          // Reload requests
          if (this.singleEmployeeMode && this.currentEmployee) {
            this.loadEmployeeRequests(this.currentEmployee.id);
          } else {
            this.loadAllRequests();
          }
        }
      });
  }
  
  deleteRequest(request: EmployeeRequest): void {
    if (confirm(`Are you sure you want to delete this ${request.type} request from ${request.employee.name}?`)) {
      this.isLoading = true;
      
      this.employeeService.deleteEmployeeRequest(request.employee.id, request.id)
        .pipe(
          first(),
          catchError(err => {
            this.snackBar.open(`Error: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
            return of(false);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(success => {
          if (success) {
            this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 });
            
            if (this.singleEmployeeMode && this.currentEmployee) {
              this.loadEmployeeRequests(this.currentEmployee.id);
            } else {
              this.loadAllRequests();
            }
          }
        });
    }
  }
  
  applyFilters(): void {
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.loadEmployeeRequests(this.currentEmployee.id);
    } else {
      this.loadAllRequests();
    }
    
    // Apply filters to employeeRequests
    let filteredRequests: EmployeeRequest[] = [...this.employeeRequests];
    
    // Filter by status
    if (this.statusFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === this.statusFilter);
    }
    
    // Filter by employee (only in multi-employee mode)
    if (!this.singleEmployeeMode && this.employeeFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.employee.id === this.employeeFilter);
    }
    
    // Filter by type
    if (this.typeFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.type === this.typeFilter);
    }
    
    this.employeeRequests = filteredRequests;
  }
  
  resetFilters(): void {
    this.statusFilter = 'all';
    this.employeeFilter = 'all';
    this.typeFilter = 'all';
    
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.loadEmployeeRequests(this.currentEmployee.id);
    } else {
      this.loadAllRequests();
    }
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  getStatusChipColor(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'basic';
  }
  
  getRequestTypeChipColor(type: string): string {
    const typeOption = this.requestTypes.find(opt => opt.value === type);
    return typeOption ? typeOption.color : 'basic';
  }
  
  getRequestTypeLabel(type: string): string {
    const typeOption = this.requestTypes.find(opt => opt.value === type);
    return typeOption ? typeOption.label : type;
  }
  
  getDaysBetween(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get time difference in days and add 1 to include both start and end dates
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
  
  navigateBack(): void {
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.router.navigate(['/hr/employees', this.currentEmployee.id]);
    } else {
      this.router.navigate(['/hr/dashboard']);
    }
  }
  
  resetRequestForm(): void {
    this.requestForm.reset({
      employeeId: this.singleEmployeeMode ? this.currentEmployee?.id : '',
      type: 'vacation',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      details: '',
      status: 'pending'
    });
    
    // If in single employee mode, keep the employee field disabled
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.requestForm.get('employeeId')?.disable();
    }
  }
} 