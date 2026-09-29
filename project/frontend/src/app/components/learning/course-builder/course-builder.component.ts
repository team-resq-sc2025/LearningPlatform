import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningService } from '../../../services/learning.service';
import { Course, CourseModule, Lesson, CourseSettings } from '../../../models/learning.model';

@Component({
  selector: 'app-course-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-builder.component.html',
  styleUrls: ['./course-builder.component.css']
})
export class CourseBuilderComponent implements OnInit {
  course: Course | null = null;
  courseId: string | null = null;
  courseForm: FormGroup;
  courseSettingsForm: FormGroup;
  modules: CourseModule[] = [];
  loading = false;
  activeTab: 'details' | 'modules' | 'settings' = 'details';

  constructor(
    private fb: FormBuilder,
    private learningService: LearningService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['', Validators.required],
      level: ['beginner', Validators.required],
      duration_hours: [0, [Validators.min(0)]],
      estimated_completion_days: [30, [Validators.min(1)]],
      thumbnail_url: ['']
    });

    this.courseSettingsForm = this.fb.group({
      allow_enrollment: [true],
      allow_unenrollment: [true],
      is_self_paced: [true],
      max_participants: [null],
      passing_score: [70],
      allow_lesson_replay: [true],
      track_time_spent: [true],
      send_completion_emails: [true],
      send_reminder_emails: [false],
      display_progress_bar: [true],
      display_completion_percentage: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.courseId = params['id'];
        this.loadCourse(params['id']);
      }
    });
  }

  loadCourse(id: string): void {
    this.loading = true;
    this.learningService.getCourse(id).subscribe(
      (course) => {
        this.course = course;
        this.courseForm.patchValue(course);
        this.loadModules(id);
        this.loadSettings(id);
      },
      (error) => {
        console.error('Error loading course:', error);
        this.loading = false;
      }
    );
  }

  loadModules(courseId: string): void {
    this.learningService.getModules(courseId).subscribe(
      (modules) => {
        this.modules = modules;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading modules:', error);
        this.loading = false;
      }
    );
  }

  loadSettings(courseId: string): void {
    this.learningService.getCourseSettings(courseId).subscribe(
      (settings) => {
        this.courseSettingsForm.patchValue(settings);
      },
      (error) => console.error('Error loading settings:', error)
    );
  }

  saveCourse(): void {
    if (!this.courseForm.valid) return;

    this.loading = true;
    const formValue = this.courseForm.value;

    const action = this.courseId
      ? this.learningService.updateCourse(this.courseId, formValue)
      : this.learningService.createCourse(formValue);

    action.subscribe(
      (course) => {
        this.course = course;
        this.courseId = course.id;
        this.loading = false;
        alert('Course saved successfully!');
      },
      (error) => {
        console.error('Error saving course:', error);
        this.loading = false;
      }
    );
  }

  saveSettings(): void {
    if (!this.courseId || !this.courseSettingsForm.valid) return;

    this.loading = true;
    this.learningService.updateCourseSettings(this.courseId, this.courseSettingsForm.value).subscribe(
      () => {
        this.loading = false;
        alert('Settings saved successfully!');
      },
      (error) => {
        console.error('Error saving settings:', error);
        this.loading = false;
      }
    );
  }

  publishCourse(): void {
    if (!this.courseId) return;

    this.loading = true;
    this.learningService.publishCourse(this.courseId).subscribe(
      (course) => {
        this.course = course;
        this.loading = false;
        alert('Course published successfully!');
      },
      (error) => {
        console.error('Error publishing course:', error);
        this.loading = false;
      }
    );
  }

  archiveCourse(): void {
    if (!this.courseId) return;

    if (confirm('Are you sure you want to archive this course?')) {
      this.loading = true;
      this.learningService.archiveCourse(this.courseId).subscribe(
        (course) => {
          this.course = course;
          this.loading = false;
          alert('Course archived successfully!');
        },
        (error) => {
          console.error('Error archiving course:', error);
          this.loading = false;
        }
      );
    }
  }

  addModule(): void {
    if (!this.courseId) return;

    const moduleName = prompt('Enter module name:');
    if (!moduleName) return;

    this.loading = true;
    this.learningService.createModule(this.courseId, {
      title: moduleName,
      order: this.modules.length
    }).subscribe(
      (module) => {
        this.modules.push(module);
        this.loading = false;
      },
      (error) => {
        console.error('Error creating module:', error);
        this.loading = false;
      }
    );
  }

  deleteModule(moduleId: string): void {
    if (!this.courseId) return;

    if (confirm('Are you sure you want to delete this module?')) {
      this.loading = true;
      this.learningService.deleteModule(this.courseId, moduleId).subscribe(
        () => {
          this.modules = this.modules.filter(m => m.id !== moduleId);
          this.loading = false;
        },
        (error) => {
          console.error('Error deleting module:', error);
          this.loading = false;
        }
      );
    }
  }

  manageLessons(moduleId: string): void {
    if (this.courseId) {
      this.router.navigate(['/courses', this.courseId, 'modules', moduleId, 'lessons']);
    }
  }

  manageContent(): void {
    if (this.courseId) {
      this.router.navigate(['/courses', this.courseId, 'content']);
    }
  }

  viewAnalytics(): void {
    if (this.courseId) {
      this.router.navigate(['/courses', this.courseId, 'analytics']);
    }
  }
}
