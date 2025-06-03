import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Angular Material
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

// Services and Models
import { HelpService, HelpTopic, HelpCategory } from '../../services/help.service';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatToolbarModule
  ],
  template: `
    <div class="help-center">
      <!-- Header -->
      <mat-toolbar class="help-header" color="primary">
        <span class="help-title">
          <mat-icon>help_center</mat-icon>
          Help Center
        </span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="toggleHelpMode()" 
                [class.active]="isHelpModeActive$ | async"
                matTooltip="Toggle Help Mode">
          <mat-icon>{{(isHelpModeActive$ | async) ? 'visibility_off' : 'visibility'}}</mat-icon>
        </button>
        <button mat-icon-button (click)="close()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Search Bar -->
      <div class="search-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search help topics...</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput 
                 [(ngModel)]="searchQuery" 
                 (input)="onSearchChange()"
                 placeholder="What do you need help with?">
          <button matSuffix mat-icon-button *ngIf="searchQuery" (click)="clearSearch()">
            <mat-icon>clear</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <!-- Content -->
      <div class="help-content">
        <!-- Search Results -->
        <div *ngIf="searchQuery" class="search-results">
          <ng-container *ngIf="searchResults$ | async as results">
            <h3>Search Results ({{results.length}})</h3>
            <div *ngIf="results.length === 0" class="no-results">
              <mat-icon>search_off</mat-icon>
              <p>No help topics found for "{{searchQuery}}"</p>
              <p class="suggestion">Try different keywords or browse categories below.</p>
            </div>
            <mat-card *ngFor="let topic of results" class="topic-card" (click)="showTopic(topic)">
              <mat-card-header>
                <mat-icon mat-card-avatar [color]="'primary'">{{topic.icon || 'help'}}</mat-icon>
                <mat-card-title>{{topic.title}}</mat-card-title>
                <mat-card-subtitle>{{getCategoryName(topic.category)}}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{topic.description | slice:0:120}}{{topic.description.length > 120 ? '...' : ''}}</p>
                <div class="topic-tags" *ngIf="topic.tags">
                  <mat-chip-listbox>
                    <mat-chip *ngFor="let tag of topic.tags | slice:0:3">{{tag}}</mat-chip>
                  </mat-chip-listbox>
                </div>
              </mat-card-content>
            </mat-card>
          </ng-container>
        </div>

        <!-- Categories -->
        <div *ngIf="!searchQuery" class="categories-section">
          <mat-tab-group>
            <mat-tab *ngFor="let category of helpCategories$ | async" 
                     [label]="category.name">
              <ng-template matTabContent>
                <div class="category-content">
                  <div class="category-header">
                    <mat-icon class="category-icon">{{category.icon}}</mat-icon>
                    <div>
                      <h2>{{category.name}}</h2>
                      <p>{{category.description}}</p>
                    </div>
                  </div>
                  
                  <div class="topics-grid">
                    <mat-card *ngFor="let topic of getTopicsByCategory(category.id)" 
                              class="topic-card" 
                              (click)="showTopic(topic)">
                      <mat-card-header>
                        <mat-icon mat-card-avatar>{{topic.icon || 'help'}}</mat-icon>
                        <mat-card-title>{{topic.title}}</mat-card-title>
                        <mat-card-subtitle *ngIf="topic.priority" 
                                           [class]="'priority-' + topic.priority">
                          {{topic.priority}} priority
                        </mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <p>{{topic.description}}</p>
                        <div class="topic-actions" *ngIf="topic.actionUrl">
                          <mat-chip [color]="'primary'">
                            <mat-icon>{{topic.icon}}</mat-icon>
                            {{topic.actionText || 'Learn More'}}
                          </mat-chip>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </ng-template>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>

      <!-- Help Mode Status -->
      <div class="help-mode-banner" *ngIf="isHelpModeActive$ | async">
        <mat-icon>visibility</mat-icon>
        <span>Help mode is active - Help icons are now visible on all pages</span>
        <button mat-button (click)="toggleHelpMode()">Turn Off</button>
      </div>
    </div>
  `,
  styles: [`
    .help-center {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
    }

    .help-header {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .help-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .search-section {
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-field {
      width: 100%;
    }

    .help-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .search-results h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .no-results {
      text-align: center;
      padding: 48px 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .no-results mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .suggestion {
      font-size: 14px;
      margin-top: 8px;
    }

    .categories-section {
      height: 100%;
    }

    .category-content {
      padding: 16px 0;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding: 0 16px;
    }

    .category-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      color: #1976d2;
    }

    .category-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .category-header p {
      margin: 4px 0 0 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
      padding: 0 16px;
    }

    .topic-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .topic-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .topic-tags {
      margin-top: 12px;
    }

    .topic-actions {
      margin-top: 12px;
    }

    .priority-high {
      color: #d32f2f !important;
      font-weight: 500;
    }

    .priority-medium {
      color: #f57c00 !important;
    }

    .priority-low {
      color: #388e3c !important;
    }

    .help-mode-banner {
      background-color: #1976d2;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .help-mode-banner button {
      margin-left: auto;
      color: white;
    }

    @media (max-width: 768px) {
      .topics-grid {
        grid-template-columns: 1fr;
        padding: 0 8px;
      }
      
      .help-content {
        padding: 8px;
      }
      
      .category-header {
        padding: 0 8px;
      }
    }
  `]
})
export class HelpCenterComponent implements OnInit, OnDestroy {
  searchQuery = '';
  private searchSubject = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  helpCategories$ = this.helpService.helpCategories$;
  helpTopics$ = this.helpService.helpTopics$;
  isHelpModeActive$ = this.helpService.isHelpModeActive$;

  searchResults$ = combineLatest([
    this.searchSubject,
    this.helpTopics$
  ]).pipe(
    map(([query, topics]) => {
      if (!query.trim()) return [];
      return this.helpService.searchHelpTopics(query);
    })
  );

  private allTopics: HelpTopic[] = [];
  private allCategories: HelpCategory[] = [];

  constructor(
    private helpService: HelpService,
    private router: Router,
    private dialogRef: MatDialogRef<HelpCenterComponent>
  ) {}

  ngOnInit(): void {
    // Load data
    this.helpTopics$
      .pipe(takeUntil(this.destroy$))
      .subscribe(topics => this.allTopics = topics);

    this.helpCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.allCategories = categories);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
  }

  getCategoryName(categoryId: string): string {
    const category = this.allCategories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  getTopicsByCategory(categoryId: string): HelpTopic[] {
    return this.allTopics.filter(topic => topic.category === categoryId);
  }

  showTopic(topic: HelpTopic): void {
    if (topic.actionUrl) {
      this.router.navigate([topic.actionUrl]);
      this.close();
    } else {
      // Show detailed help overlay
      console.log('Show detailed help for:', topic.title);
    }
  }

  toggleHelpMode(): void {
    this.helpService.toggleHelpMode();
  }

  close(): void {
    this.dialogRef.close();
  }
} 