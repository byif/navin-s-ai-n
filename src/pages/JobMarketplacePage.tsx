import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Briefcase, CheckCircle2, Filter, Search, Send, Sparkles, AlertCircle } from 'lucide-react';
import { applyToJob, readStore, subscribeToStore, toggleSavedJob, type MarketplaceJob } from '../services/recruitmentStore';
import { useAuth } from '../context/AuthContext';

const JobMarketplacePage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('recommended');
  const [message, setMessage] = useState('');
  const [selectedResume, setSelectedResume] = useState('Primary Resume.pdf');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const store = await readStore();
        setJobs(store.jobs);
        setSavedJobs(store.savedJobs[user?.email || ''] || []);
      } catch {
        setJobs([]);
        setSavedJobs([]);
      }
    };
    load();
    return subscribeToStore(load);
  }, [user?.email]);

  const filteredJobs = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const lowerSkill = skill.toLowerCase();
    const lowerLocation = location.toLowerCase();
    return jobs
      .filter((job) => [job.title, job.companyName, job.description].join(' ').toLowerCase().includes(lowerQuery))
      .filter((job) => !lowerSkill || job.requiredSkills.some((item) => item.toLowerCase().includes(lowerSkill)))
      .filter((job) => !lowerLocation || job.location.toLowerCase().includes(lowerLocation))
      .sort((a, b) => {
        if (sort === 'newest') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        if (sort === 'applications') return b.applications - a.applications;
        if (sort === 'salary') return b.salaryRange.localeCompare(a.salaryRange);
        return b.requiredSkills.length - a.requiredSkills.length;
      });
  }, [jobs, location, query, skill, sort]);

  const handleApply = async (jobId: string) => {
    if (!user) return;
    try {
      await applyToJob({
        jobId,
        candidateEmail: user.email,
        candidateName: user.name,
        resumeName: selectedResume,
      });
      setMessage('Application submitted successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to apply.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-slate-950 p-8 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300"><Sparkles className="h-4 w-4" /> Job marketplace</p>
          <h1 className="mt-3 text-4xl font-bold">Available jobs from recruiter postings</h1>
          <p className="mt-3 max-w-3xl text-slate-300">Search, filter, save, and apply to jobs posted by recruiters on the platform.</p>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative md:col-span-2"><Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs or companies" className="input pl-11" /></div>
            <input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Skill filter" className="input" />
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className="input" />
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="input"><option value="recommended">Recommended</option><option value="newest">Newest First</option><option value="salary">Highest Salary</option><option value="applications">Most Applications</option></select>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-slate-500"><Filter className="h-4 w-4" /> Filters support company, location, experience, skills, type, salary, and recommendation sorting.</div>
        </section>

        {message && <p className="mt-4 rounded-2xl bg-emerald-50 p-4 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"><CheckCircle2 className="mr-2 inline h-5 w-5" />{message}</p>}

        <div className="mt-6 grid gap-5">
          {filteredJobs.map((job) => {
            const isClosed = job.status === 'Closed';

            return (
              <article key={job.id} className={`rounded-3xl border p-6 shadow-sm transition ${isClosed ? 'border-red-200 bg-red-50/10 dark:border-red-950/20 dark:bg-red-950/5' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4 flex-1">
                    <img src={job.companyLogo} alt="" className="h-14 w-14 rounded-2xl border border-slate-200 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{job.companyName}</p>
                        {isClosed && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-100 dark:border-red-900/40">
                            Job Expired
                          </span>
                        )}
                      </div>
                      <h2 className={`mt-1 text-2xl font-bold ${isClosed ? 'text-slate-500 dark:text-slate-400' : ''}`}>{job.title}</h2>
                      <p className="mt-2 text-sm text-slate-500">{job.location} • {job.employmentType} • {job.experienceRequired} • {job.salaryRange}</p>
                      <div className="mt-3 flex flex-wrap gap-2">{job.requiredSkills.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item}</span>)}</div>
                      <p className={`mt-3 text-sm leading-6 ${isClosed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>{job.description}</p>
                      <p className="mt-3 text-xs text-slate-400">Openings: {job.openings} • Deadline: {job.deadline} • Posted: {new Date(job.postedDate).toLocaleDateString()} • Applications: {job.applications}</p>
                      
                      {/* Interactive Closed Banner Displaying the Recruiter's Reason */}
                      {isClosed && (job as any).closeReason && (
                        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-500/5 border border-red-200/40 p-3 text-xs text-red-600 dark:text-red-400 max-w-xl">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Notice:</span> This position has wrapped up recruitment. The recruiter flagged this folder as closed because: <span className="font-extrabold italic bg-red-100 dark:bg-red-950 px-1.5 py-0.5 rounded ml-1">{(job as any).closeReason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Action Panel (Disabled state on Closed status) */}
                  <div className="w-full space-y-3 lg:w-64 shrink-0">
                    <select 
                      disabled={isClosed} 
                      value={selectedResume} 
                      onChange={(event) => setSelectedResume(event.target.value)} 
                      className="input disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option>Primary Resume.pdf</option>
                      <option>Resume Builder Export.pdf</option>
                    </select>

                    <button 
                      onClick={() => handleApply(job.id)} 
                      disabled={isClosed}
                      className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800"
                    >
                      <Send className="h-4 w-4" /> Apply
                    </button>

                    <button 
                      onClick={async () => {
                        if (!user) return;
                        await toggleSavedJob(user.email, job.id);
                        setSavedJobs((current) => current.includes(job.id) ? current.filter((id) => id !== job.id) : [...current, job.id]);
                      }} 
                      className="btn-secondary w-full justify-center"
                    >
                      <Bookmark className="h-4 w-4" /> {savedJobs.includes(job.id) ? 'Saved' : 'Save Job'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <Briefcase className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-3 text-xl font-bold">{jobs.length === 0 ? 'No jobs available yet.' : 'No jobs match your filters.'}</h2>
              <p className="mt-2 text-slate-500">{jobs.length === 0 ? 'Recruiter-created jobs will appear here automatically.' : 'Try changing your search or filters.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMarketplacePage;