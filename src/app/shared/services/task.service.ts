import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, delay, tap } from 'rxjs/operators';
import { Task } from '../models/work-order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  
  // For mock implementation
  private mockTasks: Task[] = [
    {
      id: 1,
      title: 'Inspect electrical system',
      description: 'Check for any faulty wiring or components',
      assignedTo: 'John Doe',
      dueDate: new Date('2023-12-15'),
      startDate: new Date('2023-12-10'),
      priority: 'high',
      status: 'in-progress',
      completed: false,
      workOrderId: 1001,
      createdBy: 'Admin User',
      createdAt: new Date('2023-12-05')
    },
    {
      id: 2,
      title: 'Replace broken parts',
      description: 'Order and install replacement parts',
      assignedTo: 'Jane Smith',
      dueDate: new Date('2023-12-20'),
      startDate: new Date('2023-12-16'),
      priority: 'medium',
      status: 'pending',
      completed: false,
      workOrderId: 1001,
      createdBy: 'Admin User',
      createdAt: new Date('2023-12-05')
    }
  ];

  constructor(private http: HttpClient) {
    this.tasksSubject.next(this.mockTasks);
  }

  /**
   * Get all tasks related to a work order
   * @param workOrderId The ID of the work order
   * @returns An observable of task array
   */
  getTasksByWorkOrderId(workOrderId: number): Observable<Task[]> {
    // In production, use this:
    // return this.http.get<Task[]>(`${this.apiUrl}/work-orders/${workOrderId}/tasks`)
    //   .pipe(catchError(this.handleError));
    
    // Mock implementation:
    return of(this.mockTasks.filter(task => task.workOrderId === workOrderId))
      .pipe(delay(300));
  }
  
  /**
   * Update a task's status or other properties
   * @param task The task with updated properties
   * @returns An observable of the updated task
   */
  updateTask(task: Task): Observable<Task> {
    // In production, use this:
    // return this.http.put<Task>(`${this.apiUrl}/tasks/${task.id}`, task)
    //   .pipe(catchError(this.handleError));
    
    // Mock implementation:
    const index = this.mockTasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      this.mockTasks[index] = {...this.mockTasks[index], ...task};
      this.tasksSubject.next([...this.mockTasks]);
      return of(this.mockTasks[index]).pipe(delay(300));
    }
    return throwError(() => new Error('Task not found'));
  }
  
  /**
   * Create a new task
   * @param task The task to create
   * @returns An observable of the created task
   */
  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    // In production, use this:
    // return this.http.post<Task>(`${this.apiUrl}/tasks`, task)
    //   .pipe(catchError(this.handleError));
    
    // Mock implementation:
    const newId = Math.max(...this.mockTasks.map(t => Number(t.id)), 0) + 1;
    const newTask: Task = {
      ...task,
      id: newId,
      createdAt: new Date(),
      status: task.status || 'pending',
      completed: false
    };
    
    this.mockTasks.push(newTask);
    this.tasksSubject.next([...this.mockTasks]);
    return of(newTask).pipe(delay(300));
  }
  
  /**
   * Delete a task
   * @param taskId The ID of the task to delete
   * @returns An observable of the API response
   */
  deleteTask(taskId: number): Observable<any> {
    // In production, use this:
    // return this.http.delete(`${this.apiUrl}/tasks/${taskId}`)
    //   .pipe(catchError(this.handleError));
    
    // Mock implementation:
    const index = this.mockTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.mockTasks.splice(index, 1);
      this.tasksSubject.next([...this.mockTasks]);
      return of({ success: true }).pipe(delay(300));
    }
    return throwError(() => new Error('Task not found'));
  }
  
  /**
   * Handle HTTP errors
   * @param error The HTTP error response
   * @returns An observable with the error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 