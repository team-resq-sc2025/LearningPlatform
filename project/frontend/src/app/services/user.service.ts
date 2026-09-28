import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Organization } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/v1/users';
  private orgUrl = '/api/v1/organizations';

  constructor(private http: HttpClient) {}

  getUsers(skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOrganizations(skip: number = 0, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<any>(this.orgUrl, { params });
  }

  getOrganization(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.orgUrl}/${id}`);
  }

  createOrganization(org: Partial<Organization>): Observable<Organization> {
    return this.http.post<Organization>(this.orgUrl, org);
  }
}
