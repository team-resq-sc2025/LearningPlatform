import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PromptService, Prompt, PromptEvaluation } from '../../services/prompt.service';

@Component({
  selector: 'app-prompt-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prompt-editor.component.html',
  styleUrl: './prompt-editor.component.css'
})
export class PromptEditorComponent implements OnInit {
  prompt: Partial<Prompt> = {
    title: '',
    content: '',
    technique: '',
    domain: '',
    status: 'draft'
  };

  isLoading = false;
  isSaving = false;
  isEvaluating = false;
  editingId: string | null = null;
  evaluation: PromptEvaluation | null = null;

  techniques = [
    'Zero-Shot Prompting',
    'Few-Shot Prompting',
    'Chain-of-Thought',
    'Role-Based/Persona',
    'Structured Output',
    'Retrieval-Augmented Generation',
    'Tree-of-Thought',
    'Prompt Chaining'
  ];

  domains = [
    'Code Generation',
    'Content Creation',
    'Analysis & Research',
    'Customer Service',
    'Translation',
    'Summarization',
    'Classification',
    'Question Answering',
    'Other'
  ];

  constructor(
    private promptService: PromptService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPrompt(id);
    }
  }

  loadPrompt(id: string): void {
    this.isLoading = true;
    this.promptService.getPrompt(id).subscribe({
      next: (data) => {
        this.prompt = { ...data };
        this.editingId = id;
        if (data.evaluations && data.evaluations.length > 0) {
          this.evaluation = data.evaluations[0];
        }
        this.isLoading = false;
      },
      error: (error) => {
        alert('Failed to load prompt');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  // Character and word counting
  get characterCount(): number {
    return this.prompt.content?.length || 0;
  }

  get wordCount(): number {
    if (!this.prompt.content) return 0;
    return this.prompt.content.trim().split(/\s+/).length;
  }

  get estimatedTokens(): number {
    // Rough estimate: 1 token ≈ 4 characters (OpenAI's estimate)
    return Math.ceil(this.characterCount / 4);
  }

  get scoreColor(): string {
    if (!this.evaluation) return 'gray';
    if (this.evaluation.total_score >= 80) return 'green';
    if (this.evaluation.total_score >= 60) return 'orange';
    return 'red';
  }

  get scorePercentage(): number {
    return this.evaluation?.total_score || 0;
  }

  savePrompt(): void {
    if (!this.prompt.title?.trim()) {
      alert('Title is required');
      return;
    }
    if (!this.prompt.content?.trim()) {
      alert('Content is required');
      return;
    }

    this.isSaving = true;

    const payload = {
      title: this.prompt.title,
      content: this.prompt.content,
      technique: this.prompt.technique,
      domain: this.prompt.domain
    };

    if (this.editingId) {
      this.promptService.updatePrompt(this.editingId, payload).subscribe({
        next: (data) => {
          this.prompt = { ...data };
          alert('✓ Prompt updated successfully');
          this.isSaving = false;
        },
        error: (error) => {
          alert('✗ Failed to update prompt');
          console.error(error);
          this.isSaving = false;
        }
      });
    } else {
      this.promptService.createPrompt(payload).subscribe({
        next: (data) => {
          this.prompt = { ...data };
          this.editingId = data.id;
          alert('✓ Prompt created successfully');
          this.isSaving = false;
        },
        error: (error) => {
          alert('✗ Failed to create prompt');
          console.error(error);
          this.isSaving = false;
        }
      });
    }
  }

  evaluatePrompt(): void {
    if (!this.editingId) {
      alert('⚠ Save the prompt first');
      return;
    }

    this.isEvaluating = true;
    this.promptService.evaluatePrompt(this.editingId).subscribe({
      next: (data) => {
        this.evaluation = data;
        alert('✓ Prompt evaluated successfully');
        this.isEvaluating = false;
      },
      error: (error) => {
        alert('✗ Failed to evaluate prompt');
        console.error(error);
        this.isEvaluating = false;
      }
    });
  }

  publishPrompt(): void {
    if (!this.editingId) {
      alert('⚠ Save the prompt first');
      return;
    }

    this.isSaving = true;
    this.promptService.publishPrompt(this.editingId).subscribe({
      next: (data) => {
        this.prompt = { ...data };
        alert('✓ Prompt published successfully');
        this.isSaving = false;
      },
      error: (error) => {
        alert('✗ Failed to publish prompt');
        console.error(error);
        this.isSaving = false;
      }
    });
  }

  clearForm(): void {
    this.prompt = {
      title: '',
      content: '',
      technique: '',
      domain: '',
      status: 'draft'
    };
    this.evaluation = null;
    this.editingId = null;
  }

  goBack(): void {
    this.router.navigate(['/prompts']);
  }
}
