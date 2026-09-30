import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  Assessment, Question, Submission, AssessmentAttempt, Answer, QuestionBank,
  GradingRubric, AssessmentAnalytics, QuestionAnalytics, Certificate,
  CertificateTemplate, ProctorSession, GradingQueue, LearningAnalytics,
  AttemptConfig, MultipleChoiceOption, QuestionResponse
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = '/api/v1/assessments';
  private currentAttempt$ = new BehaviorSubject<AssessmentAttempt | null>(null);

  constructor(private http: HttpClient) {}

  // ==================== ASSESSMENT MANAGEMENT ====================
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

  publishAssessment(id: string): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}/${id}/publish`, {});
  }

  archiveAssessment(id: string): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}/${id}/archive`, {});
  }

  // ==================== QUESTION MANAGEMENT ====================
  getQuestions(assessmentId: string, skip: number = 0, limit: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/${assessmentId}/questions`, { params });
  }

  getQuestion(assessmentId: string, questionId: string): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`${this.apiUrl}/${assessmentId}/questions/${questionId}`);
  }

  createQuestion(assessmentId: string, question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/${assessmentId}/questions`, question);
  }

  updateQuestion(assessmentId: string, questionId: string, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${assessmentId}/questions/${questionId}`, question);
  }

  deleteQuestion(assessmentId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${assessmentId}/questions/${questionId}`);
  }

  reorderQuestions(assessmentId: string, questionIds: string[]): Observable<Question[]> {
    return this.http.post<Question[]>(`${this.apiUrl}/${assessmentId}/questions/reorder`, { question_ids: questionIds });
  }

  createMultipleChoiceOption(assessmentId: string, questionId: string, option: Partial<MultipleChoiceOption>): Observable<MultipleChoiceOption> {
    return this.http.post<MultipleChoiceOption>(`${this.apiUrl}/${assessmentId}/questions/${questionId}/options`, option);
  }

  updateMultipleChoiceOption(assessmentId: string, questionId: string, optionId: string, option: Partial<MultipleChoiceOption>): Observable<MultipleChoiceOption> {
    return this.http.put<MultipleChoiceOption>(`${this.apiUrl}/${assessmentId}/questions/${questionId}/options/${optionId}`, option);
  }

  deleteMultipleChoiceOption(assessmentId: string, questionId: string, optionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${assessmentId}/questions/${questionId}/options/${optionId}`);
  }

  importQuestionsFromBank(assessmentId: string, bankId: string, questionIds: string[]): Observable<Question[]> {
    return this.http.post<Question[]>(`${this.apiUrl}/${assessmentId}/import-bank-questions`, { bank_id: bankId, question_ids: questionIds });
  }

  // ==================== QUESTION BANK ====================
  getQuestionBanks(courseId: string, skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit)
      .set('course_id', courseId);
    return this.http.get<any>(`/api/v1/question-banks`, { params });
  }

  getQuestionBank(bankId: string): Observable<QuestionBank> {
    return this.http.get<QuestionBank>(`/api/v1/question-banks/${bankId}`);
  }

  createQuestionBank(bank: Partial<QuestionBank>): Observable<QuestionBank> {
    return this.http.post<QuestionBank>(`/api/v1/question-banks`, bank);
  }

  updateQuestionBank(bankId: string, bank: Partial<QuestionBank>): Observable<QuestionBank> {
    return this.http.put<QuestionBank>(`/api/v1/question-banks/${bankId}`, bank);
  }

  deleteQuestionBank(bankId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/question-banks/${bankId}`);
  }

  // ==================== ATTEMPT MANAGEMENT ====================
  startAttempt(assessmentId: string): Observable<AssessmentAttempt> {
    return this.http.post<AssessmentAttempt>(`${this.apiUrl}/${assessmentId}/attempts`, {});
  }

  getAttempts(assessmentId: string, userId?: string): Observable<AssessmentAttempt[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId);
    }
    return this.http.get<AssessmentAttempt[]>(`${this.apiUrl}/${assessmentId}/attempts`, { params });
  }

  getAttempt(assessmentId: string, attemptId: string): Observable<AssessmentAttempt> {
    return this.http.get<AssessmentAttempt>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}`);
  }

  submitAttempt(assessmentId: string, attemptId: string): Observable<AssessmentAttempt> {
    return this.http.post<AssessmentAttempt>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}/submit`, {});
  }

  saveAnswer(assessmentId: string, attemptId: string, questionId: string, answer: Partial<Answer>): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}/answers/${questionId}`, answer);
  }

  getAnswers(assessmentId: string, attemptId: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}/answers`);
  }

  flagQuestion(assessmentId: string, attemptId: string, questionId: string): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}/answers/${questionId}/flag`, {});
  }

  getAttemptConfig(assessmentId: string): Observable<AttemptConfig> {
    return this.http.get<AttemptConfig>(`${this.apiUrl}/${assessmentId}/attempt-config`);
  }

  updateAttemptConfig(assessmentId: string, config: Partial<AttemptConfig>): Observable<AttemptConfig> {
    return this.http.put<AttemptConfig>(`${this.apiUrl}/${assessmentId}/attempt-config`, config);
  }

  getCurrentAttempt() {
    return this.currentAttempt$.asObservable();
  }

  setCurrentAttempt(attempt: AssessmentAttempt | null) {
    this.currentAttempt$.next(attempt);
  }

  // ==================== SUBMISSION & GRADING ====================
  getSubmissions(assessmentId: string, skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/${assessmentId}/submissions`, { params });
  }

  submitAssessment(assessmentId: string, submission: Partial<Submission>): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/${assessmentId}/submit`, submission);
  }

  getSubmission(assessmentId: string, submissionId: string): Observable<Submission> {
    return this.http.get<Submission>(`${this.apiUrl}/${assessmentId}/submissions/${submissionId}`);
  }

  gradeSubmission(assessmentId: string, submissionId: string, score: number, feedback?: string): Observable<Submission> {
    return this.http.post<Submission>(`${this.apiUrl}/${assessmentId}/submissions/${submissionId}/grade`, { score, feedback });
  }

  getGradingQueue(assessmentId: string): Observable<GradingQueue> {
    return this.http.get<GradingQueue>(`${this.apiUrl}/${assessmentId}/grading-queue`);
  }

  gradeAnswer(assessmentId: string, attemptId: string, questionId: string, score: number, feedback?: string): Observable<Answer> {
    return this.http.post<Answer>(`${this.apiUrl}/${assessmentId}/attempts/${attemptId}/answers/${questionId}/grade`, { score, feedback });
  }

  // ==================== RUBRICS ====================
  getGradingRubric(assessmentId: string): Observable<GradingRubric> {
    return this.http.get<GradingRubric>(`${this.apiUrl}/${assessmentId}/rubric`);
  }

  createGradingRubric(assessmentId: string, rubric: Partial<GradingRubric>): Observable<GradingRubric> {
    return this.http.post<GradingRubric>(`${this.apiUrl}/${assessmentId}/rubric`, rubric);
  }

  updateGradingRubric(assessmentId: string, rubric: Partial<GradingRubric>): Observable<GradingRubric> {
    return this.http.put<GradingRubric>(`${this.apiUrl}/${assessmentId}/rubric`, rubric);
  }

  // ==================== ANALYTICS ====================
  getAssessmentAnalytics(assessmentId: string): Observable<AssessmentAnalytics> {
    return this.http.get<AssessmentAnalytics>(`${this.apiUrl}/${assessmentId}/analytics`);
  }

  getQuestionAnalytics(assessmentId: string, questionId: string): Observable<QuestionAnalytics> {
    return this.http.get<QuestionAnalytics>(`${this.apiUrl}/${assessmentId}/questions/${questionId}/analytics`);
  }

  getLearningAnalytics(assessmentId: string, userId: string): Observable<LearningAnalytics> {
    return this.http.get<LearningAnalytics>(`${this.apiUrl}/${assessmentId}/learning-analytics/${userId}`);
  }

  generateAnalyticsReport(assessmentId: string, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    return this.http.get<any>(`${this.apiUrl}/${assessmentId}/analytics/report`, { params });
  }

  // ==================== CERTIFICATES ====================
  getCertificates(assessmentId: string, skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(`${this.apiUrl}/${assessmentId}/certificates`, { params });
  }

  getCertificate(certificateId: string): Observable<Certificate> {
    return this.http.get<Certificate>(`/api/v1/certificates/${certificateId}`);
  }

  verifyCertificate(verificationCode: string): Observable<Certificate> {
    return this.http.get<Certificate>(`/api/v1/certificates/verify/${verificationCode}`);
  }

  generateCertificate(attemptId: string): Observable<Certificate> {
    return this.http.post<Certificate>(`/api/v1/certificates`, { attempt_id: attemptId });
  }

  getCertificateTemplates(courseId: string): Observable<CertificateTemplate[]> {
    return this.http.get<CertificateTemplate[]>(`/api/v1/courses/${courseId}/certificate-templates`);
  }

  createCertificateTemplate(courseId: string, template: Partial<CertificateTemplate>): Observable<CertificateTemplate> {
    return this.http.post<CertificateTemplate>(`/api/v1/courses/${courseId}/certificate-templates`, template);
  }

  updateCertificateTemplate(templateId: string, template: Partial<CertificateTemplate>): Observable<CertificateTemplate> {
    return this.http.put<CertificateTemplate>(`/api/v1/certificate-templates/${templateId}`, template);
  }

  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.http.get(`/api/v1/certificates/${certificateId}/download`, { responseType: 'blob' });
  }

  // ==================== PROCTORING ====================
  startProctorSession(attemptId: string): Observable<ProctorSession> {
    return this.http.post<ProctorSession>(`/api/v1/proctor-sessions`, { attempt_id: attemptId });
  }

  getProctorSession(sessionId: string): Observable<ProctorSession> {
    return this.http.get<ProctorSession>(`/api/v1/proctor-sessions/${sessionId}`);
  }

  recordSuspiciousActivity(sessionId: string, activity: any): Observable<any> {
    return this.http.post(`/api/v1/proctor-sessions/${sessionId}/flag-activity`, activity);
  }

  endProctorSession(sessionId: string): Observable<ProctorSession> {
    return this.http.post<ProctorSession>(`/api/v1/proctor-sessions/${sessionId}/end`, {});
  }
}
