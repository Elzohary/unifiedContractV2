import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import HR components 
import { HrDashboardComponent } from './hr-dashboard/hr-dashboard.component';
import { EmployeeListComponent } from './employee/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './employee/employee-detail/employee-detail.component';
import { EmployeeFormComponent } from './employee/employee-form/employee-form.component';
import { AttendanceManagementComponent } from './attendance/attendance-management/attendance-management.component';
import { EmployeeRequestsComponent } from './requests/employee-requests/employee-requests.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: HrDashboardComponent
  },
  {
    path: 'employees',
    component: EmployeeListComponent
  },
  {
    path: 'employees/new',
    component: EmployeeFormComponent
  },
  {
    path: 'employees/:id',
    component: EmployeeDetailComponent
  },
  {
    path: 'employees/:id/edit',
    component: EmployeeFormComponent
  },
  {
    path: 'employees/:id/requests',
    component: EmployeeRequestsComponent
  },
  {
    path: 'employees/:id/attendance',
    component: AttendanceManagementComponent
  },
  {
    path: 'employees/:id/warnings',
    component: HrDashboardComponent,
    data: { tempRoute: true, message: 'Employee Warnings Management - Coming Soon' }
  },
  {
    path: 'requests',
    component: EmployeeRequestsComponent
  },
  {
    path: 'attendance',
    component: AttendanceManagementComponent
  },
  {
    path: 'warnings',
    component: HrDashboardComponent,
    data: { tempRoute: true, message: 'Employee Warnings Management - Coming Soon' }
  },
  {
    path: 'announcements',
    component: HrDashboardComponent,
    data: { tempRoute: true, message: 'HR Announcements - Coming Soon' }
  },
  {
    path: 'reports',
    component: HrDashboardComponent,
    data: { tempRoute: true, message: 'HR Reports - Coming Soon' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule { } 