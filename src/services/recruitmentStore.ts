import { supabase } from '../lib/supabase';
import type { AtsStage, Candidate, RecruiterJob } from '../data/recruiter';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export interface MarketplaceJob extends RecruiterJob {
  companyName: string;
  companyLogo: string;
  postedDate: string;
  companyId?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  resumeId: string;
  resumeName: string;
  atsScore: number;
  resumeScore: number;
  status: ApplicationStatus;
  appliedDate: string;
  companyName: string;
  jobTitle: string;
}

export interface PlatformNotification {
  id: string;
  userEmail: string;
  role: 'job_seeker' | 'recruiter';
  title: string;
  message: string;
  type: 'application' | 'shortlist' | 'rejection' | 'interview' | 'offer' | 'system';
  read: boolean;
  createdAt: string;
}

export interface InterviewEvent {
  id: string;
  applicationId: string;
  candidateName: string;
  recruiterEmail: string;
  date: string;
  time: string;
  interviewType: 'AI Interview' | 'Technical Interview' | 'HR Interview';
  status: 'Waiting' | 'Live' | 'Completed';
  joinTime?: string;
  exitTime?: string;
  duration?: string;
  score?: number;
}

interface RecruitmentStore {
  jobs: MarketplaceJob[];
  applications: JobApplication[];
  notifications: PlatformNotification[];
  interviews: InterviewEvent[];
  savedJobs: Record<string, string[]>;
}

const emptyStore: RecruitmentStore = {
  jobs: [],
  applications: [],
  notifications: [],
  interviews: [],
  savedJobs: {},
};

const storeListeners = new Set<() => void>();
let storeChannel: RealtimeChannel | null = null;

type JobRow = {
  id: string;
  title: string;
  description?: string | null;
  required_skills?: string[] | null;
  experience_required?: string | null;
  location?: string | null;
  employment_type?: string | null;
  salary_range?: string | null;
  openings?: number | null;
  deadline?: string | null;
  status?: 'Active' | 'Closed' | null;
  views?: number | null;
  applications_count?: number | null;
  shortlisted_count?: number | null;
  interview_count?: number | null;
  selected_count?: number | null;
  company_id?: string | null;
  company_name?: string | null;
  created_at?: string | null;
  companies?: { id?: string; name?: string | null; logo_url?: string | null } | null;
};

type ApplicationRow = {
  id: string;
  job_id: string;
  candidate_id?: string | null;
  candidate_name?: string | null;
  candidate_email?: string | null;
  resume_id?: string | null;
  resume_name?: string | null;
  ats_score?: number | null;
  resume_score?: number | null;
  status?: ApplicationStatus | null;
  created_at?: string | null;
  company_name?: string | null;
  job_title?: string | null;
};

type NotificationRow = {
  id: string;
  user_email: string;
  role: PlatformNotification['role'];
  title: string;
  message: string;
  type: PlatformNotification['type'];
  read?: boolean | null;
  created_at?: string | null;
};

type InterviewRow = {
  id: string;
  application_id: string;
  candidate_name: string;
  recruiter_email: string;
  interview_date: string;
  interview_time: string;
  interview_type: InterviewEvent['interviewType'];
  status?: InterviewEvent['status'] | null;
  join_time?: string | null;
  exit_time?: string | null;
  duration?: string | null;
  score?: number | null;
};

export const readStore = async (): Promise<RecruitmentStore> => {
  try {
    const [jobs, applications, notifications, interviews, savedJobs] = await Promise.all([
      fetchJobs(),
      fetchApplications(),
      fetchNotifications(),
      fetchInterviews(),
      fetchSavedJobs(),
    ]);

    return { jobs, applications, notifications, interviews, savedJobs };
  } catch (error) {
    console.warn('Recruitment store could not be loaded. Rendering empty state instead.', error);
    return emptyStore;
  }
};

