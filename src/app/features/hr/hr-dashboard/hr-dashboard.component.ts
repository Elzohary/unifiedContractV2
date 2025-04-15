import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DataRepositoryService } from '../../../core/services/data-repository.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { first, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { Warning } from '../../../core/models/employee.model';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'primary' | 'accent' | 'success' | 'warning';
  icon: string;
  time: string;
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    RouterModule
  ],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent implements OnInit {
  // Temporary route handling
  isTempRoute = false;
  tempRouteMessage = '';
  
  // Dashboard stats
  totalEmployees = 0;
  pendingRequests = 0;
  absentToday = 0;
  activeWarnings = 0;
  
  // Recent activities
  recentActivities: Activity[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private dataRepository: DataRepositoryService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    // Check if this is a temporary route
    this.route.data.subscribe(data => {
      if (data['tempRoute']) {
        this.isTempRoute = true;
        this.tempRouteMessage = data['message'] || 'Coming Soon';
      }
    });
    
    // Only load data if this is not a temporary route
    if (!this.isTempRoute) {
      this.loadDashboardData();
    }
  }
  
  loadDashboardData(): void {
    // Load employees
    this.dataRepository.getEmployees()
      .pipe(
        first(),
        catchError(err => {
          console.error('Error loading employees:', err);
          return of([]);
        })
      )
      .subscribe(employees => {
        this.totalEmployees = employees.length;
        this.loadRequests(employees);
        this.loadAttendance(employees);
        this.loadWarnings(employees);
        this.generateMockActivities();
      });
  }
  
  loadRequests(employees: any[]): void {
    const requests$ = employees.map(employee => 
      this.employeeService.getEmployeeRequests(employee.id).pipe(
        first(),
        catchError(err => {
          console.error(`Error loading requests for employee ${employee.id}:`, err);
          return of([]);
        })
      )
    );

    forkJoin(requests$).pipe(
      first()
    ).subscribe(allRequests => {
      this.pendingRequests = allRequests.reduce((total, requests) => 
        total + requests.filter(req => req.status === 'pending').length, 0);
    });
  }
  
  loadAttendance(employees: any[]): void {
    const today = new Date();
    const todayStr = this.formatDateForApi(today);

    const attendance$ = employees.map(employee =>
      this.employeeService.getEmployeeAttendance(employee.id, todayStr, todayStr).pipe(
        first(),
        catchError(err => {
          console.error(`Error loading attendance for employee ${employee.id}:`, err);
          return of([]);
        })
      )
    );

    forkJoin(attendance$).pipe(
      first()
    ).subscribe(allAttendance => {
      this.absentToday = allAttendance.reduce((total, records) => 
        total + (records.length === 0 || records.some(rec => rec.status === 'absent') ? 1 : 0), 0);
    });
  }
  
  loadWarnings(employees: any[]): void {
    const warnings$ = employees.map(employee =>
      this.employeeService.getWarningsByEmployee(employee.id).pipe(
        first(),
        catchError(err => {
          console.error(`Error loading warnings for employee ${employee.id}:`, err);
          return of([]);
        })
      )
    );

    forkJoin(warnings$).pipe(
      first()
    ).subscribe(allWarnings => {
      this.activeWarnings = allWarnings.reduce((total, warnings) => 
        total + warnings.filter(warning => 
          !warning.acknowledgement || !warning.acknowledgement.acknowledged
        ).length, 0);
    });
  }
  
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Generate some mock recent activities for demonstration
  generateMockActivities(): void {
    const now = new Date();
    
    this.recentActivities = [
      {
        id: '1',
        title: 'New Employee Onboarded',
        description: 'John Doe has completed the onboarding process',
        date: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
        type: 'primary',
        icon: 'person_add',
        time: '2 hours ago'
      },
      {
        id: '2',
        title: 'Leave Request Approved',
        description: 'Jane Smith\'s vacation request has been approved',
        date: new Date(now.getTime() - 4 * 3600000), // 4 hours ago
        type: 'success',
        icon: 'check_circle',
        time: '4 hours ago'
      },
      {
        id: '3',
        title: 'Performance Review Scheduled',
        description: 'Mike Johnson\'s quarterly review is scheduled for next week',
        date: new Date(now.getTime() - 24 * 3600000), // 1 day ago
        type: 'accent',
        icon: 'event_note',
        time: '1 day ago'
      },
      {
        id: '4',
        title: 'Warning Issued',
        description: 'A warning has been issued to Sarah Wilson for late attendance',
        date: new Date(now.getTime() - 48 * 3600000), // 2 days ago
        type: 'warning',
        icon: 'warning',
        time: '2 days ago'
      }
    ];
  }
  
  getActivityIcon(type: string): string {
    return type === 'primary' ? 'person_add' :
           type === 'success' ? 'check_circle' :
           type === 'accent' ? 'event_note' :
           type === 'warning' ? 'warning' : 'info';
  }
  
  getActivityIconClass(type: string): string {
    return `activity-icon ${type}`;
  }
} 