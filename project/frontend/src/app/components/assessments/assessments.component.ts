import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentService } from '../../services/assessment.service';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.css']
})
export class AssessmentsComponent implements OnInit {
  assessments: Assessment[] = [];
  loading = true;
  pageSize = 10;
  currentPage = 0;
  totalAssessments = 0;

  constructor(private assessmentService: AssessmentService) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getAssessments(this.currentPage * this.pageSize, this.pageSize).subscribe(
      (data) => {
        this.assessments = data.assessments || [];
        this.totalAssessments = data.total || 0;
        this.loading = false;
      },
      (error) => console.error('Error loading assessments:', error),
      () => this.loading = false
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalAssessments / this.pageSize);
  }
}
