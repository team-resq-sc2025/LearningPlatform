import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../../services/assessment.service';
import { Question, MultipleChoiceOption, QuestionType, DifficultyLevel } from '../../../models/assessment.model';

@Component({
  selector: 'app-question-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-manager.component.html',
  styleUrls: ['./question-manager.component.css']
})
export class QuestionManagerComponent implements OnInit {
  assessmentId: string | null = null;
  questionId: string | null = null;
  question: Question | null = null;
  questionForm: FormGroup;
  options: MultipleChoiceOption[] = [];
  loading = false;
  isEditMode = false;
  questionTypes: QuestionType[] = ['multiple_choice', 'true_false', 'essay', 'short_answer', 'matching', 'code', 'file_upload'];
  difficultyLevels: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      type: ['multiple_choice', Validators.required],
      points: [1, [Validators.required, Validators.min(1)]],
      difficulty: ['medium', Validators.required],
      topic_tags: [''],
      explanation: [''],
      image_url: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assessmentId = params['assessmentId'];
      if (params['questionId'] && params['questionId'] !== 'new') {
        this.questionId = params['questionId'];
        this.isEditMode = true;
        this.loadQuestion(this.assessmentId, params['questionId']);
      }
    });
  }

  loadQuestion(assessmentId: string, questionId: string): void {
    this.loading = true;
    this.assessmentService.getQuestion(assessmentId, questionId).subscribe(
      (response) => {
        this.question = response.question;
        this.options = response.options || [];
        this.questionForm.patchValue(this.question);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading question:', error);
        this.loading = false;
      }
    );
  }

  saveQuestion(): void {
    if (!this.questionForm.valid || !this.assessmentId) return;

    this.loading = true;
    const formValue = this.questionForm.value;
    const topicTags = formValue.topic_tags ? formValue.topic_tags.split(',').map((t: string) => t.trim()) : [];

    const questionData = {
      ...formValue,
      topic_tags: topicTags
    };

    const action = this.questionId
      ? this.assessmentService.updateQuestion(this.assessmentId, this.questionId, questionData)
      : this.assessmentService.createQuestion(this.assessmentId, questionData);

    action.subscribe(
      (question) => {
        this.question = question;
        this.questionId = question.id;
        this.loading = false;
        alert('Question saved successfully!');
        this.router.navigate(['/assessments', this.assessmentId, 'questions']);
      },
      (error) => {
        console.error('Error saving question:', error);
        this.loading = false;
      }
    );
  }

  addOption(): void {
    if (this.questionForm.get('type')?.value === 'multiple_choice' || this.questionForm.get('type')?.value === 'true_false') {
      const newOption: MultipleChoiceOption = {
        id: 'new-' + Date.now(),
        question_id: this.questionId || '',
        text: '',
        is_correct: false,
        order: this.options.length
      };
      this.options.push(newOption);
    }
  }

  removeOption(index: number): void {
    this.options.splice(index, 1);
    this.reorderOptions();
  }

  reorderOptions(): void {
    this.options.forEach((opt, index) => opt.order = index);
  }

  saveOption(index: number): void {
    if (!this.assessmentId || !this.questionId) return;

    const option = this.options[index];
    if (!option.text) {
      alert('Option text is required');
      return;
    }

    this.loading = true;
    const action = option.id.startsWith('new-')
      ? this.assessmentService.createMultipleChoiceOption(this.assessmentId, this.questionId, option)
      : this.assessmentService.updateMultipleChoiceOption(this.assessmentId, this.questionId, option.id, option);

    action.subscribe(
      (savedOption) => {
        this.options[index] = savedOption;
        this.loading = false;
        alert('Option saved successfully!');
      },
      (error) => {
        console.error('Error saving option:', error);
        this.loading = false;
      }
    );
  }

  deleteOption(index: number): void {
    if (!this.assessmentId || !this.questionId) return;

    const option = this.options[index];
    if (!option.id.startsWith('new-')) {
      this.loading = true;
      this.assessmentService.deleteMultipleChoiceOption(this.assessmentId, this.questionId, option.id).subscribe(
        () => {
          this.options.splice(index, 1);
          this.reorderOptions();
          this.loading = false;
        },
        (error) => {
          console.error('Error deleting option:', error);
          this.loading = false;
        }
      );
    } else {
      this.options.splice(index, 1);
      this.reorderOptions();
    }
  }

  setCorrectOption(index: number): void {
    this.options.forEach((opt, i) => {
      opt.is_correct = i === index;
    });
  }

  deleteQuestion(): void {
    if (!this.assessmentId || !this.questionId) return;

    if (confirm('Are you sure you want to delete this question?')) {
      this.loading = true;
      this.assessmentService.deleteQuestion(this.assessmentId, this.questionId).subscribe(
        () => {
          this.loading = false;
          alert('Question deleted successfully!');
          this.router.navigate(['/assessments', this.assessmentId, 'questions']);
        },
        (error) => {
          console.error('Error deleting question:', error);
          this.loading = false;
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/assessments', this.assessmentId, 'questions']);
  }
}
