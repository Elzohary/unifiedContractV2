import { Provider } from '@angular/core';
import { WorkOrderItemService } from './services/work-order-item.service';
import { MaterialService } from './services/material.service';

export const WORK_ORDER_PROVIDERS: Provider[] = [
  WorkOrderItemService,
  MaterialService,
  // Add other work order related services here
]; 