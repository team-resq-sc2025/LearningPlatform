import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PromptService, Prompt } from '../../services/prompt.service';

@Component({
  selector: 'app-prompts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prompts.component.html',
  styleUrl: './prompts.component.css'
})
export class PromptsComponent implements OnInit {
  Math = Math;
  prompts: Prompt[] = [];
  isLoading = false;
  filterStatus = '';
  skip = 0;
  limit = 10;
  total = 0;

  domains = [
    'Code Generation',
    'Content Creation',
    'Analysis & Research',
    'Customer Service',
    'Translation',
    'Summarization',
    'Classification',
    'Question Answering'
  ];

  constructor(
    private promptService: PromptService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrompts();
  }

  loadPrompts(): void {
    this.isLoading = true;
    this.promptService.listPrompts(this.filterStatus, '', '', this.skip, this.limit).subscribe({
      next: (response) => {
        this.prompts = response.prompts;
        this.total = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        alert('✗ Failed to load prompts');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.filterStatus = status;
    this.skip = 0;
    this.loadPrompts();
  }

  createNewPrompt(): void {
    this.router.navigate(['/prompts/new']);
  }

  editPrompt(id: string): void {
    this.router.navigate(['/prompts', id]);
  }

  deletePrompt(id: string): void {
    if (confirm('Are you sure you want to delete this prompt?')) {
      this.promptService.deletePrompt(id).subscribe({
        next: () => {
          alert('✓ Prompt deleted');
          this.loadPrompts();
        },
        error: (error) => {
          alert('✗ Failed to delete prompt');
          console.error(error);
        }
      });
    }
  }

  nextPage(): void {
    if (this.skip + this.limit < this.total) {
      this.skip += this.limit;
      this.loadPrompts();
    }
  }

  prevPage(): void {
    if (this.skip > 0) {
      this.skip -= this.limit;
      this.loadPrompts();
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getStatusBadge(status: string): string {
    return status === 'published' ? 'badge-success' : 'badge-warning';
  }
}
