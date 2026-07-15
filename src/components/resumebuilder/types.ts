export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface EducationItem {
  university: string;
  branch: string;
  year: string;
  grade: string;
}

export interface ProjectItem {
  title: string;
  desc: string;
  tech: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface SimpleEntry {
  title: string;
  detail: string;
  year?: string;
}

export interface ResumeData {
  template: string;
  resumeType?: string;
  versionName?: string;
  personal: PersonalInfo;
  education: EducationItem[];
  experience?: ExperienceItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications?: SimpleEntry[];
  achievements?: SimpleEntry[];
  internships?: ExperienceItem[];
  research?: SimpleEntry[];
  publications?: SimpleEntry[];
  languages?: string[];
  activities?: SimpleEntry[];
  references?: SimpleEntry[];
}

export interface StepControls {
  onNext: () => void;
  onBack: () => void;
}