export const subscribeToStore = (callback: () => void) => {
  storeListeners.add(callback);

  if (!storeChannel) {
    const notifyListeners = () => {
      storeListeners.forEach((listener) => listener());
    };

    storeChannel = supabase
      .channel('navins-ai-recruitment-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, notifyListeners)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, notifyListeners)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, notifyListeners)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interviews' }, notifyListeners)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_jobs' }, notifyListeners);

    storeChannel.subscribe((status, error) => {
      if (error) {
        console.warn('Realtime subscription unavailable. Pages will continue without live updates.', error);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(`Realtime subscription status: ${status}. Pages will continue without live updates.`);
      }
    });
  }

  return () => {
    storeListeners.delete(callback);
    if (storeListeners.size === 0 && storeChannel) {
      supabase.removeChannel(storeChannel);
      storeChannel = null;
    }
  };
};

export const addRecruiterJob = async (
  job: Omit<MarketplaceJob, 'id' | 'views' | 'applications' | 'shortlisted' | 'interviews' | 'selected' | 'postedDate'>
) => {
  const company = await ensureCompany(job.companyName, job.companyLogo);
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: company?.id,
      company_name: job.companyName,
      title: job.title,
      description: job.description,
      required_skills: job.requiredSkills,
      experience_required: job.experienceRequired,
      location: job.location,
      employment_type: job.employmentType,
      salary_range: job.salaryRange,
      openings: job.openings,
      deadline: job.deadline,
      status: job.status,
    })
    .select('*, companies(*)')
    .single();

  if (error) throw new Error(error.message);
  return mapJob(data as JobRow);
};

export const applyToJob = async (params: {
  jobId: string;
  candidateEmail: string;
  candidateName: string;
  resumeName: string;
}) => {
  const job = await fetchJob(params.jobId);
  if (!job) throw new Error('Job not found.');

  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', params.jobId)
    .eq('candidate_email', params.candidateEmail)
    .maybeSingle();

  if (existing) throw new Error('You have already applied to this job.');

  const { data: profile } = await supabase.from('profiles').select('id').eq('email', params.candidateEmail).maybeSingle();
  const profileId = (profile as { id?: string } | null)?.id;
  const atsScore = estimateAtsScore(job.requiredSkills, params.resumeName);
  const resumeScore = Math.max(65, Math.min(95, atsScore - 4));

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: params.jobId,
      candidate_id: profileId,
      candidate_name: params.candidateName,
      candidate_email: params.candidateEmail,
      resume_name: params.resumeName,
      ats_score: atsScore,
      resume_score: resumeScore,
      status: 'Applied',
      company_name: job.companyName,
      job_title: job.title,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await createNotification(params.candidateEmail, 'job_seeker', 'Application Submitted', `Your application for ${job.title} was submitted.`, 'application');
  await createNotification('recruiter@navinsai.in', 'recruiter', 'New Application', `${params.candidateName} applied for ${job.title}.`, 'application');

  return mapApplication(data as ApplicationRow);
};

export const updateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
  const { data, error } = await supabase.from('applications').update({ status }).eq('id', applicationId).select().single();
  if (error || !data) throw new Error(error?.message || 'Application not found.');

  const application = mapApplication(data as ApplicationRow);
  const notificationType =
    status === 'Rejected' ? 'rejection' : status === 'Shortlisted' ? 'shortlist' : status === 'Interview Scheduled' ? 'interview' : 'application';

  if (['Shortlisted', 'Rejected', 'Selected', 'Interview Scheduled', 'Withdrawn'].includes(status)) {
    await createNotification(
      application.candidateEmail,
      'job_seeker',
      status,
      `Your application for ${application.jobTitle} is now ${status}.`,
      notificationType
    );
  }
};

