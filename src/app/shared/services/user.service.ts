import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { User } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mock users data
  private mockUsers: User[] = [
    {
      id: 'user1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'engineer',
      avatar: 'assets/avatars/user1.jpg'
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'administrator',
      avatar: 'assets/avatars/user2.jpg'
    },
    {
      id: 'user3',
      name: 'Michael Wong',
      email: 'michael.wong@example.com',
      role: 'foreman',
      avatar: 'assets/avatars/user3.jpg'
    },
    {
      id: 'user4',
      name: 'Emily Chen',
      email: 'emily.chen@example.com',
      role: 'engineer',
      avatar: 'assets/avatars/user4.jpg'
    },
    {
      id: 'user5',
      name: 'Robert Davis',
      email: 'robert.davis@example.com',
      role: 'worker',
      avatar: 'assets/avatars/user5.jpg'
    },
    {
      id: 'user6',
      name: 'Anna Martinez',
      email: 'anna.martinez@example.com',
      role: 'worker',
      avatar: 'assets/avatars/user6.jpg'
    },
    {
      id: 'user7',
      name: 'David Park',
      email: 'david.park@example.com',
      role: 'engineer',
      avatar: 'assets/avatars/user7.jpg'
    },
    {
      id: 'user8',
      name: 'Lisa Turner',
      email: 'lisa.turner@example.com',
      role: 'administrator',
      avatar: 'assets/avatars/user8.jpg'
    }
  ];

  // Current logged-in user - in a real app this would come from an auth service
  private currentUserId = 'user1'; // Default to a mock user for development

  /**
   * Get the ID of the currently logged-in user
   * In a real application, this would be retrieved from an AuthService or JWT token
   */
  getCurrentUserId(): string {
    // In a real app, get from AuthService or localStorage
    return this.currentUserId || localStorage.getItem('user_id') || 'user1';
  }

  /**
   * Get the name of the currently logged-in user
   */
  getCurrentUserName(): string {
    const userId = this.getCurrentUserId();
    const user = this.mockUsers.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  }

  /**
   * Set the current user ID (for simulation/testing purposes)
   */
  setCurrentUser(userId: string): void {
    if (this.mockUsers.some(u => u.id === userId)) {
      this.currentUserId = userId;
    } else {
      console.warn(`User with ID ${userId} not found`);
    }
  }

  /**
   * Get all users
   */
  getUsers(): Observable<User[]> {
    return of(this.mockUsers).pipe(
      delay(300),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to fetch users'));
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<User | null> {
    const user = this.mockUsers.find(u => u.id === userId);

    if (!user) {
      return of(null).pipe(delay(300));
    }

    return of(user).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error fetching user ${userId}:`, error);
        return throwError(() => new Error(`Failed to fetch user ${userId}`));
      })
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<User[]> {
    const users = this.mockUsers.filter(u => u.role === role);

    return of(users).pipe(
      delay(300),
      catchError(error => {
        console.error(`Error fetching users with role ${role}:`, error);
        return throwError(() => new Error(`Failed to fetch users with role ${role}`));
      })
    );
  }

  /**
   * Search users by name or email
   */
  searchUsers(query: string): Observable<User[]> {
    if (!query || query.trim() === '') {
      return of(this.mockUsers).pipe(delay(300));
    }

    const queryLower = query.toLowerCase().trim();
    const filteredUsers = this.mockUsers.filter(user =>
      user.name.toLowerCase().includes(queryLower) ||
      user.email.toLowerCase().includes(queryLower)
    );

    return of(filteredUsers).pipe(delay(300));
  }

  /**
   * Get users by IDs
   */
  getUsersByIds(userIds: string[]): Observable<User[]> {
    const users = this.mockUsers.filter(u => userIds.includes(u.id));

    return of(users).pipe(
      delay(300),
      catchError(error => {
        console.error('Error fetching users by IDs:', error);
        return throwError(() => new Error('Failed to fetch users by IDs'));
      })
    );
  }
}
