import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CoursesComponent } from './components/courses/courses.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { UsersComponent } from './components/users/users.component';
import { PromptsComponent } from './components/prompts/prompts.component';
import { PromptEditorComponent } from './components/prompt-editor/prompt-editor.component';
import { TechniqueLibraryComponent } from './components/technique-library/technique-library.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'prompts', component: PromptsComponent },
  { path: 'prompts/new', component: PromptEditorComponent },
  { path: 'prompts/:id', component: PromptEditorComponent },
  { path: 'techniques', component: TechniqueLibraryComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: 'assessments', component: AssessmentsComponent },
  { path: 'users', component: UsersComponent },
];