export const scheduleInterview = async (
  applicationId: string,
  recruiterEmail: string,
  date: string,
  time: string,
  interviewType: InterviewEvent['interviewType']
) => {
  const { data: applicationData } = await supabase.from('applications').select('*').eq('id', applicationId).maybeSingle();
  if (!applicationData) throw new Error('Application not found.');

  const application = mapApplication(applicationData as ApplicationRow);
  const { data, error } = await supabase
    .from('interviews')
    .insert({
      application_id: applicationId,
      candidate_name: application.candidateName,
      recruiter_email: recruiterEmail,
      interview_date: date,
      interview_time: time,
      interview_type: interviewType,
      status: 'Waiting',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await updateApplicationStatus(applicationId, 'Interview Scheduled');
  return mapInterview(data as InterviewRow);
};

export const toggleSavedJob = async (userEmail: string, jobId: string) => {
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', userEmail).maybeSingle();
  const profileId = (profile as { id?: string } | null)?.id;
  if (!profileId) throw new Error('Profile not found.');

  const { data: existing } = await supabase
    .from('saved_jobs')
    .select('id')
    .eq('user_id', profileId)
    .eq('job_id', jobId)
    .maybeSingle();

  if (existing) await supabase.from('saved_jobs').delete().eq('id', (existing as { id: string }).id);
  else await supabase.from('saved_jobs').insert({ user_id: profileId, job_id: jobId });
};

export const markNotificationsRead = async (userEmail: string) => {
  await supabase.from('notifications').update({ read: true }).eq('user_email', userEmail);
};

export const candidateFromApplication = (application: JobApplication): Candidate => ({
  id: application.candidateId || application.id,
  name: application.candidateName || 'Applicant',
  resumeScore: application.resumeScore,
  atsScore: application.atsScore,
  experience: 0,
  skills: [],
  education: 'Not added',
  location: 'Not added',
  careerPrediction: application.jobTitle || 'Candidate',
  stage: mapStatusToStage(application.status),
  interviewScore: 0,
  confidenceScore: 0,
  communicationScore: 0,
  eyeContactScore: 0,
  technicalScore: 0,
  resumeUrl: '#',
});

const fetchJobs = async () => {
  const { data, error } = await supabase.from('jobs').select('*, companies(*)').order('created_at', { ascending: false });
  if (error) return [];
  return ((data || []) as JobRow[]).map(mapJob);
};

const fetchJob = async (jobId: string) => {
  const { data, error } = await supabase.from('jobs').select('*, companies(*)').eq('id', jobId).maybeSingle();
  if (error || !data) return undefined;
  return mapJob(data as JobRow);
};

const fetchApplications = async () => {
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return ((data || []) as ApplicationRow[]).map(mapApplication);
};

const fetchNotifications = async () => {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return ((data || []) as NotificationRow[]).map(mapNotification);
};

const fetchInterviews = async () => {
  const { data, error } = await supabase.from('interviews').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return ((data || []) as InterviewRow[]).map(mapInterview);
};

const fetchSavedJobs = async () => {
  const { data, error } = await supabase.from('saved_jobs').select('job_id, profiles(email)');
  if (error) return {};

  return ((data || []) as Array<{ job_id: string; profiles?: { email?: string | null } | null }>).reduce<Record<string, string[]>>(
    (acc, row) => {
      const email = row.profiles?.email;
      if (!email) return acc;
      acc[email] = [...(acc[email] || []), row.job_id];
      return acc;
    },
    {}
  );
};

const createNotification = async (
  userEmail: string,
  role: PlatformNotification['role'],
  title: string,
  message: string,
  type: PlatformNotification['type']
) => {
  if (!userEmail) return;
  await supabase.from('notifications').insert({ user_email: userEmail, role, title, message, type, read: false });
};

const ensureCompany = async (name: string, logoUrl?: string) => {
  const { data: existing } = await supabase.from('companies').select('id,name,logo_url').eq('name', name).maybeSingle();
  if (existing) return existing as { id: string; name: string; logo_url?: string };

  const { data } = await supabase.from('companies').insert({ name, logo_url: logoUrl }).select('id,name,logo_url').single();
  return data as { id: string; name: string; logo_url?: string } | null;
};

const mapJob = (row: JobRow): MarketplaceJob => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  requiredSkills: row.required_skills || [],
  experienceRequired: row.experience_required || '',
  location: row.location || '',
  employmentType: row.employment_type || '',
  salaryRange: row.salary_range || '',
  openings: row.openings || 1,
  deadline: row.deadline || '',
  status: row.status || 'Active',
  views: row.views || 0,
  applications: row.applications_count || 0,
  shortlisted: row.shortlisted_count || 0,
  interviews: row.interview_count || 0,
  selected: row.selected_count || 0,
  companyId: row.company_id || row.companies?.id,
  companyName: row.companies?.name || row.company_name || 'Recruiter Company',
  companyLogo: row.companies?.logo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(row.company_name || row.title)}`,
  postedDate: row.created_at || new Date().toISOString(),
});

const mapApplication = (row: ApplicationRow): JobApplication => ({
  id: row.id,
  jobId: row.job_id,
  candidateId: row.candidate_id || '',
  candidateName: row.candidate_name || '',
  candidateEmail: row.candidate_email || '',
  resumeId: row.resume_id || '',
  resumeName: row.resume_name || '',
  atsScore: row.ats_score || 0,
  resumeScore: row.resume_score || 0,
  status: row.status || 'Applied',
  appliedDate: row.created_at || new Date().toISOString(),
  companyName: row.company_name || '',
  jobTitle: row.job_title || '',
});

const mapNotification = (row: NotificationRow): PlatformNotification => ({
  id: row.id,
  userEmail: row.user_email,
  role: row.role,
  title: row.title,
  message: row.message,
  type: row.type,
  read: Boolean(row.read),
  createdAt: row.created_at || new Date().toISOString(),
});

const mapInterview = (row: InterviewRow): InterviewEvent => ({
  id: row.id,
  applicationId: row.application_id,
  candidateName: row.candidate_name,
  recruiterEmail: row.recruiter_email,
  date: row.interview_date,
  time: row.interview_time,
  interviewType: row.interview_type,
  status: row.status || 'Waiting',
  joinTime: row.join_time || undefined,
  exitTime: row.exit_time || undefined,
  duration: row.duration || undefined,
  score: row.score || undefined,
});

const mapStatusToStage = (status: ApplicationStatus): AtsStage => {
  if (status === 'Interview Scheduled' || status === 'Interview Completed') return 'AI Interview';
  if (status === 'Shortlisted') return 'Shortlisted';
  if (status === 'Rejected' || status === 'Withdrawn') return 'Rejected';
  if (status === 'Selected') return 'Selected';
  if (status === 'Screening') return 'Screening';
  return 'Applied';
};

const estimateAtsScore = (skills: string[], resumeName: string) => {
  const skillSignal = Math.min(30, skills.length * 4);
  const resumeSignal = resumeName.toLowerCase().includes('resume') ? 15 : 8;
  return Math.min(95, 55 + skillSignal + resumeSignal);
};

// Open src/services/recruitmentStore.ts and replace the placeholder function with this:
export const updateJobStatusInSupabase = async (jobId: string, status: 'Active' | 'Closed', reason?: string) => {
  try {
    // 1. Target the exact job row matching the unique ID
    const { data, error } = await supabase
      .from('jobs') // Make sure this matches your exact Supabase table name (e.g., 'jobs' or 'marketplace_jobs')
      .update({ 
        status: status, 
        closeReason: reason 
      })
      .eq('id', jobId);

    // 2. Catch and throw any schema-level anomalies or connection drops
    if (error) {
      throw new Error(`Supabase Sync Error: ${error.message}`);
    }

    console.log(`Successfully persisted state: Job ${jobId} is now ${status} (${reason || 'No reason specified'}).`);
    return data;
  } catch (error) {
    console.error("Critical Failure in recruitmentStore update pipeline:", error);
    throw error;
  }
};
