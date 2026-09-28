import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  error: string | null = null;
  pageSize = 10;
  currentPage = 0;
  totalCourses = 0;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getCourses(this.currentPage * this.pageSize, this.pageSize).subscribe(
      (data) => {
        this.courses = data.courses || [];
        this.totalCourses = data.total || 0;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses';
        this.loading = false;
      }
    );
  }

  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadCourses();
    }
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.totalCourses) {
      this.currentPage++;
      this.loadCourses();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCourses / this.pageSize);
  }
}
