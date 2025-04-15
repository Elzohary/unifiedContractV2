import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Employee } from '../../../../core/models/employee.model';
import { DataRepositoryService } from '../../../../core/services/data-repository.service';
import { Subject, takeUntil, timeout, catchError, EMPTY, finalize, first } from 'rxjs';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchQuery: string = '';
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = [
    'photo', 'name', 'jobTitle', 'badgeNumber', 'workLocation', 
    'nationality', 'workTimeRatio', 'currentProject', 'actions'
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dataRepository: DataRepositoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('EmployeeList: Component initialized');
    this.loadEmployees();
    
    // Subscribe to the global loading state
    this.dataRepository.dataLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        console.log(`EmployeeList: Global loading state changed to ${isLoading}`);
        // Only update if current state is true and loading is finishing
        if (this.isLoading && !isLoading) {
          this.isLoading = false;
        }
      });
  }

  ngAfterViewInit(): void {
    console.log('EmployeeList: View initialized');
    // The sort and paginator will be defined after view init
    if (this.sort && this.paginator && this.filteredEmployees.length > 0) {
      this.setupPaginationAndSort();
    }
  }
  
  ngOnDestroy(): void {
    console.log('EmployeeList: Component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    console.log('EmployeeList: Loading employees data');
    // Reset error state
    this.hasError = false;
    this.errorMessage = '';
    // Explicitly set loading state before request
    this.isLoading = true;
    
    this.dataRepository.getEmployees()
      .pipe(
        // Take only first emission to ensure completion
        first(),
        // Add timeout to prevent infinite loading
        timeout({
          each: 8000,
          with: () => EMPTY
        }),
        // Ensure resources are cleaned up
        takeUntil(this.destroy$),
        // Handle errors
        catchError(error => {
          console.error('EmployeeList: Error loading employees', error);
          this.hasError = true;
          this.errorMessage = error.name === 'TimeoutError' 
            ? 'Request timed out. Please try again.'
            : 'Failed to load employees. Please try again.';
          return EMPTY;
        }),
        // Always reset loading state
        finalize(() => {
          console.log('EmployeeList: Data stream complete');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (employees) => {
          console.log(`EmployeeList: Received ${employees.length} employees`);
          this.employees = employees;
          this.filteredEmployees = employees;
          
          // Setup sort and pagination if view is already initialized
          if (this.sort && this.paginator) {
            this.setupPaginationAndSort();
          }
        },
        complete: () => {
          console.log('EmployeeList: Subscription complete');
        }
      });
  }
  
  setupPaginationAndSort(): void {
    // Apply pagination
    if (this.paginator) {
      this.paginator.length = this.filteredEmployees.length;
    }
    
    // Apply initial sort if needed
    if (this.sort && this.sort.active) {
      this.sortData({ active: this.sort.active, direction: this.sort.direction });
    }
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredEmployees = this.employees;
      return;
    }

    this.filteredEmployees = this.employees.filter(employee => 
      employee.name.toLowerCase().includes(query) ||
      employee.badgeNumber.toLowerCase().includes(query) ||
      employee.jobTitle.toLowerCase().includes(query) ||
      employee.workLocation.toLowerCase().includes(query) ||
      (employee.currentProject && employee.currentProject.toLowerCase().includes(query))
    );
    
    // Update pagination
    if (this.paginator) {
      this.paginator.firstPage();
      this.paginator.length = this.filteredEmployees.length;
    }
  }

  sortData(sort: Sort): void {
    const data = [...this.filteredEmployees];
    
    if (!sort.active || sort.direction === '') {
      this.filteredEmployees = data;
      return;
    }

    this.filteredEmployees = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'jobTitle': return this.compare(a.jobTitle, b.jobTitle, isAsc);
        case 'badgeNumber': return this.compare(a.badgeNumber, b.badgeNumber, isAsc);
        case 'workLocation': return this.compare(a.workLocation, b.workLocation, isAsc);
        case 'nationality': return this.compare(a.nationality, b.nationality, isAsc);
        case 'workTimeRatio': return this.compare(a.workTimeRatio, b.workTimeRatio, isAsc);
        case 'currentProject': 
          return this.compare(
            a.currentProject || '', 
            b.currentProject || '', 
            isAsc
          );
        default: return 0;
      }
    });
  }

  compare(a: string | number, b: string | number, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  viewEmployeeDetails(id: string): void {
    this.router.navigate(['/hr/employees', id]);
  }

  editEmployee(id: string): void {
    this.router.navigate(['/hr/employees', id, 'edit']);
  }

  deleteEmployee(id: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      // Invalidate cache before deleting
      this.dataRepository.invalidateCache('employee', id);
      
      // Use the employee service directly for now
      // In a real app, this would go through the repository as well
      this.dataRepository.invalidateCache('employees');
      this.loadEmployees();
    }
  }

  addNewEmployee(): void {
    this.router.navigate(['/hr/employees/new']);
  }

  navigateToRequests(employeeId: string): void {
    this.router.navigate(['/hr/employees', employeeId, 'requests']);
  }
  
  navigateToAttendance(employeeId: string): void {
    this.router.navigate(['/hr/employees', employeeId, 'attendance']);
  }
  
  navigateToWarnings(employeeId: string): void {
    this.router.navigate(['/hr/employees', employeeId, 'warnings']);
  }

  reloadData(): void {
    // Invalidate employees cache
    this.dataRepository.invalidateCache('employees');
    this.loadEmployees();
  }
} 