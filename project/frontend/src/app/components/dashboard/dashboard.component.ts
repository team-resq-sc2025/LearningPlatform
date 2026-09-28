import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  courseCount = 0;
  userCount = 0;
  activeEnrollments = 0;
  loading = true;

  constructor(
    private courseService: CourseService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.courseService.getCourses(0, 1).subscribe(
      (data) => {
        this.courseCount = data.total || 0;
      },
      (error) => console.error('Error loading courses:', error)
    );

    this.userService.getUsers(0, 1).subscribe(
      (data) => {
        this.userCount = data.total || 0;
      },
      (error) => console.error('Error loading users:', error),
      () => this.loading = false
    );
  }
}
