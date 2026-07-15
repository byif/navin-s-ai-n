export type AtsStage = 'Applied' | 'Screening' | 'Shortlisted' | 'AI Interview' | 'Technical Round' | 'HR Round' | 'Selected' | 'Rejected';

export interface RecruiterJob {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceRequired: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  openings: number;
  deadline: string;
  status: 'Active' | 'Closed';
  views: number;
  applications: number;
  shortlisted: number;
  interviews: number;
  selected: number;
}

export interface Candidate {
  id: string;
  name: string;
  resumeScore: number;
  atsScore: number;
  experience: number;
  skills: string[];
  education: string;
  location: string;
  careerPrediction: string;
  stage: AtsStage;
  interviewScore: number;
  confidenceScore: number;
  communicationScore: number;
  eyeContactScore: number;
  technicalScore: number;
  resumeUrl: string;
}

export const jobs: RecruiterJob[] = [
  {
    id: 'job-1',
    title: 'Frontend Developer',
    description: 'Build responsive React interfaces for an AI recruitment SaaS product.',
    requiredSkills: ['React', 'TypeScript', 'HTML', 'CSS', 'REST API'],
    experienceRequired: '1-3 years',
    location: 'Hyderabad / Remote',
    employmentType: 'Full-time',
    salaryRange: '6-10 LPA',
    openings: 3,
    deadline: '2026-07-15',
    status: 'Active',
    views: 1240,
    applications: 84,
    shortlisted: 18,
    interviews: 9,
    selected: 2,
  },
  {
    id: 'job-2',
    title: 'Machine Learning Intern',
    description: 'Assist with model evaluation, NLP pipelines, and resume intelligence experiments.',
    requiredSkills: ['Python', 'Pandas', 'Machine Learning', 'NLP'],
    experienceRequired: '0-1 years',
    location: 'Bengaluru',
    employmentType: 'Internship',
    salaryRange: '20k-35k/month',
    openings: 2,
    deadline: '2026-07-01',
    status: 'Active',
    views: 860,
    applications: 52,
    shortlisted: 12,
    interviews: 5,
    selected: 1,
  },
  {
    id: 'job-3',
    title: 'Data Analyst',
    description: 'Create dashboards, analyze hiring signals, and support business reporting.',
    requiredSkills: ['SQL', 'Excel', 'Power BI', 'Python'],
    experienceRequired: '1-2 years',
    location: 'Chennai',
    employmentType: 'Full-time',
    salaryRange: '5-8 LPA',
    openings: 1,
    deadline: '2026-06-25',
    status: 'Closed',
    views: 640,
    applications: 39,
    shortlisted: 8,
    interviews: 4,
    selected: 1,
  },
];

export const candidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Rahul Sharma',
    resumeScore: 92,
    atsScore: 95,
    experience: 2,
    skills: ['React', 'TypeScript', 'HTML', 'CSS', 'REST API', 'Git'],
    education: 'B.Tech CSE',
    location: 'Hyderabad',
    careerPrediction: 'Full Stack Developer',
    stage: 'Shortlisted',
    interviewScore: 88,
    confidenceScore: 84,
    communicationScore: 86,
    eyeContactScore: 82,
    technicalScore: 91,
    resumeUrl: '#',
  },
  {
    id: 'cand-2',
    name: 'Suresh Kumar',
    resumeScore: 86,
    atsScore: 90,
    experience: 1,
    skills: ['Python', 'Pandas', 'Machine Learning', 'NLP', 'SQL'],
    education: 'MCA',
    location: 'Bengaluru',
    careerPrediction: 'Machine Learning Engineer',
    stage: 'AI Interview',
    interviewScore: 82,
    confidenceScore: 78,
    communicationScore: 80,
    eyeContactScore: 76,
    technicalScore: 87,
    resumeUrl: '#',
  },
  {
    id: 'cand-3',
    name: 'Priya Reddy',
    resumeScore: 89,
    atsScore: 84,
    experience: 3,
    skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Statistics'],
    education: 'B.Sc Statistics',
    location: 'Chennai',
    careerPrediction: 'Data Analyst',
    stage: 'Technical Round',
    interviewScore: 90,
    confidenceScore: 88,
    communicationScore: 91,
    eyeContactScore: 86,
    technicalScore: 89,
    resumeUrl: '#',
  },
  {
    id: 'cand-4',
    name: 'Ananya Mehta',
    resumeScore: 78,
    atsScore: 76,
    experience: 1,
    skills: ['Figma', 'UI Design', 'React', 'CSS'],
    education: 'B.Des',
    location: 'Pune',
    careerPrediction: 'UI/UX Designer',
    stage: 'Screening',
    interviewScore: 74,
    confidenceScore: 72,
    communicationScore: 79,
    eyeContactScore: 70,
    technicalScore: 73,
    resumeUrl: '#',
  },
  {
    id: 'cand-5',
    name: 'Vikram Singh',
    resumeScore: 81,
    atsScore: 73,
    experience: 4,
    skills: ['Docker', 'Linux', 'AWS', 'CI/CD', 'Kubernetes'],
    education: 'B.Tech IT',
    location: 'Noida',
    careerPrediction: 'DevOps Engineer',
    stage: 'Applied',
    interviewScore: 0,
    confidenceScore: 0,
    communicationScore: 0,
    eyeContactScore: 0,
    technicalScore: 0,
    resumeUrl: '#',
  },
];

export const atsStages: AtsStage[] = ['Applied', 'Screening', 'Shortlisted', 'AI Interview', 'Technical Round', 'HR Round', 'Selected', 'Rejected'];

export const monthlyApplications = [
  { month: 'Jan', count: 38 },
  { month: 'Feb', count: 52 },
  { month: 'Mar', count: 61 },
  { month: 'Apr', count: 74 },
  { month: 'May', count: 92 },
  { month: 'Jun', count: 118 },
];
