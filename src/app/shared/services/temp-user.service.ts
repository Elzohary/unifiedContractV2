import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { User } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TempUserService {
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
    }
  ];

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
