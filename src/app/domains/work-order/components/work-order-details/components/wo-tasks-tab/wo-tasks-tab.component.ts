import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { Task } from '../../../../models/work-order.model';

@Component({
  selector: 'app-wo-tasks-tab',
  template: `
    <div class="tasks-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Tasks</mat-card-title>
          <button mat-raised-button color="primary" (click)="onAddTask()">
            <mat-icon>add</mat-icon> Add Task
          </button>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="!tasks || tasks.length === 0" class="empty-state">
            <mat-icon>task_alt</mat-icon>
            <p>No tasks found</p>
          </div>
          
          <mat-list *ngIf="tasks && tasks.length > 0">
            <mat-list-item *ngFor="let task of tasks" class="task-item">
              <mat-checkbox 
                [checked]="task.completed" 
                (change)="onTaskToggle(task)">
              </mat-checkbox>
              
              <div class="task-content">
                <div class="task-header">
                  <h3 [class.completed]="task.completed">{{ task.title }}</h3>
                  <mat-chip [color]="getPriorityColor(task.priority)">
                    {{ task.priority || 'medium' }}
                  </mat-chip>
                </div>
                
                <p class="task-description" *ngIf="task.description">
                  {{ task.description }}
                </p>
                
                <div class="task-meta">
                  <span *ngIf="task.dueDate">
                    <mat-icon>calendar_today</mat-icon>
                    Due: {{ formatDate(task.dueDate) }}
                  </span>
                  <mat-chip [color]="getStatusColor(task.status)">
                    {{ task.status || 'pending' }}
                  </mat-chip>
                </div>
              </div>
              
              <div class="task-actions">
                <button mat-icon-button (click)="onEditTask(task)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="onDeleteTask(task)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .tasks-container {
      padding: 16px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: rgba(0, 0, 0, 0.54);
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .task-item {
      height: auto !important;
      padding: 16px 0 !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-content {
      flex: 1;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .task-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .task-header h3.completed {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .task-description {
      margin: 0 0 8px 0;
      color: rgba(0, 0, 0, 0.7);
      font-size: 14px;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
    }

    .task-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .task-meta mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .task-actions {
      display: flex;
      gap: 4px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatListModule
  ]
})
export class WoTasksTabComponent {
  @Input() workOrderId!: string;
  @Input() tasks: Task[] | null = [];
  @Output() taskAdded = new EventEmitter<Partial<Task>>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  onAddTask(): void {
    // In a real implementation, this would open a dialog
    // For now, we'll emit a placeholder task
    const newTask: Partial<Task> = {
      title: 'New Task',
      description: 'Task description',
      priority: 'medium',
      status: 'pending'
    };
    this.taskAdded.emit(newTask);
  }

  onTaskToggle(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskUpdated.emit(updatedTask);
  }

  onEditTask(task: Task): void {
    // In a real implementation, this would open a dialog
    // For now, we'll just emit the task
    this.taskUpdated.emit(task);
  }

  onDeleteTask(task: Task): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskDeleted.emit(task.id.toString());
    }
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'critical': return 'warn';
      case 'high': return 'accent';
      default: return 'primary';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'completed':
      case 'Confirmed': return 'primary';
      case 'in-progress': return 'accent';
      case 'delayed': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 