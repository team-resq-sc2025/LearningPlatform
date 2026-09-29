import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  Course, CourseModule, Lesson, LessonContent, Material, CourseResource,
  LearningPath, LearningPathCourse, Enrollment, CourseProgress, LessonProgress,
  StudentDashboard, CourseRecommendation, LearnerProfile, CourseAnalytics,
  LearnerAnalytics, ContentUpload, CourseSettings, CourseDiscussion,
  SkillMap, UploadedFile
} from '../models/learning.model';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private coursesUrl = '/api/v1/courses';
  private pathsUrl = '/api/v1/learning-paths';
  private enrollmentsUrl = '/api/v1/enrollments';
  private currentCourse$ = new BehaviorSubject<Course | null>(null);
  private currentLesson$ = new BehaviorSubject<Lesson | null>(null);

  constructor(private http: HttpClient) {}

  // ==================== COURSE MANAGEMENT ====================
  getCourses(skip: number = 0, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.level) params = params.set('level', filters.level);
    if (filters?.status) params = params.set('status', filters.status);
    return this.http.get<any>(this.coursesUrl, { params });
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.coursesUrl}/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.coursesUrl, course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.coursesUrl}/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${id}`);
  }

  publishCourse(id: string): Observable<Course> {
    return this.http.post<Course>(`${this.coursesUrl}/${id}/publish`, {});
  }

  archiveCourse(id: string): Observable<Course> {
    return this.http.post<Course>(`${this.coursesUrl}/${id}/archive`, {});
  }

  getCurrentCourse() {
    return this.currentCourse$.asObservable();
  }

  setCurrentCourse(course: Course | null) {
    this.currentCourse$.next(course);
  }

  // ==================== COURSE MODULES ====================
  getModules(courseId: string): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(`${this.coursesUrl}/${courseId}/modules`);
  }

  createModule(courseId: string, module: Partial<CourseModule>): Observable<CourseModule> {
    return this.http.post<CourseModule>(`${this.coursesUrl}/${courseId}/modules`, module);
  }

  updateModule(courseId: string, moduleId: string, module: Partial<CourseModule>): Observable<CourseModule> {
    return this.http.put<CourseModule>(`${this.coursesUrl}/${courseId}/modules/${moduleId}`, module);
  }

  deleteModule(courseId: string, moduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${courseId}/modules/${moduleId}`);
  }

  reorderModules(courseId: string, moduleIds: string[]): Observable<CourseModule[]> {
    return this.http.post<CourseModule[]>(`${this.coursesUrl}/${courseId}/modules/reorder`, { module_ids: moduleIds });
  }

  // ==================== LESSONS ====================
  getLessons(courseId: string, moduleId?: string): Observable<Lesson[]> {
    let params = new HttpParams();
    if (moduleId) params = params.set('module_id', moduleId);
    return this.http.get<Lesson[]>(`${this.coursesUrl}/${courseId}/lessons`, { params });
  }

  getLesson(courseId: string, lessonId: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`);
  }

  createLesson(courseId: string, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.post<Lesson>(`${this.coursesUrl}/${courseId}/lessons`, lesson);
  }

  updateLesson(courseId: string, lessonId: string, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`, lesson);
  }

  deleteLesson(courseId: string, lessonId: string): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}`);
  }

  reorderLessons(courseId: string, lessonIds: string[]): Observable<Lesson[]> {
    return this.http.post<Lesson[]>(`${this.coursesUrl}/${courseId}/lessons/reorder`, { lesson_ids: lessonIds });
  }

  getCurrentLesson() {
    return this.currentLesson$.asObservable();
  }

  setCurrentLesson(lesson: Lesson | null) {
    this.currentLesson$.next(lesson);
  }

  // ==================== LESSON CONTENT ====================
  getLessonContent(courseId: string, lessonId: string): Observable<LessonContent> {
    return this.http.get<LessonContent>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/content`);
  }

  createLessonContent(courseId: string, lessonId: string, content: Partial<LessonContent>): Observable<LessonContent> {
    return this.http.post<LessonContent>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/content`, content);
  }

  updateLessonContent(courseId: string, lessonId: string, content: Partial<LessonContent>): Observable<LessonContent> {
    return this.http.put<LessonContent>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/content`, content);
  }

  // ==================== MATERIALS ====================
  getMaterials(courseId: string, lessonId?: string): Observable<Material[]> {
    let params = new HttpParams();
    if (lessonId) params = params.set('lesson_id', lessonId);
    return this.http.get<Material[]>(`${this.coursesUrl}/${courseId}/materials`, { params });
  }

  getMaterial(courseId: string, materialId: string): Observable<Material> {
    return this.http.get<Material>(`${this.coursesUrl}/${courseId}/materials/${materialId}`);
  }

  createMaterial(courseId: string, material: Partial<Material>): Observable<Material> {
    return this.http.post<Material>(`${this.coursesUrl}/${courseId}/materials`, material);
  }

  deleteMaterial(courseId: string, materialId: string): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${courseId}/materials/${materialId}`);
  }

  uploadMaterial(courseId: string, file: File, materialData: Partial<Material>): Observable<ContentUpload> {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(materialData).forEach(key => {
      formData.append(key, (materialData as any)[key]);
    });
    return this.http.post<ContentUpload>(`${this.coursesUrl}/${courseId}/materials/upload`, formData);
  }

  uploadMultipleMaterials(courseId: string, files: File[]): Observable<ContentUpload[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<ContentUpload[]>(`${this.coursesUrl}/${courseId}/materials/upload-batch`, formData);
  }

  getUploadStatus(courseId: string, uploadId: string): Observable<ContentUpload> {
    return this.http.get<ContentUpload>(`${this.coursesUrl}/${courseId}/materials/upload/${uploadId}`);
  }

  // ==================== RESOURCES ====================
  getResources(courseId: string): Observable<CourseResource[]> {
    return this.http.get<CourseResource[]>(`${this.coursesUrl}/${courseId}/resources`);
  }

  createResource(courseId: string, resource: Partial<CourseResource>): Observable<CourseResource> {
    return this.http.post<CourseResource>(`${this.coursesUrl}/${courseId}/resources`, resource);
  }

  updateResource(courseId: string, resourceId: string, resource: Partial<CourseResource>): Observable<CourseResource> {
    return this.http.put<CourseResource>(`${this.coursesUrl}/${courseId}/resources/${resourceId}`, resource);
  }

  deleteResource(courseId: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${courseId}/resources/${resourceId}`);
  }

  // ==================== LEARNING PATHS ====================
  getLearningPaths(skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(this.pathsUrl, { params });
  }

  getLearningPath(id: string): Observable<LearningPath> {
    return this.http.get<LearningPath>(`${this.pathsUrl}/${id}`);
  }

  createLearningPath(path: Partial<LearningPath>): Observable<LearningPath> {
    return this.http.post<LearningPath>(this.pathsUrl, path);
  }

  updateLearningPath(id: string, path: Partial<LearningPath>): Observable<LearningPath> {
    return this.http.put<LearningPath>(`${this.pathsUrl}/${id}`, path);
  }

  deleteLearningPath(id: string): Observable<void> {
    return this.http.delete<void>(`${this.pathsUrl}/${id}`);
  }

  publishLearningPath(id: string): Observable<LearningPath> {
    return this.http.post<LearningPath>(`${this.pathsUrl}/${id}/publish`, {});
  }

  // ==================== ENROLLMENT ====================
  enrollInCourse(courseId: string): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.coursesUrl}/${courseId}/enroll`, {});
  }

  unenrollFromCourse(courseId: string): Observable<void> {
    return this.http.post<void>(`${this.coursesUrl}/${courseId}/unenroll`, {});
  }

  getEnrollments(userId?: string): Observable<Enrollment[]> {
    let params = new HttpParams();
    if (userId) params = params.set('user_id', userId);
    return this.http.get<Enrollment[]>(this.enrollmentsUrl, { params });
  }

  getEnrollment(courseId: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.enrollmentsUrl}/${courseId}`);
  }

  // ==================== PROGRESS TRACKING ====================
  getCourseProgress(courseId: string, userId?: string): Observable<CourseProgress> {
    let params = new HttpParams();
    if (userId) params = params.set('user_id', userId);
    return this.http.get<CourseProgress>(`${this.coursesUrl}/${courseId}/progress`, { params });
  }

  getLessonProgress(courseId: string, lessonId: string, userId?: string): Observable<LessonProgress> {
    let params = new HttpParams();
    if (userId) params = params.set('user_id', userId);
    return this.http.get<LessonProgress>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/progress`, { params });
  }

  updateLessonProgress(courseId: string, lessonId: string, progress: Partial<LessonProgress>): Observable<LessonProgress> {
    return this.http.put<LessonProgress>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/progress`, progress);
  }

  completeLesson(courseId: string, lessonId: string): Observable<LessonProgress> {
    return this.http.post<LessonProgress>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/complete`, {});
  }

  recordTimeSpent(courseId: string, lessonId: string, minutes: number): Observable<void> {
    return this.http.post<void>(`${this.coursesUrl}/${courseId}/lessons/${lessonId}/time-spent`, { minutes });
  }

  getProgressSummary(): Observable<any> {
    return this.http.get<any>(`${this.enrollmentsUrl}/progress-summary`);
  }

  // ==================== STUDENT DASHBOARD ====================
  getStudentDashboard(): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`/api/v1/dashboard/student`);
  }

  getActiveCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.enrollmentsUrl}/active-courses`);
  }

  getCompletedCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.enrollmentsUrl}/completed-courses`);
  }

  getRecommendedCourses(): Observable<CourseRecommendation[]> {
    return this.http.get<CourseRecommendation[]>(`/api/v1/recommendations/courses`);
  }

  getRecommendedPaths(): Observable<LearningPath[]> {
    return this.http.get<LearningPath[]>(`/api/v1/recommendations/paths`);
  }

  // ==================== RECOMMENDATIONS & ANALYTICS ====================
  getCourseRecommendations(skip: number = 0, limit: number = 5): Observable<CourseRecommendation[]> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<CourseRecommendation[]>(`/api/v1/recommendations/courses`, { params });
  }

  getLearnerProfile(): Observable<LearnerProfile> {
    return this.http.get<LearnerProfile>(`/api/v1/profiles/learner-profile`);
  }

  getCourseAnalytics(courseId: string): Observable<CourseAnalytics> {
    return this.http.get<CourseAnalytics>(`${this.coursesUrl}/${courseId}/analytics`);
  }

  getLearnerAnalytics(): Observable<LearnerAnalytics> {
    return this.http.get<LearnerAnalytics>(`/api/v1/analytics/learner`);
  }

  generateCourseReport(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.coursesUrl}/${courseId}/report`);
  }

  // ==================== COURSE SETTINGS ====================
  getCourseSettings(courseId: string): Observable<CourseSettings> {
    return this.http.get<CourseSettings>(`${this.coursesUrl}/${courseId}/settings`);
  }

  updateCourseSettings(courseId: string, settings: Partial<CourseSettings>): Observable<CourseSettings> {
    return this.http.put<CourseSettings>(`${this.coursesUrl}/${courseId}/settings`, settings);
  }

  // ==================== DISCUSSION FORUMS ====================
  getDiscussions(courseId: string, lessonId?: string): Observable<CourseDiscussion[]> {
    let params = new HttpParams();
    if (lessonId) params = params.set('lesson_id', lessonId);
    return this.http.get<CourseDiscussion[]>(`${this.coursesUrl}/${courseId}/discussions`, { params });
  }

  createDiscussion(courseId: string, discussion: Partial<CourseDiscussion>): Observable<CourseDiscussion> {
    return this.http.post<CourseDiscussion>(`${this.coursesUrl}/${courseId}/discussions`, discussion);
  }

  getDiscussionThreads(courseId: string, discussionId: string): Observable<any> {
    return this.http.get<any>(`${this.coursesUrl}/${courseId}/discussions/${discussionId}/threads`);
  }

  createDiscussionThread(courseId: string, discussionId: string, thread: any): Observable<any> {
    return this.http.post<any>(`${this.coursesUrl}/${courseId}/discussions/${discussionId}/threads`, thread);
  }

  // ==================== SKILL MAPPING ====================
  getSkillMaps(courseId: string): Observable<SkillMap[]> {
    return this.http.get<SkillMap[]>(`${this.coursesUrl}/${courseId}/skill-maps`);
  }

  createSkillMap(courseId: string, skillMap: Partial<SkillMap>): Observable<SkillMap> {
    return this.http.post<SkillMap>(`${this.coursesUrl}/${courseId}/skill-maps`, skillMap);
  }

  updateSkillMap(courseId: string, skillMapId: string, skillMap: Partial<SkillMap>): Observable<SkillMap> {
    return this.http.put<SkillMap>(`${this.coursesUrl}/${courseId}/skill-maps/${skillMapId}`, skillMap);
  }

  // ==================== COMPLETION & CERTIFICATES ====================
  completeCourse(courseId: string): Observable<any> {
    return this.http.post<any>(`${this.coursesUrl}/${courseId}/complete`, {});
  }

  getCertificate(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.coursesUrl}/${courseId}/certificate`);
  }

  downloadCertificate(courseId: string): Observable<Blob> {
    return this.http.get(`${this.coursesUrl}/${courseId}/certificate/download`, { responseType: 'blob' });
  }

  shareCertificate(courseId: string, platform: 'linkedin' | 'twitter' | 'email'): Observable<any> {
    return this.http.post<any>(`${this.coursesUrl}/${courseId}/certificate/share`, { platform });
  }
}
