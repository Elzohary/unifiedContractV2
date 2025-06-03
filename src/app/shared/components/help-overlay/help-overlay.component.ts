import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

// Services and Models
import { HelpService, HelpTopic } from '../../services/help.service';

@Component({
  selector: 'app-help-overlay',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="help-overlay" [class.visible]="isVisible" (click)="onBackdropClick($event)">
      <div class="help-content" [class]="'position-' + topic.position" *ngIf="topic">
        <mat-card class="help-card">
          <mat-card-header>
            <div class="help-header">
              <mat-icon class="help-icon">{{topic.icon || 'help'}}</mat-icon>
              <mat-card-title class="help-title">{{topic.title}}</mat-card-title>
              <button mat-icon-button (click)="close()" class="close-button">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <p class="help-description">{{topic.description}}</p>
            
            <div class="help-tags" *ngIf="topic.tags && topic.tags.length > 0">
              <span class="tag" *ngFor="let tag of topic.tags">{{tag}}</span>
            </div>
          </mat-card-content>
          
          <mat-card-actions *ngIf="topic.actionUrl || topic.actionText">
            <button mat-raised-button 
                    color="primary" 
                    (click)="performAction()"
                    *ngIf="topic.actionUrl">
              <mat-icon>{{topic.icon}}</mat-icon>
              {{topic.actionText || 'Learn More'}}
            </button>
            <button mat-button (click)="close()">Got it</button>
          </mat-card-actions>
          
          <mat-card-actions *ngIf="!topic.actionUrl && !topic.actionText">
            <button mat-raised-button color="primary" (click)="close()">
              <mat-icon>check</mat-icon>
              Got it
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .help-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .help-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    .help-content {
      max-width: 400px;
      width: 90%;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .help-card {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .help-header {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .help-icon {
      color: #1976d2;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .help-title {
      flex: 1;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .close-button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .help-description {
      margin: 0 0 16px 0;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
    }

    .help-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .tag {
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.6);
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    // Position classes for different overlay positions
    .position-top .help-content {
      margin-bottom: auto;
      margin-top: 20px;
    }

    .position-bottom .help-content {
      margin-top: auto;
      margin-bottom: 20px;
    }

    .position-left .help-content {
      margin-right: auto;
      margin-left: 20px;
    }

    .position-right .help-content {
      margin-left: auto;
      margin-right: 20px;
    }

    @media (max-width: 768px) {
      .help-content {
        width: 95%;
        max-width: none;
      }
      
      .help-title {
        font-size: 16px;
      }
    }
  `]
})
export class HelpOverlayComponent implements OnInit, OnDestroy {
  @Input() topic!: HelpTopic;
  @Input() isVisible = false;
  @Output() close$ = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    // Listen for escape key
    document.addEventListener('keydown', this.onEscapeKey.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onEscapeKey.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.close$.emit();
  }

  performAction(): void {
    if (this.topic.actionUrl) {
      this.router.navigate([this.topic.actionUrl]);
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isVisible) {
      this.close();
    }
  }
} 