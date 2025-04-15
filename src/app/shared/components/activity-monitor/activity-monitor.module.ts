import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityMonitorComponent } from './activity-monitor.component';

@NgModule({
  imports: [
    CommonModule,
    ActivityMonitorComponent
  ],
  exports: [
    ActivityMonitorComponent
  ]
})
export class ActivityMonitorModule { } 