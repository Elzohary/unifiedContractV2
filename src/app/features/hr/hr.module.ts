import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrRoutingModule } from './hr-routing.module';
import { HrDashboardComponent } from './hr-dashboard/hr-dashboard.component';
import { EmployeeListComponent } from './employee/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './employee/employee-detail/employee-detail.component';
import { EmployeeFormComponent } from './employee/employee-form/employee-form.component';
import { AttendanceManagementComponent } from './attendance/attendance-management/attendance-management.component';
import { EmployeeRequestsComponent } from './requests/employee-requests/employee-requests.component';

// Even though these are standalone components, we're including them here
// for documentation purposes and for potential future module conversion
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HrRoutingModule,
    HrDashboardComponent,
    EmployeeListComponent,
    EmployeeDetailComponent,
    EmployeeFormComponent,
    AttendanceManagementComponent,
    EmployeeRequestsComponent
  ]
})
export class HrModule { } 