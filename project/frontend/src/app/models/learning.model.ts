// ==================== COURSE CORE ====================
export interface Course {
  id: string;
  organization_id?: string;
  title: string;
  description?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_hours?: number;
  estimated_completion_days?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  thumbnail_url?: string;
  prerequisites?: string[]; // Course IDs that must be completed first
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  total_lessons: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'text' | 'document' | 'interactive' | 'quiz';
  duration_minutes?: number;
  order: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== COURSE CONTENT ====================
export interface LessonContent {
  lesson_id: string;
  type: 'video' | 'text' | 'document' | 'interactive' | 'quiz';
  video_url?: string;
  video_duration_minutes?: number;
  text_content?: string;
  document_url?: string;
  document_type?: string;
  interactive_content?: InteractiveContent;
  quiz_id?: string;
  created_at: string;
}

export interface InteractiveContent {
  type: 'iframe' | 'scorm' | 'xapi' | 'custom';
  resource_url: string;
  launch_parameters?: Record<string, any>;
}

export interface Material {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  description?: string;
  file_type: string;
  file_size_bytes: number;
  file_url: string;
  download_url: string;
  material_type: 'document' | 'resource' | 'reference' | 'transcript';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  resource_type: 'reading' | 'code' | 'template' | 'tool' | 'external_link';
  url?: string;
  file_url?: string;
  order: number;
  created_at: string;
}

// ==================== LEARNING PATHS ====================
export interface LearningPath {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  goal: string;
  target_audience?: string;
  estimated_duration_hours?: number;
  status: 'draft' | 'published' | 'archived';
  courses: LearningPathCourse[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LearningPathCourse {
  id: string;
  path_id: string;
  course_id: string;
  order: number;
  is_required: boolean;
  prerequisites?: string[]; // Other courses in path that must be completed first
}

export interface LearningPathNode {
  course_id: string;
  title: string;
  order: number;
  is_required: boolean;
  dependencies: string[]; // IDs of courses that must be completed first
}

export interface SkillMap {
  id: string;
  course_id: string;
  skill_name: string;
  proficiency_level: 'foundational' | 'intermediate' | 'advanced' | 'expert';
  learning_outcomes: LearningOutcome[];
}

export interface LearningOutcome {
  id: string;
  skill_map_id: string;
  description: string;
  assessment_method: string;
  success_criteria: string;
}

// ==================== ENROLLMENT & PROGRESS ====================
export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrollment_status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  completion_percentage: number;
  progress_updated_at: string;
}

export interface CourseProgress {
  id: string;
  enrollment_id: string;
  course_id: string;
  user_id: string;
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
  estimated_completion_date?: string;
  last_accessed: string;
  total_time_spent_minutes: number;
  average_time_per_lesson_minutes: number;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  course_id: string;
  completion_status: 'not_started' | 'in_progress' | 'completed';
  time_spent_minutes: number;
  completion_percentage: number;
  score?: number;
  last_accessed: string;
  completed_at?: string;
  notes?: string;
}

export interface CompletionTracking {
  user_id: string;
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  time_spent_hours: number;
  last_activity: string;
  is_completed: boolean;
  completion_date?: string;
}

// ==================== STUDENT DASHBOARD ====================
export interface StudentDashboard {
  enrollments: Enrollment[];
  active_courses: Course[];
  completed_courses: Course[];
  recommended_courses: Course[];
  recommended_paths: LearningPath[];
  recent_activity: DashboardActivity[];
  progress_summary: ProgressSummary;
  badges_earned: Badge[];
  certificates_earned: Certificate[];
}

export interface DashboardActivity {
  id: string;
  user_id: string;
  activity_type: 'lesson_completed' | 'course_completed' | 'quiz_passed' | 'material_viewed';
  course_id: string;
  lesson_id?: string;
  title: string;
  timestamp: string;
}

export interface ProgressSummary {
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_learning_hours: number;
  total_time_spent_hours: number;
  average_completion_rate: number;
  certifications_earned: number;
  skills_acquired: string[];
}

export interface Badge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_type: 'achievement' | 'milestone' | 'skill' | 'completion';
  description: string;
  image_url: string;
  earned_at: string;
  related_course_id?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'revoked';
  file_url?: string;
  verification_code: string;
  created_at: string;
}

// ==================== RECOMMENDATIONS & ANALYTICS ====================
export interface CourseRecommendation {
  course_id: string;
  course_title: string;
  reason: 'skill_gap' | 'career_path' | 'prerequisite' | 'trending' | 'similar_interests';
  relevance_score: number; // 0-100
  matching_skills?: string[];
}

export interface LearnerProfile {
  user_id: string;
  completed_courses: number;
  current_courses: number;
  total_learning_hours: number;
  skills_acquired: string[];
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferred_pace?: 'fast' | 'normal' | 'slow';
  career_interests?: string[];
  skill_levels: SkillLevel[];
}

export interface SkillLevel {
  skill_name: string;
  proficiency: number; // 0-100
  verified: boolean;
  last_assessed: string;
}

export interface CourseAnalytics {
  course_id: string;
  total_enrollments: number;
  active_learners: number;
  completion_rate: number;
  average_completion_time_days: number;
  average_score?: number;
  learner_satisfaction?: number;
  drop_out_rate: number;
  most_challenging_lessons: string[];
  engagement_score: number; // 0-100
}

export interface LearnerAnalytics {
  user_id: string;
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  total_learning_hours: number;
  average_course_completion_time_days: number;
  learning_streak_days: number;
  completion_rate_percentage: number;
  engagement_level: 'low' | 'medium' | 'high';
  improvement_trend: number; // % improvement
}

// ==================== CONTENT UPLOAD & MANAGEMENT ====================
export interface ContentUpload {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  upload_status: 'uploading' | 'processing' | 'completed' | 'failed';
  upload_progress_percent?: number;
  uploaded_by: string;
  created_at: string;
  processing_details?: {
    transcribed_text?: string;
    extracted_frames?: number;
    thumbnails_generated?: boolean;
  };
}

export interface UploadedFile {
  id: string;
  course_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_url: string;
  cdn_url?: string;
  processed: boolean;
  processing_metadata?: Record<string, any>;
  uploaded_by: string;
  uploaded_at: string;
}

// ==================== COURSE SETTINGS ====================
export interface CourseSettings {
  course_id: string;
  allow_enrollment: boolean;
  allow_unenrollment: boolean;
  is_self_paced: boolean;
  start_date?: string;
  end_date?: string;
  max_participants?: number;
  passing_score?: number;
  allow_lesson_replay: boolean;
  track_time_spent: boolean;
  send_completion_emails: boolean;
  send_reminder_emails: boolean;
  display_progress_bar: boolean;
  display_completion_percentage: boolean;
}

// ==================== DISCUSSION & SUPPORT ====================
export interface CourseDiscussion {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  thread_count: number;
  is_active: boolean;
}

export interface DiscussionThread {
  id: string;
  discussion_id: string;
  course_id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
}

export interface DiscussionReply {
  id: string;
  thread_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_answer: boolean;
  helpful_count: number;
}
