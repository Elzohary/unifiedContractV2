import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/work-order.model';

export interface AuthUser extends User {
  email: string;
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Mock user for development
  private mockUsers: AuthUser[] = [
    {
      id: 'user1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'engineer',
      avatar: 'assets/avatars/user1.jpg',
      permissions: ['work-orders.view', 'work-orders.edit', 'remarks.view', 'remarks.add'],
      isActive: true,
      lastLogin: new Date()
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'administrator',
      avatar: 'assets/avatars/user2.jpg',
      permissions: ['work-orders.view', 'work-orders.edit', 'work-orders.delete', 'admin.users', 'admin.settings'],
      isActive: true,
      lastLogin: new Date()
    }
  ];

  constructor() {
    // Simulate logged in user for development
    this.currentUserSubject.next(this.mockUsers[0]);
    
    // Check for stored auth token and restore session
    this.checkStoredAuth();
  }

  /**
   * Check if user is logged in
   */
  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * Get current user value
   */
  get currentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<AuthUser> {
    // In a real application, this would make an API call to validate credentials
    const user = this.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    
    if (!user.isActive) {
      return throwError(() => new Error('Account is inactive'));
    }
    
    // Simulate successful login
    return of(user).pipe(
      delay(800), // Simulate network delay
      tap(user => {
        // Save auth data to localStorage for session persistence
        localStorage.setItem('auth_token', this.generateMockToken(user));
        localStorage.setItem('user_id', user.id);
        
        // Update user's last login
        user.lastLogin = new Date();
        
        // Update current user subject
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<boolean> {
    // Clear stored auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    
    // Clear current user
    this.currentUserSubject.next(null);
    
    return of(true).pipe(delay(300));
  }

  /**
   * Check if the user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    return user.permissions.includes(permission);
  }

  /**
   * Register a new user
   */
  register(userData: Partial<AuthUser>): Observable<AuthUser> {
    // In a real implementation, this would make an API call
    
    // Check if email already exists
    if (this.mockUsers.some(u => u.email.toLowerCase() === userData.email?.toLowerCase())) {
      return throwError(() => new Error('Email already in use'));
    }
    
    // Create new user
    const newUser: AuthUser = {
      id: `user${this.mockUsers.length + 1}`,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'engineer',
      avatar: userData.avatar || 'assets/avatars/default.jpg',
      permissions: userData.permissions || ['work-orders.view'],
      isActive: true,
      lastLogin: new Date()
    };
    
    // Add to mock users
    this.mockUsers.push(newUser);
    
    // Auto login the new user
    this.currentUserSubject.next(newUser);
    
    return of(newUser).pipe(delay(800));
  }

  /**
   * Check for stored authentication and restore session
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (token && userId) {
      // In a real app, validate the token with the server
      const user = this.mockUsers.find(u => u.id === userId);
      
      if (user) {
        this.currentUserSubject.next(user);
      } else {
        // Invalid stored user, clear storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
      }
    }
  }

  /**
   * Generate a mock JWT token (for development only)
   */
  private generateMockToken(user: AuthUser): string {
    // This is a simplistic mock token, not a real JWT
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      exp: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }
} 