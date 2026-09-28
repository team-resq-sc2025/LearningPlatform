import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Module, Lesson } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = '/api/v1/courses';

  constructor(private http: HttpClient) {}

  getCourses(skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getModules(courseId: string): Observable<Module[]> {
    return this.http.get<Module[]>(`${this.apiUrl}/${courseId}/modules`);
  }

  getLessons(moduleId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`/api/v1/modules/${moduleId}/lessons`);
  }
}
