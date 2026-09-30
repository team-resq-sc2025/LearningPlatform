// ==================== ASSESSMENT CORE ====================
export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'quiz' | 'exam' | 'assignment';
  status: 'draft' | 'published' | 'archived';
  total_questions?: number;
  pass_score?: number;
  pass_percentage?: number;
  time_limit_minutes?: number;
  allow_retakes: boolean;
  max_retakes?: number;
  show_correct_answers: boolean;
  show_feedback: boolean;
  randomize_questions: boolean;
  randomize_options: boolean;
  proctoring_enabled: boolean;
  proctoring_type?: 'browser_lock' | 'webcam' | 'ip_tracking' | 'device_fingerprint';
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// ==================== QUESTION MANAGEMENT ====================
export type QuestionType = 'multiple_choice' | 'true_false' | 'essay' | 'short_answer' | 'matching' | 'code' | 'file_upload';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  assessment_id: string;
  question_bank_id?: string;
  text: string;
  type: QuestionType;
  points: number;
  difficulty: DifficultyLevel;
  topic_tags: string[];
  order?: number;
  explanation?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MultipleChoiceOption {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  order: number;
}

export interface QuestionResponse {
  question: Question;
  options?: MultipleChoiceOption[];
  correctAnswer?: string;
  explanation?: string;
}

// ==================== QUESTION BANK ====================
export interface QuestionBank {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  total_questions: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankQuestion {
  question_id: string;
  bank_id: string;
  difficulty_weight?: number;
  topic_tag?: string;
}

// ==================== SUBMISSION & ATTEMPT MANAGEMENT ====================
export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  attempt_number: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'pending_review';
  score?: number;
  percentage_score?: number;
  is_passed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  attempt_id: string;
  question_id: string;
  response_text?: string;
  response_file_url?: string;
  selected_option_id?: string;
  auto_score?: number;
  manual_score?: number;
  is_flagged: boolean;
  graded_by?: string;
  feedback?: string;
  graded_at?: string;
}

export interface Submission {
  id: string;
  attempt_id: string;
  assessment_id: string;
  user_id: string;
  score?: number;
  percentage_score?: number;
  status: 'submitted' | 'graded' | 'pending_review';
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

// ==================== GRADING & EVALUATION ====================
export interface GradingRubric {
  id: string;
  assessment_id: string;
  name: string;
  criteria: RubricCriterion[];
  total_points: number;
}

export interface RubricCriterion {
  id: string;
  rubric_id: string;
  name: string;
  description: string;
  max_points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  criterion_id: string;
  level_name: string;
  points: number;
  description: string;
}

export interface GradingQueue {
  id: string;
  assessment_id: string;
  total_submissions: number;
  graded_count: number;
  pending_count: number;
  status: 'open' | 'closed' | 'in_progress';
  created_at: string;
  updated_at: string;
}

// ==================== ANALYTICS & PSYCHOMETRICS ====================
export interface AssessmentAnalytics {
  assessment_id: string;
  total_attempts: number;
  average_score: number;
  median_score: number;
  pass_rate: number;
  std_dev: number;
  min_score: number;
  max_score: number;
  average_time_minutes: number;
}

export interface QuestionAnalytics {
  question_id: string;
  attempts: number;
  correct_responses: number;
  pass_rate: number;
  difficulty_index: number; // % of students answering correctly
  discrimination_index: number; // Correlation with overall performance
  average_time_seconds?: number;
  option_statistics?: OptionStatistic[];
}

export interface OptionStatistic {
  option_id: string;
  option_text: string;
  selection_count: number;
  selection_percentage: number;
  is_correct: boolean;
}

export interface LearningAnalytics {
  user_id: string;
  assessment_id: string;
  attempts: AssessmentAttempt[];
  improvement_trend: number; // Percentage improvement
  strong_topics: string[];
  weak_topics: string[];
  estimated_mastery: number; // 0-100
}

// ==================== CERTIFICATES & CREDENTIALS ====================
export interface Certificate {
  id: string;
  assessment_id: string;
  user_id: string;
  attempt_id: string;
  certificate_number: string;
  issued_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'revoked';
  file_url?: string;
  verification_code: string;
  created_at: string;
}

export interface CertificateTemplate {
  id: string;
  course_id: string;
  name: string;
  template_html: string;
  background_image_url?: string;
  font_family: string;
  primary_color: string;
}

// ==================== PROCTORING ====================
export interface ProctorSession {
  id: string;
  attempt_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  proctor_id?: string;
  webcam_enabled: boolean;
  tab_switch_count: number;
  suspicious_activities: SuspiciousActivity[];
  status: 'monitoring' | 'completed' | 'flagged';
}

export interface SuspiciousActivity {
  id: string;
  session_id: string;
  activity_type: 'tab_switch' | 'full_screen_exit' | 'multiple_faces' | 'face_not_detected' | 'unusual_behavior';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// ==================== ATTEMPT CONFIG ====================
export interface AttemptConfig {
  assessment_id: string;
  max_attempts: number;
  time_limit_minutes: number;
  attempt_lock_duration_hours?: number;
  show_results_immediately: boolean;
  show_correct_answers_after: 'never' | 'after_submission' | 'after_all_attempts' | 'after_deadline';
  allow_review: boolean;
}
