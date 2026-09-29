import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Technique {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  example: string;
  bestFor: string[];
  strengths: string[];
  weaknesses: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-technique-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technique-library.component.html',
  styleUrl: './technique-library.component.css'
})
export class TechniqueLibraryComponent {
  techniques: Technique[] = [
    {
      id: 'zero-shot',
      name: 'Zero-Shot Prompting',
      subtitle: 'Direct instruction without examples',
      description: 'Asking the AI to perform a task without providing any examples first.',
      example: 'Translate "Hello, world" to Spanish.',
      bestFor: ['Simple tasks', 'Straightforward questions', 'General knowledge queries'],
      strengths: ['Fast', 'Efficient', 'No training data needed'],
      weaknesses: ['Can lack precision on complex tasks'],
      expanded: false
    },
    {
      id: 'few-shot',
      name: 'Few-Shot Prompting',
      subtitle: 'Providing examples before the actual task',
      description: 'Providing 2-5 examples of input-output pairs before asking the AI to solve the target task.',
      example: `Example 1: "Gato" → Cat\nExample 2: "Perro" → Dog\nExample 3: "Pájaro" → ?\n\nTranslate "Pájaro" to English.`,
      bestFor: ['Complex tasks', 'Specific formats', 'Specialized domains'],
      strengths: ['Improves accuracy', 'Demonstrates pattern', 'Reduces ambiguity'],
      weaknesses: ['Requires curating good examples', 'Longer prompts'],
      expanded: false
    },
    {
      id: 'cot',
      name: 'Chain-of-Thought (CoT)',
      subtitle: 'Asking for step-by-step reasoning',
      description: 'Explicitly requesting the model to break down reasoning into intermediate steps.',
      example: `Solve this step by step:\nIf Sarah has 3 apples and buys 5 more, then gives 2 to her friend, how many does she have?\n\nThink through each step before giving your answer.`,
      bestFor: ['Math problems', 'Logic puzzles', 'Multi-step reasoning'],
      strengths: ['Significantly improves accuracy on complex reasoning', 'Shows work'],
      weaknesses: ['Longer responses', 'Can sometimes add confusion'],
      expanded: false
    },
    {
      id: 'role-based',
      name: 'Role-Based / Persona Prompting',
      subtitle: 'Assigning a character or expertise level',
      description: 'Instructing the AI to adopt a specific role, expertise, or perspective.',
      example: `You are an expert software architect with 20 years of experience.\nRecommend the best database for a real-time analytics platform.`,
      bestFor: ['Specialized expertise', 'Tone/style control', 'Simulating perspectives'],
      strengths: ['Tailors response style and depth', 'Leverages AI role-play'],
      weaknesses: ['Over-promising expertise', 'Can be inconsistent'],
      expanded: false
    },
    {
      id: 'structured-output',
      name: 'Structured Output Prompting',
      subtitle: 'Requesting specific format (JSON, XML, tables)',
      description: 'Explicitly specifying the output format to ensure consistency and machine-readability.',
      example: `Extract names and ages. Return as JSON:\n{"people": [{"name": "...", "age": 25}, ...]}`,
      bestFor: ['Data extraction', 'API integration', 'Programmatic processing'],
      strengths: ['Predictable output', 'Easy to parse', 'Integrates with tools'],
      weaknesses: ['Rigid structure may limit nuance', 'Requires clear schema'],
      expanded: false
    },
    {
      id: 'rag',
      name: 'Retrieval-Augmented Generation (RAG)',
      subtitle: 'Providing context/knowledge before the task',
      description: 'Including relevant documents, data, or context to ground the AI\'s response in factual information.',
      example: `Context: "Company X was founded in 2020 and specializes in AI solutions."\nQuestion: When was Company X founded?`,
      bestFor: ['Knowledge-heavy tasks', 'Custom knowledge', 'Reducing hallucinations'],
      strengths: ['Factually grounded', 'Integrates external data', 'Verifiable'],
      weaknesses: ['Requires quality knowledge base', 'Adds latency'],
      expanded: false
    },
    {
      id: 'tot',
      name: 'Tree-of-Thought (ToT)',
      subtitle: 'Exploring multiple reasoning paths',
      description: 'Asking the AI to explore multiple solution paths and evaluate each before deciding.',
      example: `Consider 3 different approaches to this problem.\nFor each approach, list pros and cons.\nThen recommend the best approach with reasoning.`,
      bestFor: ['Complex decision-making', 'Strategy', 'Comparing alternatives'],
      strengths: ['Explores trade-offs', 'Thorough analysis', 'Better decisions'],
      weaknesses: ['Longer responses', 'Higher token usage'],
      expanded: false
    },
    {
      id: 'chaining',
      name: 'Prompt Chaining / Multi-Turn',
      subtitle: 'Breaking complex tasks into sequential prompts',
      description: 'Breaking a large task into smaller sequential prompts, using outputs as inputs to the next.',
      example: `Step 1: Summarize this article\nStep 2: Extract key facts from the summary\nStep 3: Create 3 quiz questions based on the facts`,
      bestFor: ['Multi-stage workflows', 'Refining outputs', 'Building complexity gradually'],
      strengths: ['Better control', 'Error recovery', 'Clearer workflow'],
      weaknesses: ['Multiple API calls', 'Latency', 'Context management'],
      expanded: false
    },
    {
      id: 'negative',
      name: 'Negative Prompting',
      subtitle: 'Specifying what NOT to do',
      description: 'Explicitly telling the AI what to avoid, in addition to what to do.',
      example: `Write a product description.\nDO NOT use superlatives like "best" or "amazing".\nDO NOT make unsupported claims.`,
      bestFor: ['Preventing common mistakes', 'Brand guidelines', 'Compliance'],
      strengths: ['Avoids pitfalls', 'Clearer boundaries', 'Reduces revision cycles'],
      weaknesses: ['Can be verbose', 'Doesn\'t always prevent errors'],
      expanded: false
    },
    {
      id: 'retrieval',
      name: 'Technique Combination',
      subtitle: 'Mixing multiple techniques together',
      description: 'Combining multiple prompting techniques for optimal results. E.g., Few-Shot + Chain-of-Thought.',
      example: `[Few-Shot Examples]\n\nYou are a data analyst. Please solve this problem step by step:\n[Problem]\n\nReturn your analysis as JSON:\n[Format]`,
      bestFor: ['Complex, mission-critical tasks', 'Hybrid requirements'],
      strengths: ['Leverages strengths of multiple techniques', 'Maximum flexibility'],
      weaknesses: ['More complex to design', 'Harder to debug'],
      expanded: false
    }
  ];

  toggleTechnique(id: string): void {
    const technique = this.techniques.find(t => t.id === id);
    if (technique) {
      technique.expanded = !technique.expanded;
    }
  }

  collapseAll(): void {
    this.techniques.forEach(t => t.expanded = false);
  }

  expandAll(): void {
    this.techniques.forEach(t => t.expanded = true);
  }
}
