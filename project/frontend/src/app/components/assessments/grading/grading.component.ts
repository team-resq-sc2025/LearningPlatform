import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { Assessment, AssessmentAttempt, Answer, GradingQueue, GradingRubric } from '../../../models/assessment.model';

@Component({
  selector: 'app-grading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grading.component.html',
  styleUrls: ['./grading.component.css']
})
export class GradingComponent implements OnInit {
  assessmentId: string | null = null;
  assessment: Assessment | null = null;
  gradingQueue: GradingQueue | null = null;
  rubric: GradingRubric | null = null;
  attempts: AssessmentAttempt[] = [];
  currentAttemptIndex = 0;
  currentAnswers: Answer[] = [];
  currentAnswer: Answer | null = null;
  currentAnswerIndex = 0;
  currentScore = 0;
  currentFeedback = '';
  loading = false;
  filterStatus: 'all' | 'pending' | 'graded' = 'pending';

  constructor(
    private assessmentService: AssessmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assessmentId = params['assessmentId'];
      if (this.assessmentId) {
        this.loadGradingData(this.assessmentId);
      }
    });
  }

  loadGradingData(assessmentId: string): void {
    this.loading = true;

    this.assessmentService.getAssessment(assessmentId).subscribe(
      (assessment) => this.assessment = assessment
    );

    this.assessmentService.getGradingQueue(assessmentId).subscribe(
      (queue) => this.gradingQueue = queue
    );

    this.assessmentService.getGradingRubric(assessmentId).subscribe(
      (rubric) => this.rubric = rubric
    );

    this.assessmentService.getSubmissions(assessmentId, 0, 100).subscribe(
      (data) => {
        this.attempts = data.submissions || [];
        if (this.attempts.length > 0) {
          this.loadAttemptAnswers(assessmentId, this.attempts[0].attempt_id);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error loading grading data:', error);
        this.loading = false;
      }
    );
  }

  loadAttemptAnswers(assessmentId: string, attemptId: string): void {
    this.assessmentService.getAnswers(assessmentId, attemptId).subscribe(
      (answers) => {
        this.currentAnswers = answers.filter(a => !a.manual_score && a.response_text);
        if (this.currentAnswers.length > 0) {
          this.selectAnswer(0);
        }
      }
    );
  }

  selectAttempt(index: number): void {
    this.currentAttemptIndex = index;
    const attempt = this.attempts[index];
    if (this.assessmentId) {
      this.loadAttemptAnswers(this.assessmentId, attempt.id);
    }
  }

  selectAnswer(index: number): void {
    this.currentAnswerIndex = index;
    this.currentAnswer = this.currentAnswers[index];
    if (this.currentAnswer) {
      this.currentScore = this.currentAnswer.manual_score || 0;
      this.currentFeedback = this.currentAnswer.feedback || '';
    }
  }

  gradeCurrentAnswer(): void {
    if (!this.assessmentId || !this.currentAnswer) return;

    const attemptId = this.attempts[this.currentAttemptIndex].id;
    const questionId = this.currentAnswer.question_id;

    this.loading = true;
    this.assessmentService.gradeAnswer(this.assessmentId, attemptId, questionId, this.currentScore, this.currentFeedback).subscribe(
      (answer) => {
        this.currentAnswer = answer;
        this.currentAnswers[this.currentAnswerIndex] = answer;
        this.loading = false;
        alert('Answer graded successfully!');
        this.moveToNextAnswer();
      },
      (error) => {
        console.error('Error grading answer:', error);
        this.loading = false;
      }
    );
  }

  moveToNextAnswer(): void {
    if (this.currentAnswerIndex < this.currentAnswers.length - 1) {
      this.selectAnswer(this.currentAnswerIndex + 1);
    } else if (this.currentAttemptIndex < this.attempts.length - 1) {
      this.selectAttempt(this.currentAttemptIndex + 1);
    } else {
      alert('All answers graded!');
    }
  }

  getProgress(): number {
    const total = this.attempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const graded = this.attempts.filter(a => a.score !== null).length;
    return this.attempts.length > 0 ? (graded / this.attempts.length) * 100 : 0;
  }

  getRubricCriterionScore(criterionId: string): number {
    if (!this.rubric) return 0;
    const criterion = this.rubric.criteria.find(c => c.id === criterionId);
    return criterion?.max_points || 0;
  }

  exportGradingResults(): void {
    const data = this.attempts.map(a => ({
      attempt_id: a.id,
      user_id: a.user_id,
      score: a.score,
      status: a.status,
      submitted_at: a.end_time
    }));

    const element = document.createElement('a');
    element.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    element.download = `grading-results-${this.assessmentId}.json`;
    element.click();
  }
}
