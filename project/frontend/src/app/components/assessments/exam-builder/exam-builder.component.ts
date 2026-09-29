import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { Assessment, Question, AttemptConfig } from '../../../models/assessment.model';

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exam-builder.component.html',
  styleUrls: ['./exam-builder.component.css']
})
export class ExamBuilderComponent implements OnInit {
  assessment: Assessment | null = null;
  questions: Question[] = [];
  assessmentForm: FormGroup;
  attemptConfigForm: FormGroup;
  loading = false;
  activeTab: 'settings' | 'questions' | 'config' = 'settings';
  assessmentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.assessmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['exam', Validators.required],
      pass_percentage: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      time_limit_minutes: [60, [Validators.min(0)]],
      allow_retakes: [false],
      max_retakes: [0],
      show_correct_answers: [true],
      show_feedback: [true],
      randomize_questions: [false],
      randomize_options: [false],
      proctoring_enabled: [false],
      proctoring_type: ['browser_lock']
    });

    this.attemptConfigForm = this.fb.group({
      max_attempts: [1, [Validators.required, Validators.min(1)]],
      time_limit_minutes: [60, [Validators.required, Validators.min(0)]],
      show_results_immediately: [true],
      show_correct_answers_after: ['after_submission'],
      allow_review: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.assessmentId = params['id'];
        this.loadAssessment(params['id']);
      }
    });
  }

  loadAssessment(id: string): void {
    this.loading = true;
    this.assessmentService.getAssessment(id).subscribe(
      (assessment) => {
        this.assessment = assessment;
        this.assessmentForm.patchValue(assessment);
        this.loadQuestions(id);
        this.loadAttemptConfig(id);
      },
      (error) => {
        console.error('Error loading assessment:', error);
        this.loading = false;
      }
    );
  }

  loadQuestions(assessmentId: string): void {
    this.assessmentService.getQuestions(assessmentId).subscribe(
      (data) => {
        this.questions = data.questions || [];
        this.loading = false;
      },
      (error) => {
        console.error('Error loading questions:', error);
        this.loading = false;
      }
    );
  }

  loadAttemptConfig(assessmentId: string): void {
    this.assessmentService.getAttemptConfig(assessmentId).subscribe(
      (config) => {
        this.attemptConfigForm.patchValue(config);
      },
      (error) => console.error('Error loading attempt config:', error)
    );
  }

  saveAssessment(): void {
    if (!this.assessmentForm.valid) return;

    this.loading = true;
    const formValue = this.assessmentForm.value;

    const action = this.assessmentId
      ? this.assessmentService.updateAssessment(this.assessmentId, formValue)
      : this.assessmentService.createAssessment(formValue);

    action.subscribe(
      (assessment) => {
        this.assessment = assessment;
        this.assessmentId = assessment.id;
        this.loading = false;
        alert('Assessment saved successfully!');
      },
      (error) => {
        console.error('Error saving assessment:', error);
        this.loading = false;
      }
    );
  }

  saveAttemptConfig(): void {
    if (!this.assessmentId) return;
    if (!this.attemptConfigForm.valid) return;

    this.loading = true;
    this.assessmentService.updateAttemptConfig(this.assessmentId, this.attemptConfigForm.value).subscribe(
      () => {
        this.loading = false;
        alert('Attempt configuration saved successfully!');
      },
      (error) => {
        console.error('Error saving config:', error);
        this.loading = false;
      }
    );
  }

  publishAssessment(): void {
    if (!this.assessmentId) return;

    this.loading = true;
    this.assessmentService.publishAssessment(this.assessmentId).subscribe(
      (assessment) => {
        this.assessment = assessment;
        this.loading = false;
        alert('Assessment published successfully!');
      },
      (error) => {
        console.error('Error publishing assessment:', error);
        this.loading = false;
      }
    );
  }

  archiveAssessment(): void {
    if (!this.assessmentId) return;

    if (confirm('Are you sure you want to archive this assessment?')) {
      this.loading = true;
      this.assessmentService.archiveAssessment(this.assessmentId).subscribe(
        (assessment) => {
          this.assessment = assessment;
          this.loading = false;
          alert('Assessment archived successfully!');
        },
        (error) => {
          console.error('Error archiving assessment:', error);
          this.loading = false;
        }
      );
    }
  }

  manageQuestions(): void {
    if (this.assessmentId) {
      this.router.navigate(['/assessments', this.assessmentId, 'questions']);
    }
  }

  viewAnalytics(): void {
    if (this.assessmentId) {
      this.router.navigate(['/assessments', this.assessmentId, 'analytics']);
    }
  }
}
