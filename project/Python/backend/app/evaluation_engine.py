"""
AI Prompt Evaluation Engine
Scores prompts on clarity, specificity, structure, completeness, and efficiency.
"""

import json
from typing import Dict, Tuple
import re


class PromptEvaluator:
    """Evaluates prompts on multiple dimensions"""

    # Scoring weights (max points per dimension)
    CLARITY_MAX = 25
    SPECIFICITY_MAX = 25
    STRUCTURE_MAX = 20
    COMPLETENESS_MAX = 15
    EFFICIENCY_MAX = 15
    TOTAL_MAX = 100

    def __init__(self):
        self.feedback_items = []
        self.recommendations = []

    def evaluate(self, prompt: str) -> Dict:
        """
        Evaluate a prompt and return scores and feedback.
        Returns dict with all dimension scores and total score.
        """
        self.feedback_items = []
        self.recommendations = []

        # Calculate scores for each dimension
        clarity_score = self._evaluate_clarity(prompt)
        specificity_score = self._evaluate_specificity(prompt)
        structure_score = self._evaluate_structure(prompt)
        completeness_score = self._evaluate_completeness(prompt)
        efficiency_score = self._evaluate_efficiency(prompt)

        # Calculate total score
        total_score = (clarity_score + specificity_score + structure_score +
                      completeness_score + efficiency_score)

        return {
            "clarity_score": clarity_score,
            "specificity_score": specificity_score,
            "structure_score": structure_score,
            "completeness_score": completeness_score,
            "efficiency_score": efficiency_score,
            "total_score": total_score,
            "feedback": "\n".join(self.feedback_items),
            "recommendations": json.dumps(self.recommendations)
        }

    def _evaluate_clarity(self, prompt: str) -> float:
        """Evaluate clarity: Is the main objective immediately clear?"""
        score = self.CLARITY_MAX

        # Check if prompt is too short (likely unclear)
        if len(prompt.strip().split()) < 5:
            score -= 10
            self.feedback_items.append("❌ Clarity: Prompt is too short to be clear about its purpose.")

        # Check for imperative verbs (good for clarity)
        imperative_verbs = [
            "write", "create", "generate", "explain", "analyze", "summarize",
            "translate", "convert", "list", "describe", "identify", "compare"
        ]
        first_words = prompt.lower().split()[:3]
        has_imperative = any(verb in first_words for verb in imperative_verbs)

        if not has_imperative:
            score -= 5
            self.feedback_items.append("⚠️  Clarity: Consider starting with a clear action verb (e.g., 'Write', 'Analyze', 'Create').")

        # Check for questions without clear intent
        questions = prompt.count("?")
        if questions > 2:
            score -= 5
            self.feedback_items.append(f"⚠️  Clarity: Too many questions ({questions}) - consider rephrasing as clear directives.")

        # Check for ambiguous language
        ambiguous_words = ["maybe", "possibly", "probably", "might", "could"]
        ambiguous_count = sum(1 for word in ambiguous_words if word in prompt.lower())
        if ambiguous_count > 2:
            score -= 5
            self.feedback_items.append("⚠️  Clarity: Reduce ambiguous language (maybe, possibly, probably).")

        if score == self.CLARITY_MAX:
            self.feedback_items.append("✅ Clarity: Main objective is clearly stated.")

        return max(0, score)

    def _evaluate_specificity(self, prompt: str) -> float:
        """Evaluate specificity: Are constraints, context, and outputs explicit?"""
        score = self.SPECIFICITY_MAX

        # Check for explicit constraints
        constraint_words = ["must", "should not", "only", "exactly", "specifically", "avoid"]
        constraints = sum(1 for word in constraint_words if word in prompt.lower())

        if constraints == 0:
            score -= 8
            self.feedback_items.append("⚠️  Specificity: No explicit constraints defined. Add 'must', 'should', or 'avoid' statements.")

        # Check for output format specification
        format_indicators = ["format", "structure", "json", "xml", "bullet", "numbered", "table", "output"]
        has_format = any(indicator in prompt.lower() for indicator in format_indicators)

        if not has_format:
            score -= 8
            self.feedback_items.append("⚠️  Specificity: Consider specifying desired output format (JSON, bullet points, etc.).")

        # Check for examples or context
        example_words = ["example", "for example", "such as", "like", "e.g."]
        has_examples = any(word in prompt.lower() for word in example_words)

        if not has_examples:
            score -= 5
            self.feedback_items.append("⚠️  Specificity: Adding examples would make the prompt more specific.")

        # Check for scope/edge cases mention
        scope_words = ["edge case", "exclude", "include", "range", "limit", "boundary"]
        has_scope = any(word in prompt.lower() for word in scope_words)

        if not has_scope:
            score -= 4
            self.feedback_items.append("⚠️  Specificity: Consider mentioning edge cases or scope boundaries.")

        if score == self.SPECIFICITY_MAX:
            self.feedback_items.append("✅ Specificity: Constraints and context are well-defined.")

        return max(0, score)

    def _evaluate_structure(self, prompt: str) -> float:
        """Evaluate structure: Is the prompt logically organized?"""
        score = self.STRUCTURE_MAX

        lines = prompt.strip().split("\n")

        # Check for logical sections
        has_sections = len(lines) > 3
        if not has_sections:
            score -= 5
            self.feedback_items.append("⚠️  Structure: Consider breaking the prompt into logical sections.")

        # Check for use of formatting (bullets, numbering)
        has_formatting = ("•" in prompt or "-" in prompt or
                         re.search(r"^\d+\.", prompt, re.MULTILINE) or
                         re.search(r"^[a-z]\.", prompt, re.MULTILINE))

        if not has_formatting and len(lines) > 5:
            score -= 5
            self.feedback_items.append("⚠️  Structure: Use bullet points or numbering to organize multi-part prompts.")

        # Check for clarity separators
        has_separators = any(word in prompt.lower() for word in ["step", "phase", "section", "part", "task"])
        if has_sections and not has_separators:
            score -= 4
            self.feedback_items.append("⚠️  Structure: Add section labels (Step 1, Phase 2, Task A) for clarity.")

        if score == self.STRUCTURE_MAX:
            self.feedback_items.append("✅ Structure: Prompt is well-organized and easy to follow.")

        return max(0, score)

    def _evaluate_completeness(self, prompt: str) -> float:
        """Evaluate completeness: Are all necessary details included?"""
        score = self.COMPLETENESS_MAX

        # Check prompt length
        word_count = len(prompt.strip().split())

        if word_count < 20:
            score -= 8
            self.feedback_items.append(f"⚠️  Completeness: Prompt is very short ({word_count} words). Add more detail.")

        # Check for success criteria
        success_words = ["success", "criteria", "goal", "objective", "should", "result in", "outcome"]
        has_success = any(word in prompt.lower() for word in success_words)

        if not has_success:
            score -= 5
            self.feedback_items.append("⚠️  Completeness: Define what success looks like (success criteria or goals).")

        # Check for audience/context
        context_words = ["audience", "context", "background", "user", "reader", "for", "given"]
        has_context = sum(1 for word in context_words if word in prompt.lower()) >= 2

        if not has_context:
            score -= 2
            self.feedback_items.append("⚠️  Completeness: Providing more context (audience, use case) would help.")

        if score == self.COMPLETENESS_MAX:
            self.feedback_items.append("✅ Completeness: All necessary information is included.")

        return max(0, score)

    def _evaluate_efficiency(self, prompt: str) -> float:
        """Evaluate efficiency: Is the prompt concise without losing clarity?"""
        score = self.EFFICIENCY_MAX

        word_count = len(prompt.strip().split())

        # Check for excessive length
        if word_count > 500:
            score -= 8
            self.feedback_items.append(f"⚠️  Efficiency: Prompt is very long ({word_count} words). Try to trim it to 200-300.")
            self.recommendations.append("Reduce word count by combining related instructions")

        # Check for redundancy
        lines = prompt.lower().split("\n")
        duplicate_threshold = 0.7

        for i, line1 in enumerate(lines[:-1]):
            for line2 in lines[i+1:]:
                if line1 and line2 and similarity(line1, line2) > duplicate_threshold:
                    score -= 3
                    self.feedback_items.append("⚠️  Efficiency: Some instructions appear redundant.")
                    break

        # Check for unnecessary filler words
        filler_words = ["please", "kindly", "nicely", "very", "really", "quite", "basically"]
        filler_count = sum(1 for word in filler_words if f" {word} " in f" {prompt.lower()} ")

        if filler_count > 2:
            score -= 4
            self.feedback_items.append(f"⚠️  Efficiency: Remove filler words ({filler_count} found): {', '.join(filler_words[:3])}...")

        # Positive feedback for efficiency
        if 50 <= word_count <= 200:
            self.feedback_items.append(f"✅ Efficiency: Good prompt length ({word_count} words).")

        return max(0, score)

    def get_recommendations(self) -> list:
        """Get improvement recommendations"""
        return self.recommendations


def similarity(str1: str, str2: str) -> float:
    """Calculate string similarity (simple word overlap)"""
    words1 = set(str1.split())
    words2 = set(str2.split())

    if not words1 or not words2:
        return 0.0

    overlap = len(words1.intersection(words2))
    max_len = max(len(words1), len(words2))

    return overlap / max_len if max_len > 0 else 0.0
