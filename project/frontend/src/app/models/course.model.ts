export interface Course {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  duration_hours?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order?: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content?: string;
  duration_minutes?: number;
  order?: number;
  created_at: string;
}
