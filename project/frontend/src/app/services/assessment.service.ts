import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assessment, Question, Submission } from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = '/api/v1/assessments';

  constructor(private http: HttpClient) {}

  getAssessments(skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getAssessment(id: string): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/${id}`);
  }

  createAssessment(assessment: Partial<Assessment>): Observable<Assessment> {
    return this.http.post<Assessment>(this.apiUrl, assessment);
  }

  updateAssessment(id: string, assessment: Partial<Assessment>): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.apiUrl}/${id}`, assessment);
  }

  deleteAssessment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getQuestions(assessmentId: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/${assessmentId}/questions`);
  }

  getSubmissions(assessmentId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/${assessmentId}/submissions`);
  }

  submitAssessment(assessmentId: string, submission: Partial<Submission>): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/${assessmentId}/submit`, submission);
  }
}
