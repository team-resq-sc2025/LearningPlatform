export interface User {
  id: string;
  org_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'instructor' | 'learner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'dropped';
  progress_percent: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_type?: 'certificate' | 'badge' | 'completion';
  issued_at: string;
  expires_at?: string;
  verification_code?: string;
}
