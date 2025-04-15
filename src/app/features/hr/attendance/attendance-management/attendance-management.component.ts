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
import { Employee, AttendanceRecord } from '../../../../core/models/employee.model';
import { DataRepositoryService } from '../../../../core/services/data-repository.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { finalize, first, catchError, of } from 'rxjs';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss']
})
export class AttendanceManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;
  
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  attendanceForm!: FormGroup;
  bulkAttendanceForm!: FormGroup;
  
  employees: Employee[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  
  // For single employee mode
  singleEmployeeMode = false;
  currentEmployee: Employee | null = null;
  
  displayedColumns: string[] = ['employeeName', 'date', 'checkIn', 'checkOut', 'status', 'lateMinutes', 'totalHours', 'actions'];
  displayedColumnsWithoutEmployee: string[] = ['date', 'checkIn', 'checkOut', 'status', 'lateMinutes', 'totalHours', 'actions'];
  
  // Date range handling
  today = new Date();
  firstDayOfMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  
  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Date Range' }
  ];
  
  selectedDateRange = 'thisMonth';
  startDate: Date = this.firstDayOfMonth;
  endDate: Date = this.today;
  
  // Status options
  statusOptions = [
    { value: 'present', label: 'Present', color: 'primary' },
    { value: 'late', label: 'Late', color: 'accent' },
    { value: 'halfDay', label: 'Half Day', color: 'accent' },
    { value: 'absent', label: 'Absent', color: 'warn' },
    { value: 'vacation', label: 'Vacation', color: 'primary' },
    { value: 'sickLeave', label: 'Sick Leave', color: 'warn' },
    { value: 'remote', label: 'Remote', color: 'primary' }
  ];
  
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
    
    this.initForms();
  }
  
  initForms(): void {
    this.attendanceForm = this.fb.group({
      employeeId: ['', Validators.required],
      date: [new Date(), Validators.required],
      checkIn: ['08:00', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      checkOut: ['17:00', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      status: ['present', Validators.required],
      notes: ['']
    });
    
    this.bulkAttendanceForm = this.fb.group({
      date: [new Date(), Validators.required],
      defaultStatus: ['present', Validators.required],
      defaultCheckIn: ['08:00', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      defaultCheckOut: ['17:00', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      notes: ['']
    });
    
    // If in single employee mode, update the form when employee loads
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.attendanceForm.patchValue({
        employeeId: this.currentEmployee.id
      });
      this.attendanceForm.get('employeeId')?.disable();
    }
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
          this.attendanceForm.patchValue({
            employeeId: employee.id
          });
          
          // Disable the employee selection field
          this.attendanceForm.get('employeeId')?.disable();
          
          // Load this employee's attendance for the selected date range
          this.loadAttendanceForDateRange();
        } else {
          this.router.navigate(['/hr/attendance']);
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
        this.loadAttendanceForDateRange();
      });
  }
  
  onDateRangeChange(): void {
    this.isLoading = true;
    
    const today = new Date();
    
    switch(this.selectedDateRange) {
      case 'today':
        this.startDate = today;
        this.endDate = today;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.startDate = yesterday;
        this.endDate = yesterday;
        break;
      case 'thisWeek':
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // Sunday is 0
        this.startDate = thisWeekStart;
        this.endDate = today;
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        this.startDate = lastWeekStart;
        this.endDate = lastWeekEnd;
        break;
      case 'thisMonth':
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = today;
        break;
      case 'lastMonth':
        this.startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Keep current values
        break;
    }
    
    this.loadAttendanceForDateRange();
  }
  
  loadAttendanceForDateRange(): void {
    this.isLoading = true;
    this.hasError = false;
    
    const startDateStr = this.formatDateForApi(this.startDate);
    const endDateStr = this.formatDateForApi(this.endDate);
    
    if (this.singleEmployeeMode && this.currentEmployee) {
      // Load attendance for a single employee
      this.employeeService.getEmployeeAttendance(this.currentEmployee.id, startDateStr, endDateStr)
        .pipe(
          first(),
          catchError(err => {
            this.hasError = true;
            this.errorMessage = `Failed to load attendance records: ${err.message || 'Unknown error'}`;
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(records => {
          this.attendanceRecords = records;
          
          // Sort by date (newest first)
          this.attendanceRecords.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        });
    } else {
      // Load attendance for all employees
      this.dataRepository.getAttendanceRecords(startDateStr, endDateStr)
        .pipe(
          first(),
          catchError(err => {
            this.hasError = true;
            this.errorMessage = `Failed to load attendance records: ${err.message || 'Unknown error'}`;
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe((records: AttendanceRecord[]) => {
          this.attendanceRecords = records;
          
          // Sort by date (newest first)
          this.attendanceRecords.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
        });
    }
  }
  
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onCustomDatesChange(): void {
    // Validate that end date is not before start date
    if (this.endDate < this.startDate) {
      this.snackBar.open('End date cannot be before start date', 'Close', { duration: 3000 });
      return;
    }
    
    this.loadAttendanceForDateRange();
  }
  
  addAttendance(): void {
    if (this.attendanceForm.invalid) {
      this.markFormGroupTouched(this.attendanceForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    const formValues = this.attendanceForm.getRawValue(); // Use getRawValue to include disabled controls
    
    // Find the employee
    const employee = this.employees.find(emp => emp.id === formValues.employeeId);
    if (!employee) {
      this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }
    
    // Create attendance record object
    const attendanceRecord: AttendanceRecord = {
      id: '', // Will be set by the service
      employee: employee,
      date: new Date(formValues.date),
      checkIn: formValues.checkIn,
      checkOut: formValues.checkOut,
      status: formValues.status,
      notes: formValues.notes || '',
      lateMinutes: 0, // Will be calculated by the service
      totalHours: 0 // Will be calculated by the service
    };
    
    // If status is 'late', calculate late minutes
    if (formValues.status === 'late') {
      const scheduledStartTime = 8 * 60; // 8:00 AM in minutes
      const actualStartTime = this.parseTime(formValues.checkIn);
      attendanceRecord.lateMinutes = Math.max(0, actualStartTime - scheduledStartTime);
    }
    
    // Calculate total hours
    const startTime = this.parseTime(formValues.checkIn);
    const endTime = this.parseTime(formValues.checkOut);
    const totalMinutes = endTime - startTime;
    attendanceRecord.totalHours = Math.max(0, totalMinutes / 60).toFixed(1);
    
    this.employeeService.addEmployeeAttendance(employee.id, attendanceRecord)
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
          this.snackBar.open('Attendance record added successfully', 'Close', { duration: 3000 });
          
          // Reset the form
          this.attendanceForm.reset({
            employeeId: this.singleEmployeeMode ? this.currentEmployee?.id : '',
            date: new Date(),
            checkIn: '08:00',
            checkOut: '17:00',
            status: 'present',
            notes: ''
          });
          
          // If in single employee mode, keep the employee field disabled
          if (this.singleEmployeeMode && this.currentEmployee) {
            this.attendanceForm.get('employeeId')?.disable();
          }
          
          // Reload attendance records
          this.loadAttendanceForDateRange();
        }
      });
  }
  
  addBulkAttendance(): void {
    if (this.bulkAttendanceForm.invalid) {
      this.markFormGroupTouched(this.bulkAttendanceForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }
    
    this.isLoading = true;
    
    const formValues = this.bulkAttendanceForm.value;
    
    // Ensure we have employees
    if (this.employees.length === 0) {
      this.snackBar.open('No employees found to add attendance records for', 'Close', { duration: 3000 });
      this.isLoading = false;
      return;
    }
    
    const date = new Date(formValues.date);
    const dateStr = this.formatDateForApi(date);
    
    // Get scheduled start time (for late calculations)
    const scheduledStartTime = 8 * 60; // 8:00 AM in minutes
    
    // Calculate total hours
    const startTime = this.parseTime(formValues.defaultCheckIn);
    const endTime = this.parseTime(formValues.defaultCheckOut);
    const totalMinutes = endTime - startTime;
    const totalHours = Math.max(0, totalMinutes / 60).toFixed(1);
    
    // In single employee mode, only add for the current employee
    const employeesToProcess = this.singleEmployeeMode ? 
      [this.currentEmployee!] : this.employees;
    
    // Keep track of successful records
    let successCount = 0;
    let totalCount = employeesToProcess.length;
    let errorMessage = '';
    
    // Process each employee
    employeesToProcess.forEach((employee, index) => {
      // Create attendance record object
      const attendanceRecord: AttendanceRecord = {
        id: '', // Will be set by the service
        employee: employee,
        date: date,
        checkIn: formValues.defaultCheckIn,
        checkOut: formValues.defaultCheckOut,
        status: formValues.defaultStatus,
        notes: formValues.notes || '',
        lateMinutes: 0,
        totalHours: totalHours
      };
      
      // If status is 'late', calculate late minutes
      if (formValues.defaultStatus === 'late') {
        const actualStartTime = this.parseTime(formValues.defaultCheckIn);
        attendanceRecord.lateMinutes = Math.max(0, actualStartTime - scheduledStartTime);
      }
      
      this.employeeService.addEmployeeAttendance(employee.id, attendanceRecord)
        .pipe(
          first(),
          catchError(err => {
            errorMessage = `Error adding record for ${employee.name}: ${err.message || 'Unknown error'}`;
            console.error(errorMessage);
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            successCount++;
          }
          
          // If this is the last employee, finish up
          if (index === employeesToProcess.length - 1) {
            this.isLoading = false;
            
            if (successCount === totalCount) {
              this.snackBar.open(`Successfully added attendance records for ${successCount} employees`, 'Close', { duration: 3000 });
            } else {
              this.snackBar.open(`Added ${successCount} of ${totalCount} attendance records. Some errors occurred.`, 'Close', { duration: 5000 });
            }
            
            // Reset the form
            this.bulkAttendanceForm.reset({
              date: new Date(),
              defaultStatus: 'present',
              defaultCheckIn: '08:00',
              defaultCheckOut: '17:00',
              notes: ''
            });
            
            // Reload attendance records
            this.loadAttendanceForDateRange();
          }
        });
    });
  }
  
  parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  getStatusChipColor(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'basic';
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  deleteAttendanceRecord(record: AttendanceRecord): void {
    if (confirm(`Are you sure you want to delete this attendance record for ${record.employee.name} on ${new Date(record.date).toLocaleDateString()}?`)) {
      this.isLoading = true;
      
      this.employeeService.deleteEmployeeAttendance(record.employee.id, record.id)
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
            this.snackBar.open('Attendance record deleted successfully', 'Close', { duration: 3000 });
            this.loadAttendanceForDateRange();
          }
        });
    }
  }
  
  editAttendanceRecord(record: AttendanceRecord): void {
    // Clone the record to avoid modifying it directly
    const recordCopy = { ...record };
    
    // Open dialog for editing
    // A real implementation would use a dialog component
    // For this implementation, we'll just use a simple prompt
    const newStatus = prompt('Enter new status (present, late, halfDay, absent, vacation, sickLeave, remote):', record.status);
    if (newStatus && this.statusOptions.some(opt => opt.value === newStatus)) {
      recordCopy.status = newStatus as 'present' | 'late' | 'halfDay' | 'absent' | 'vacation' | 'sickLeave' | 'remote';
      
      // Update other fields based on status
      if (newStatus === 'absent' || newStatus === 'vacation' || newStatus === 'sickLeave') {
        recordCopy.checkIn = 'N/A';
        recordCopy.checkOut = 'N/A';
        recordCopy.lateMinutes = 0;
        recordCopy.totalHours = '0';
      } else if (newStatus === 'late') {
        const checkIn = prompt('Enter new check-in time (HH:MM):', record.checkIn);
        if (checkIn && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkIn)) {
          recordCopy.checkIn = checkIn;
          
          // Calculate late minutes
          const scheduledStartTime = 8 * 60; // 8:00 AM in minutes
          const actualStartTime = this.parseTime(checkIn);
          recordCopy.lateMinutes = Math.max(0, actualStartTime - scheduledStartTime);
          
          // Recalculate total hours
          const checkOut = prompt('Enter new check-out time (HH:MM):', record.checkOut);
          if (checkOut && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkOut)) {
            recordCopy.checkOut = checkOut;
            
            const startTime = this.parseTime(checkIn);
            const endTime = this.parseTime(checkOut);
            const totalMinutes = endTime - startTime;
            recordCopy.totalHours = Math.max(0, totalMinutes / 60).toFixed(1);
          }
        }
      } else {
        const checkIn = prompt('Enter new check-in time (HH:MM):', record.checkIn);
        if (checkIn && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkIn)) {
          recordCopy.checkIn = checkIn;
          recordCopy.lateMinutes = 0; // Reset late minutes for non-late status
          
          const checkOut = prompt('Enter new check-out time (HH:MM):', record.checkOut);
          if (checkOut && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(checkOut)) {
            recordCopy.checkOut = checkOut;
            
            const startTime = this.parseTime(checkIn);
            const endTime = this.parseTime(checkOut);
            const totalMinutes = endTime - startTime;
            recordCopy.totalHours = Math.max(0, totalMinutes / 60).toFixed(1);
          }
        }
      }
      
      // Update notes
      const notes = prompt('Enter new notes:', record.notes);
      if (notes !== null) {
        recordCopy.notes = notes;
      }
      
      // Save the updated record
      this.isLoading = true;
      
      this.employeeService.updateEmployeeAttendance(record.employee.id, recordCopy)
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
            this.snackBar.open('Attendance record updated successfully', 'Close', { duration: 3000 });
            this.loadAttendanceForDateRange();
          }
        });
    } else if (newStatus) {
      this.snackBar.open('Invalid status. Please choose from the available options.', 'Close', { duration: 3000 });
    }
  }
  
  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  }
  
  navigateBack(): void {
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.router.navigate(['/hr/employees', this.currentEmployee.id]);
    } else {
      this.router.navigate(['/hr/dashboard']);
    }
  }
  
  resetAttendanceForm(): void {
    this.attendanceForm.reset({
      employeeId: this.singleEmployeeMode ? this.currentEmployee?.id : '',
      date: new Date(),
      checkIn: '08:00',
      checkOut: '17:00',
      status: 'present',
      notes: ''
    });
    
    // If in single employee mode, keep the employee field disabled
    if (this.singleEmployeeMode && this.currentEmployee) {
      this.attendanceForm.get('employeeId')?.disable();
    }
  }
  
  resetBulkAttendanceForm(): void {
    this.bulkAttendanceForm.reset({
      date: new Date(),
      defaultStatus: 'present',
      defaultCheckIn: '08:00',
      defaultCheckOut: '17:00',
      notes: ''
    });
  }
} 