import { useEffect, useState } from 'react';
import { CalendarClock, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { readStore, subscribeToStore, updateApplicationStatus, type InterviewEvent, type JobApplication } from '../services/recruitmentStore';
import { useAuth } from '../context/AuthContext';

const timeline = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected / Rejected'];

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const store = await readStore();
        const userApplications = store.applications.filter((application) => application.candidateEmail === user?.email);
        setApplications(userApplications);
        setInterviews(store.interviews.filter((interview) => userApplications.some((application) => application.id === interview.applicationId)));
      } catch {
        setApplications([]);
        setInterviews([]);
      }
    };
    load();
    return subscribeToStore(load);
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-4 w-4" /> Application tracker</p>
        <h1 className="mt-3 text-4xl font-bold">My Applications</h1>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-5">
            {applications.map((application) => (
              <article key={application.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h2 className="text-xl font-bold">{application.jobTitle}</h2><p className="mt-1 text-sm text-slate-500">{application.companyName} • Applied {new Date(application.appliedDate).toLocaleDateString()}</p></div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{application.status}</span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-6">
                  {timeline.map((item, index) => <div key={item} className={`rounded-xl p-3 text-xs font-semibold ${index <= statusIndex(application.status) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{item}</div>)}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm text-slate-500"><span>ATS {application.atsScore}</span><span>Resume {application.resumeScore}</span><span>Resume: {application.resumeName}</span></div>
                {application.status !== 'Withdrawn' && <button onClick={async () => {
                  try {
                    await updateApplicationStatus(application.id, 'Withdrawn');
                    setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: 'Withdrawn' } : item));
                  } catch {
                    setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: 'Withdrawn' } : item));
                  }
                }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600"><RotateCcw className="h-4 w-4" /> Withdraw Application</button>}
              </article>
            ))}
            {applications.length === 0 && <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">You haven't applied to any jobs yet.</p>}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-bold"><CalendarClock className="h-5 w-5 text-indigo-500" /> Upcoming Interviews</h2>
            <div className="mt-5 space-y-4">
              {interviews.map((interview) => <div key={interview.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"><p className="font-bold">{interview.interviewType}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><Clock className="h-4 w-4" /> {interview.date} at {interview.time}</p><p className="mt-2 text-xs font-semibold text-indigo-600">{interview.status}</p></div>)}
              {interviews.length === 0 && <p className="text-sm text-slate-500">No interviews scheduled yet.</p>}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const statusIndex = (status: string) => {
  if (status === 'Rejected' || status === 'Selected') return 5;
  return Math.max(0, timeline.findIndex((item) => item === status));
};

export default MyApplicationsPage;
