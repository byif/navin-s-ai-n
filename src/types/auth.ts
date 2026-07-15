export type UserRole = 'job_seeker' | 'recruiter' | 'admin';

export interface RecruiterProfile {
  companyName: string;
  designation: string;
  companyWebsite: string;
  industry: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  recruiterProfile?: RecruiterProfile;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
