import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  pageSize = 10;
  currentPage = 0;
  totalUsers = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers(this.currentPage * this.pageSize, this.pageSize).subscribe(
      (data) => {
        this.users = data.users || [];
        this.totalUsers = data.total || 0;
        this.loading = false;
      },
      (error) => console.error('Error loading users:', error),
      () => this.loading = false
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }
}
