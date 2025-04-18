import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const MOCK_USERS: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager' }
];

@Injectable({ providedIn: 'root' })
export class UserService {
  // Set this to true to use API, false to use mock data
  private useApi = false;

  constructor() {}

  getUsers(): Observable<User[]> {
    if (this.useApi) {
      // TODO: Replace with actual API call, e.g. this.http.get<User[]>('/api/users')
      return of([]); // Placeholder for API integration
    } else {
      return of(MOCK_USERS);
    }
  }
}
