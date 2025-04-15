import { Routes } from '@angular/router';
import { WorkOrderListComponent } from './components/work-order-list/work-order-list.component';

export const WORK_ORDER_ROUTES: Routes = [
  // Default route for the domain
  {
    path: '',
    component: WorkOrderListComponent
  },

  // Path for explicitly accessing the list
  {
    path: 'list',
    component: WorkOrderListComponent
  }

  // Will add more routes as we create more components
  // { path: 'details/:id', component: WorkOrderDetailComponent },
  // { path: 'new', component: WorkOrderFormComponent },
  // { path: 'edit/:id', component: WorkOrderFormComponent }
];
