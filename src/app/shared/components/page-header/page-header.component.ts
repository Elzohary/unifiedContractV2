import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderAction, PageHeaderConfig } from './models/page-header.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() actions: PageHeaderAction[] = [];

  constructor( private router: Router) {

  }

  /**
   * Alternative way to configure the header with a single config object
   * This will override individual properties if provided
   */
  @Input() set config(value: PageHeaderConfig) {
    if (value) {
      this.title = value.title;
      if (value.subtitle !== undefined) this.subtitle = value.subtitle;
      if (value.actions !== undefined) this.actions = value.actions;
    }
  }

  @Output() actionClick = new EventEmitter<string>();

  onActionClick(actionCallback: string): void {
    //this.actionClick.emit(actionCallback);
    this.router.navigate([actionCallback]);
    console.log(actionCallback);
  }
}
