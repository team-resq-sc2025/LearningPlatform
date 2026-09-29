import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import {
  AssessmentAnalytics, QuestionAnalytics, LearningAnalytics,
  Assessment, AssessmentAttempt
} from '../../../models/assessment.model';

@Component({
  selector: 'app-assessment-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-analytics.component.html',
  styleUrls: ['./assessment-analytics.component.css']
})
export class AssessmentAnalyticsComponent implements OnInit {
  assessmentId: string | null = null;
  assessment: Assessment | null = null;
  analytics: AssessmentAnalytics | null = null;
  questionAnalytics: QuestionAnalytics[] = [];
  attempts: AssessmentAttempt[] = [];
  loading = true;
  selectedQuestionId: string | null = null;
  activeTab: 'overview' | 'questions' | 'attempts' = 'overview';

  // Chart data
  scoreDistribution: any[] = [];
  passFailData: any[] = [];

  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assessmentId = params['assessmentId'];
      if (this.assessmentId) {
        this.loadAnalytics(this.assessmentId);
      }
    });
  }

  loadAnalytics(assessmentId: string): void {
    this.loading = true;

    this.assessmentService.getAssessment(assessmentId).subscribe(
      (assessment) => this.assessment = assessment
    );

    this.assessmentService.getAssessmentAnalytics(assessmentId).subscribe(
      (analytics) => {
        this.analytics = analytics;
        this.prepareChartData();
      }
    );

    this.assessmentService.getAttempts(assessmentId).subscribe(
      (attempts) => {
        this.attempts = attempts;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    );
  }

  loadQuestionAnalytics(assessmentId: string, questionId: string): void {
    this.assessmentService.getQuestionAnalytics(assessmentId, questionId).subscribe(
      (analytics) => {
        const index = this.questionAnalytics.findIndex(q => q.question_id === questionId);
        if (index >= 0) {
          this.questionAnalytics[index] = analytics;
        } else {
          this.questionAnalytics.push(analytics);
        }
      }
    );
  }

  prepareChartData(): void {
    if (!this.analytics) return;

    // Score distribution
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 }
    ];

    // Pass/Fail data
    const passCount = Math.round(this.analytics.average_score / 100 * this.analytics.total_attempts);
    const failCount = this.analytics.total_attempts - passCount;

    this.scoreDistribution = ranges;
    this.passFailData = [
      { status: 'Passed', count: passCount, percentage: ((passCount / this.analytics.total_attempts) * 100).toFixed(1) },
      { status: 'Failed', count: failCount, percentage: ((failCount / this.analytics.total_attempts) * 100).toFixed(1) }
    ];
  }

  getPassPercentageClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  }

  getDifficultyColor(difficulty: number): string {
    if (difficulty >= 0.8) return 'difficulty-hard';
    if (difficulty >= 0.5) return 'difficulty-medium';
    return 'difficulty-easy';
  }

  getDiscriminationColor(discrimination: number): string {
    if (discrimination >= 0.3) return 'discrimination-high';
    if (discrimination >= 0.1) return 'discrimination-medium';
    return 'discrimination-low';
  }

  exportReport(): void {
    if (!this.assessmentId) return;

    this.assessmentService.generateAnalyticsReport(this.assessmentId).subscribe(
      (report) => {
        const element = document.createElement('a');
        element.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
        element.download = `assessment-report-${this.assessmentId}.json`;
        element.click();
      }
    );
  }

  selectQuestion(questionId: string): void {
    this.selectedQuestionId = questionId;
    if (this.assessmentId) {
      this.loadQuestionAnalytics(this.assessmentId, questionId);
    }
  }

  getSelectedQuestionAnalytics(): QuestionAnalytics | undefined {
    return this.questionAnalytics.find(q => q.question_id === this.selectedQuestionId);
  }
}
