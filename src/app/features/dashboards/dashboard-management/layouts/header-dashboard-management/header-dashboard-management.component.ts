import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../../shared/services/theme.service';

@Component({
  selector: 'app-header-dashboard-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    FormsModule
  ],
  templateUrl: './header-dashboard-management.component.html',
  styleUrl: './header-dashboard-management.component.scss'
})
export class HeaderDashboardManagementComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _themeService = inject(ThemeService);

  isDark = false;
  
  formGroup = this._formBuilder.group({
    enableWifi: '',
    acceptTerms: ['', Validators.requiredTrue],
  });

  ngOnInit(): void {
    // Initialize isDark from the theme service
    this.isDark = this._themeService.isDarkTheme();
    
    // Subscribe to theme changes
    this._themeService.theme$.subscribe(theme => {
      this.isDark = theme === 'dark-theme';
    });
  }

  alertFormValues(formGroup: FormGroup) {
    alert(JSON.stringify(formGroup.value, null, 2));
  }

  toggleTheme() {
    this._themeService.toggleTheme();
  }
}
