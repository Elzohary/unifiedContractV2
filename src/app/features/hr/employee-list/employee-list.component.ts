import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { Employee } from '../../../shared/models/employee.model';
import { EmployeeService } from '../../../shared/services/employee.service';

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
export class EmployeeListComponent implements OnInit, AfterViewInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchQuery = '';
  isLoading = true;
  
  displayedColumns: string[] = [
    'photo', 'name', 'jobTitle', 'badgeNumber', 'workLocation', 
    'nationality', 'workTimeRatio', 'currentProject', 'actions'
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngAfterViewInit(): void {
    // The sort and paginator will be defined after view init
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees', error);
        this.isLoading = false;
      }
    });
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
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee', error);
        }
      });
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
} 