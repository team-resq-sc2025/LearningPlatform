import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LearningService } from '../../../services/learning.service';
import { StudentDashboard, Course, Enrollment, DashboardActivity } from '../../../models/learning.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  dashboard: StudentDashboard | null = null;
  loading = true;
  activeTab: 'overview' | 'active' | 'completed' | 'recommended' = 'overview';

  constructor(private learningService: LearningService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.learningService.getStudentDashboard().subscribe(
      (dashboard) => {
        this.dashboard = dashboard;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    );
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return 'progress-excellent';
    if (percentage >= 60) return 'progress-good';
    if (percentage >= 40) return 'progress-fair';
    return 'progress-low';
  }

  getCompletionStatus(enrollment: Enrollment): string {
    if (enrollment.enrollment_status === 'completed') return 'Completed';
    return `${enrollment.completion_percentage}% Complete`;
  }

  getDaysRemaining(enrollment: Enrollment): number | null {
    if (!enrollment.completed_at) return null;
    const enrolled = new Date(enrollment.enrolled_at);
    const daysActive = Math.floor((Date.now() - enrolled.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, enrollment.completion_percentage === 100 ? 0 : 30 - daysActive);
  }

  resumeCourse(courseId: string): void {
    console.log('Resume course:', courseId);
    // Navigate to course player
  }

  enrollCourse(courseId: string): void {
    this.learningService.enrollInCourse(courseId).subscribe(
      () => {
        alert('Successfully enrolled!');
        this.loadDashboard();
      },
      (error) => console.error('Error enrolling:', error)
    );
  }

  viewCourse(courseId: string): void {
    console.log('View course:', courseId);
    // Navigate to course detail
  }
}
