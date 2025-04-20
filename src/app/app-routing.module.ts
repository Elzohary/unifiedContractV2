import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderListComponent } from './domains/work-order/components/work-order-list/work-order-list.component';
import { WorkOrderDetailsComponent } from './domains/work-order/components/work-order-details/work-order-details.component';
import { WorkOrderFormComponent } from './domains/work-order/components/work-order-form/work-order-form.component';
import { OverviewComponent } from './features/dashboards/overview/overview.component';
import { UnderConstructionComponent } from './shared/components/under-construction/under-construction.component';
import { AllRemarksComponent } from './features/dashboards/dashboard-management/components/all-remarks/all-remarks.component';
import { ActivityLogPageComponent } from './features/dashboards/dashboard-management/components/activity-log-page/activity-log-page.component';
import { EquipmentDashboardComponent } from './modules/resources/components/equipment-dashboard/equipment-dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { UserListComponent } from './users/user-list/user-list.component';

export const routes: Routes = [
  // Login route
  { path: 'login', component: LoginComponent },

  // Default route
  {
    path: '',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full'
  },

  // Dashboard routes - keep both lazy loading and direct components
  {
    path: 'dashboard',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full'
  },
  {
    path: 'dashboard/overview',
    component: OverviewComponent
  },
  {
    path: 'dashboard/analytics',
    component: UnderConstructionComponent,
    data: { title: 'Analytics Dashboard', message: 'The analytics dashboard is currently under development.' }
  },

  // Work Order routes - direct component routes for better performance
  {
    path: 'work-orders',
    component: WorkOrderListComponent
  },
  {
    path: 'work-orders/list',
    component: WorkOrderListComponent
  },
  {
    path: 'work-orders/new',
    component: WorkOrderFormComponent
  },
  {
    path: 'work-orders/edit/:id',
    component: WorkOrderFormComponent
  },
  {
    path: 'work-orders/details/:id',
    component: WorkOrderDetailsComponent
  },

  // Work order sections - direct component routes from app.routes.ts
  {
    path: 'work-order-sections/remarks',
    component: AllRemarksComponent
  },
  {
    path: 'work-order-sections/activity-log',
    component: ActivityLogPageComponent
  },
  {
    path: 'work-order-sections/issues',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Issues',
      message: 'The issues section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/actions',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Actions',
      message: 'The actions needed section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/materials',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Materials',
      message: 'The materials section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/photos',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Photos',
      message: 'The photos section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/forms',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Forms',
      message: 'The forms section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/expenses',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Expenses',
      message: 'The expenses section is currently under development.',
      category: 'work-orders'
    }
  },
  {
    path: 'work-order-sections/invoices',
    component: UnderConstructionComponent,
    data: {
      title: 'Work Order Invoices',
      message: 'The invoices section is currently under development.',
      category: 'work-orders'
    }
  },

  // Resources routes - merge lazy and direct routes
  {
    path: 'resources',
    redirectTo: 'resources/manpower',
    pathMatch: 'full'
  },
  {
    path: 'resources/manpower',
    component: UnderConstructionComponent,
    data: { title: 'Manpower Management', message: 'The manpower management page is currently under development.' }
  },
  {
    path: 'resources/equipment',
    component: EquipmentDashboardComponent
  },
  {
    path: 'resources/materials',
    component: UnderConstructionComponent,
    data: { title: 'Materials Management', message: 'The materials management page is currently under development.' }
  },

  // HR routes - keep lazy loading
  {
    path: 'hr',
    loadChildren: () => import('./features/hr/hr.module')
      .then(m => m.HrModule)
  },

  // Reports routes from app.routes.ts
  {
    path: 'reports',
    redirectTo: 'reports/monthly',
    pathMatch: 'full'
  },
  {
    path: 'reports/monthly',
    component: UnderConstructionComponent,
    data: { title: 'Monthly Reports', message: 'The monthly reports page is currently under development.' }
  },
  {
    path: 'reports/performance',
    component: UnderConstructionComponent,
    data: { title: 'Performance Reports', message: 'The performance reports page is currently under development.' }
  },
  {
    path: 'reports/custom',
    component: UnderConstructionComponent,
    data: { title: 'Custom Reports', message: 'The custom reports page is currently under development.' }
  },

  // Admin routes from app.routes.ts
  {
    path: 'admin',
    redirectTo: 'admin/users',
    pathMatch: 'full'
  },
  {
    path: 'admin/users',
    component: UserListComponent,
    data: { title: 'User Management', message: 'The user management page is currently under development.' }
  },
  {
    path: 'admin/settings',
    component: UnderConstructionComponent,
    data: { title: 'System Settings', message: 'The system settings page is currently under development.' }
  },

  // Activity log direct routes
  {
    path: 'activity-log',
    component: ActivityLogPageComponent
  },

  // Activity Dashboard - keep the lazy loading approach
  {
    path: 'activity-dashboard',
    loadComponent: () => import('./features/activity-dashboard/activity-dashboard.component')
      .then(c => c.ActivityDashboardComponent)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    // Import standalone components
    WorkOrderListComponent,
    WorkOrderDetailsComponent,
    WorkOrderFormComponent,
    OverviewComponent,
    UnderConstructionComponent,
    AllRemarksComponent,
    ActivityLogPageComponent,
    EquipmentDashboardComponent,
    LoginComponent
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
