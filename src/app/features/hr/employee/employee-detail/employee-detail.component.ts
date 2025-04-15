import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { Employee, AttendanceRecord, Certificate, EmployeeRequest, Warning } from '../../../../core/models/employee.model';
import { DataRepositoryService } from '../../../../core/services/data-repository.service';
import { Subject, takeUntil, filter, switchMap, of, tap, finalize, catchError, timeout, EMPTY, first } from 'rxjs';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatTableModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: Employee | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  selectedTabIndex = 0;
  private destroy$ = new Subject<void>();
  
  // Tables data
  recentAttendance: AttendanceRecord[] = [];
  attendanceColumns: string[] = ['date', 'checkIn', 'checkOut', 'status', 'workHours'];
  
  certificates: Certificate[] = [];
  certificateColumns: string[] = ['name', 'issuer', 'issueDate', 'expiryDate', 'verified'];
  
  requests: EmployeeRequest[] = [];
  requestColumns: string[] = ['type', 'title', 'requestDate', 'status'];
  
  warnings: Warning[] = [];
  warningColumns: string[] = ['title', 'issueDate', 'severity', 'acknowledged'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataRepository: DataRepositoryService
  ) {}

  ngOnInit(): void {
    console.log('EmployeeDetail: Component initialized');
    
    // Get the initial ID from the route
    const initialId = this.route.snapshot.paramMap.get('id');
    if (initialId) {
      console.log(`EmployeeDetail: Initial ID is ${initialId}`);
      this.loadEmployeeData(initialId);
    } else {
      console.error('EmployeeDetail: No ID in route, redirecting to employee list');
      this.router.navigate(['/hr/employees']);
    }
    
    // Watch for subsequent route parameter changes
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        filter(params => {
          const id = params.get('id');
          // Only proceed if we have an ID and it's different from current employee
          return !!id && (!this.employee || id !== this.employee.id);
        })
      )
      .subscribe(params => {
        const id = params.get('id')!;
        console.log(`EmployeeDetail: Route param changed to ${id}`);
        this.loadEmployeeData(id);
      });
  }
  
  loadEmployeeData(employeeId: string): void {
    console.log(`EmployeeDetail: Loading data for employee ${employeeId}`);
    // Reset component state
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    // Simple subscription approach with better error handling
    this.dataRepository.getEmployeeWithRelatedData(employeeId)
      .pipe(
        // Take only the first emission and then complete
        first(),
        // Set a timeout to prevent infinite loading
        timeout({
          each: 8000,  // 8 seconds per operation
          with: () => {
            return of({
              employee: undefined,
              attendance: [] as AttendanceRecord[],
              requests: [] as EmployeeRequest[],
              warnings: [] as Warning[]
            });
          }
        }),
        // Ensure resources are cleaned up on component destroy
        takeUntil(this.destroy$),
        // Always handle errors to prevent breaking the component
        catchError(error => {
          console.error(`EmployeeDetail: Error in data stream:`, error);
          this.hasError = true;
          this.isLoading = false;
          this.errorMessage = error.name === 'TimeoutError' 
            ? 'Request timed out. Please try again.' 
            : 'Failed to load employee data. Please try again.';
          return EMPTY;
        }),
        // Ensure loading state is reset regardless of outcome
        finalize(() => {
          console.log('EmployeeDetail: Data stream complete');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          console.log(`EmployeeDetail: Data received, employee exists: ${!!data.employee}`);
          if (data.employee) {
            this.employee = data.employee;
            this.recentAttendance = data.attendance ? data.attendance.slice(0, 5) : [];
            this.certificates = data.employee.certificates || [];
            this.requests = data.requests || [];
            this.warnings = data.warnings || [];
          } else {
            this.hasError = true;
            this.errorMessage = 'Employee not found';
          }
        },
        // Just in case something else happens with the subscription
        error: (err) => {
          console.error(`EmployeeDetail: Unexpected error in subscription:`, err);
          this.hasError = true;
          this.errorMessage = 'An unexpected error occurred';
          this.isLoading = false;
        },
        complete: () => {
          console.log('EmployeeDetail: Subscription complete');
        }
      });
  }
  
  ngOnDestroy(): void {
    console.log('EmployeeDetail: Component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log(`EmployeeDetail: Reloading data for ${id}`);
      // Clear cache for this employee
      this.dataRepository.invalidateCache('employee', id);
      this.loadEmployeeData(id);
    } else {
      this.router.navigate(['/hr/employees']);
    }
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/hr/employees', this.employee.id, 'edit']);
    }
  }

  viewRequests(): void {
    if (this.employee) {
      this.router.navigate(['/hr/employees', this.employee.id, 'requests']);
    }
  }
  
  viewAttendance(): void {
    if (this.employee) {
      this.router.navigate(['/hr/employees', this.employee.id, 'attendance']);
    }
  }
  
  viewWarnings(): void {
    if (this.employee) {
      this.router.navigate(['/hr/employees', this.employee.id, 'warnings']);
    }
  }
  
  issueWarning(): void {
    if (this.employee) {
      this.router.navigate(['/hr/warnings/new'], { 
        queryParams: { employeeId: this.employee.id } 
      });
    }
  }
  
  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  formatTime(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  calculateAge(birthdate: Date): number {
    const today = new Date();
    const birthdateObj = new Date(birthdate);
    let age = today.getFullYear() - birthdateObj.getFullYear();
    const monthDiff = today.getMonth() - birthdateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObj.getDate())) {
      age--;
    }
    
    return age;
  }
  
  getTenureYears(joinDate: Date): number {
    const today = new Date();
    const joinDateObj = new Date(joinDate);
    let years = today.getFullYear() - joinDateObj.getFullYear();
    const monthDiff = today.getMonth() - joinDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDateObj.getDate())) {
      years--;
    }
    
    return years;
  }
} 