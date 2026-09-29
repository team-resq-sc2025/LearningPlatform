"""
Tests for the evaluation engine
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.evaluation_engine import PromptEvaluator


def test_evaluation_engine():
    """Test the evaluation engine with sample prompts"""
    evaluator = PromptEvaluator()

    # Test 1: Poor prompt
    poor_prompt = "Write code"
    result = evaluator.evaluate(poor_prompt)

    print("=" * 60)
    print("TEST 1: Poor Prompt")
    print("=" * 60)
    print(f"Input: '{poor_prompt}'")
    print(f"\nScores:")
    print(f"  Clarity: {result['clarity_score']:.1f}/25")
    print(f"  Specificity: {result['specificity_score']:.1f}/25")
    print(f"  Structure: {result['structure_score']:.1f}/20")
    print(f"  Completeness: {result['completeness_score']:.1f}/15")
    print(f"  Efficiency: {result['efficiency_score']:.1f}/15")
    print(f"  TOTAL: {result['total_score']:.1f}/100")
    print(f"\nFeedback:\n{result['feedback']}")

    assert result['total_score'] < 50, "Poor prompt should score low"

    # Test 2: Good prompt
    good_prompt = """Write a Python function that:
1. Takes a list of numbers as input
2. Calculates the mean and standard deviation
3. Returns a dictionary with keys 'mean' and 'std'
4. Should handle empty lists by returning None

Example:
Input: [1, 2, 3, 4, 5]
Output: {'mean': 3.0, 'std': 1.414...}"""

    result = evaluator.evaluate(good_prompt)

    print("\n" + "=" * 60)
    print("TEST 2: Good Prompt")
    print("=" * 60)
    print(f"Input:\n{good_prompt}")
    print(f"\nScores:")
    print(f"  Clarity: {result['clarity_score']:.1f}/25")
    print(f"  Specificity: {result['specificity_score']:.1f}/25")
    print(f"  Structure: {result['structure_score']:.1f}/20")
    print(f"  Completeness: {result['completeness_score']:.1f}/15")
    print(f"  Efficiency: {result['efficiency_score']:.1f}/15")
    print(f"  TOTAL: {result['total_score']:.1f}/100")
    print(f"\nFeedback:\n{result['feedback']}")

    assert result['total_score'] > 70, "Good prompt should score high"

    # Test 3: Average prompt
    average_prompt = """Translate the following text to Spanish: 'Hello, how are you?'
    Keep the tone casual and friendly."""

    result = evaluator.evaluate(average_prompt)

    print("\n" + "=" * 60)
    print("TEST 3: Average Prompt")
    print("=" * 60)
    print(f"Input:\n{average_prompt}")
    print(f"\nScores:")
    print(f"  Clarity: {result['clarity_score']:.1f}/25")
    print(f"  Specificity: {result['specificity_score']:.1f}/25")
    print(f"  Structure: {result['structure_score']:.1f}/20")
    print(f"  Completeness: {result['completeness_score']:.1f}/15")
    print(f"  Efficiency: {result['efficiency_score']:.1f}/15")
    print(f"  TOTAL: {result['total_score']:.1f}/100")
    print(f"\nFeedback:\n{result['feedback']}")

    assert 40 < result['total_score'] < 80, "Average prompt should score in middle range"

    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)


if __name__ == "__main__":
    test_evaluation_engine()
