import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course, Module } from '../../models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  modules: Module[] = [];
  loading = true;
  courseId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.loadCourseDetail();
    }
  }

  loadCourseDetail(): void {
    if (!this.courseId) return;

    this.courseService.getCourse(this.courseId).subscribe(
      (course) => {
        this.course = course;
        return this.courseService.getModules(this.courseId!);
      },
      (error) => console.error('Error loading course:', error),
      () => this.loading = false
    );
  }
}
