export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'quiz' | 'exam' | 'assignment';
  total_questions?: number;
  pass_score?: number;
  created_at: string;
}

export interface Question {
  id: string;
  assessment_id: string;
  text: string;
  type?: 'multiple_choice' | 'essay' | 'short_answer';
  points: number;
  order?: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assessment_id: string;
  user_id: string;
  score?: number;
  status: 'submitted' | 'graded' | 'pending_review';
  submitted_at: string;
  graded_at?: string;
}
