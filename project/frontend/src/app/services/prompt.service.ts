import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  technique?: string;
  domain?: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface PromptEvaluation {
  id: string;
  prompt_id: string;
  clarity_score: number;
  specificity_score: number;
  structure_score: number;
  completeness_score: number;
  efficiency_score: number;
  total_score: number;
  feedback?: string;
  recommendations?: string;
  evaluated_at: string;
}

export interface PromptWithEvaluation extends Prompt {
  evaluations: PromptEvaluation[];
}

@Injectable({
  providedIn: 'root'
})
export class PromptService {
  private apiUrl = 'http://localhost:8000/api/v1/prompts';

  constructor(private http: HttpClient) {}

  listPrompts(
    status?: string,
    domain?: string,
    technique?: string,
    skip: number = 0,
    limit: number = 10
  ): Observable<{ total: number; prompts: Prompt[] }> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (status) params = params.set('status', status);
    if (domain) params = params.set('domain', domain);
    if (technique) params = params.set('technique', technique);

    return this.http.get<{ total: number; prompts: Prompt[] }>(
      this.apiUrl,
      { params }
    );
  }

  createPrompt(data: {
    title: string;
    content: string;
    technique?: string;
    domain?: string;
  }): Observable<Prompt> {
    return this.http.post<Prompt>(this.apiUrl, data);
  }

  getPrompt(id: string): Observable<PromptWithEvaluation> {
    return this.http.get<PromptWithEvaluation>(`${this.apiUrl}/${id}`);
  }

  updatePrompt(
    id: string,
    data: {
      title?: string;
      content?: string;
      technique?: string;
      domain?: string;
      status?: string;
    }
  ): Observable<Prompt> {
    return this.http.put<Prompt>(`${this.apiUrl}/${id}`, data);
  }

  deletePrompt(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  evaluatePrompt(id: string): Observable<PromptEvaluation> {
    return this.http.post<PromptEvaluation>(
      `${this.apiUrl}/${id}/evaluate`,
      {}
    );
  }

  getEvaluations(
    id: string,
    skip: number = 0,
    limit: number = 10
  ): Observable<{ total: number; evaluations: PromptEvaluation[] }> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    return this.http.get<{ total: number; evaluations: PromptEvaluation[] }>(
      `${this.apiUrl}/${id}/evaluations`,
      { params }
    );
  }

  publishPrompt(id: string): Observable<Prompt> {
    return this.http.post<Prompt>(`${this.apiUrl}/${id}/publish`, {});
  }

  getStats(): Observable<{
    total_prompts: number;
    published_prompts: number;
    drafted_prompts: number;
    evaluated_prompts: number;
    average_evaluation_score: number;
  }> {
    return this.http.get<{
      total_prompts: number;
      published_prompts: number;
      drafted_prompts: number;
      evaluated_prompts: number;
      average_evaluation_score: number;
    }>(`${this.apiUrl}/stats`);
  }
}
