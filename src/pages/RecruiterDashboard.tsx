import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 1. Added import to intercept URL query parameters
import { BarChart3, Building2, CalendarClock, Briefcase, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { candidateFromApplication, readStore, subscribeToStore, updateApplicationStatus, type JobApplication, type MarketplaceJob } from '../services/recruitmentStore';
import { type Candidate, type RecruiterJob } from '../data/recruiter';

// Corrected sub-page component imports to step back out of pages/ into components/recruiter/
import { OverviewPage } from '../components/recruiter/OverviewPage';
import { JobsPage } from '../components/recruiter/JobsPage';
import { CandidatesPage } from '../components/recruiter/CandidatesPage';
import { AtsPipelinePage } from '../components/recruiter/AtsPipelinePage';
import { InterviewsPage } from '../components/recruiter/InterviewsPage';
import { AnalyticsPage } from '../components/recruiter/AnalyticsPage';
import { CompanyProfilePage } from '../components/recruiter/CompanyProfilePage';

export type RecruiterViewType = 'overview' | 'jobs' | 'candidates' | 'ats-pipeline' | 'interviews' | 'analytics' | 'company';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams(); // 2. Hook to parse the active URL query search state
  const [currentView, setCurrentView] = useState<RecruiterViewType>('overview');
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [message, setMessage] = useState('');

  // 3. LISTEN TO URL CHANGES DISPATCHED FROM THE GLOBAL SEARCH BAR
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      // Validate string type bounds explicitly before assigning to view state
      const validViews: string[] = ['overview', 'jobs', 'candidates', 'ats-pipeline', 'interviews', 'analytics', 'company'];
      if (validViews.includes(section)) {
        setCurrentView(section as RecruiterViewType);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        const store = await readStore();
        const companyName = user?.recruiterProfile?.companyName;
        const recruiterJobs = companyName ? store.jobs.filter((j) => j.companyName === companyName) : store.jobs;
        const recruiterApplications = companyName ? store.applications.filter((a) => a.companyName === companyName) : store.applications;
        
        setJobs(recruiterJobs);
        setApplications(recruiterApplications);
        setSelectedJobId((current) => current || recruiterJobs[0]?.id || '');
      } catch {
        setJobs([]);
        setApplications([]);
      }
    };

    load();
    return subscribeToStore(load);
  }, [user?.recruiterProfile?.companyName]);

  const candidates = useMemo(() => applications.map(candidateFromApplication), [applications]);
  const selectedJob = jobs.find((job) => job.id === selectedJobId) || jobs[0];

  const rankedCandidates = useMemo(() => {
    if (!selectedJob) return candidates.map((c) => ({ ...c, match: c.atsScore }));
    return candidates
      .map((c) => ({ ...c, match: calculateJobMatch(c, selectedJob) || c.atsScore }))
      .sort((a, b) => b.match - a.match);
  }, [candidates, selectedJob]);

  const changeStatus = async (applicationId: string, status: JobApplication['status']) => {
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update status.');
    } finally {
      setApplications((curr) => curr.map((app) => app.id === applicationId ? { ...app, status } : app));
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'ats-pipeline', label: 'ATS Pipeline', icon: BarChart3 },
    { id: 'interviews', label: 'Interviews', icon: CalendarClock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'company', label: 'Company', icon: Building2 },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white flex">
      {/* Sidebar Layout */}
      <aside className="w-[280px] border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sticky top-0 h-screen hidden lg:flex flex-col">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Recruiter Suite</p>
        <h1 className="mt-3 text-2xl font-bold truncate">{user?.recruiterProfile?.companyName || "Navin's AI"}</h1>
        <p className="mt-1 text-sm text-slate-500 truncate">{user?.recruiterProfile?.designation || 'Recruiter Workspace'}</p>
        
        <nav className="mt-8 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active 
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Spacious Workspace Window */}
      <main className="flex-1 p-6 sm:p-10 max-w-[1400px] mx-auto w-full space-y-8 overflow-y-auto">
        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300"><Sparkles className="h-4 w-4" /> ATS Command Center</p>
          <h2 className="mt-3 text-4xl font-bold capitalize">{currentView.replace('-', ' ')}</h2>
        </section>

        {message && <p className="rounded-2xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{message}</p>}

        {/* View Router Routing Controller Logic */}
        <div className="transition-all duration-200 ease-in-out">
          {currentView === 'overview' && <OverviewPage jobs={jobs} applications={applications} user={user} />}          
          {currentView === 'jobs' && <JobsPage jobs={jobs} setJobs={setJobs} selectedJobId={selectedJobId} setSelectedJobId={setSelectedJobId} user={user} />}
          {currentView === 'candidates' && <CandidatesPage rankedCandidates={rankedCandidates} selectedJob={selectedJob} changeStatus={changeStatus} />}
          {currentView === 'ats-pipeline' && <AtsPipelinePage candidates={candidates} />}
          {currentView === 'interviews' && <InterviewsPage applications={applications} user={user} setApplications={setApplications} setMessage={setMessage} />}
          {currentView === 'analytics' && <AnalyticsPage applications={applications} />}
          {currentView === 'company' && <CompanyProfilePage user={user} />}
        </div>
      </main>
    </div>
  );
};

const calculateJobMatch = (candidate: Candidate, job: RecruiterJob) => {
  const requiredSkills = job.requiredSkills.map((s) => s.toLowerCase());
  const candidateSkills = candidate.skills.map((s) => s.toLowerCase());
  const skillHits = requiredSkills.filter((s) => candidateSkills.includes(s)).length;
  const skillMatch = requiredSkills.length ? (skillHits / requiredSkills.length) * 60 : 0;
  return Math.round(skillMatch + (candidate.atsScore / 100) * 40);
};

export default RecruiterDashboard;
