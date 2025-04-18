// Removed duplicate imports for Component, OnInit, and CommonModule. See consolidated imports below.
import { UserService, User } from '../services/user.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers$!: Observable<User[]>;
  displayedColumns: string[] = ['avatar', 'id', 'name', 'email', 'role', 'actions'];
  searchText: string = '';
  private usersSubject = new BehaviorSubject<User[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource!: MatTableDataSource<User>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.dataSource = new MatTableDataSource(this.users);
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
      this.filteredUsers$ = this.dataSource.connect();
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  editUser(user: User): void {
    // TODO: Implement edit user logic (navigate or open dialog)
    alert(`Edit user: ${user.name}`);
  }

  deleteUser(user: User): void {
    // TODO: Implement delete user logic (confirm and remove from list)
    alert(`Delete user: ${user.name}`);
  }

  addUser(): void {
    // TODO: Implement add user logic (navigate or open dialog)
    alert('Add new user');
  }
}
