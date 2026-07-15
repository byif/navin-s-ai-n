import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  Laptop,
  MessageSquare,
  Mic,
  Monitor,
  Radio,
  Send,
  ShieldCheck,
  Timer,
  User,
  UserCheck,
  Users,
  Video,
  Volume2,
  Wifi,
} from 'lucide-react';
import { scheduleInterview, type JobApplication } from '../../services/recruitmentStore';

interface Props {
  applications: JobApplication[];
  user: { email?: string } | null;
  setApplications: Dispatch<SetStateAction<JobApplication[]>>;
  setMessage: (msg: string) => void;
}

type InterviewType = 'AI Interview' | 'Technical Interview' | 'HR Interview';

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDate = (value: string) => {
  if (!value) return 'Select date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
};

const scoreTone = (score: number) => {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
};

const MetricBar = ({ label, value, tone = 'bg-indigo-500' }: { label: string; value: number; tone?: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={`h-full rounded-full ${tone} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-xl p-2.5 ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="mt-3 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">{detail}</p>
  </div>
);

export const InterviewsPage = ({ applications, user, setApplications, setMessage }: Props) => {
  const [selectedAppId, setSelectedAppId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('45');
  const [type, setType] = useState<InterviewType>('AI Interview');
  const [mode, setMode] = useState('Online');
  const [round, setRound] = useState('Round 1 - Screening');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [note, setNote] = useState('Focus on role fit, communication clarity, and practical project depth.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAppDetails = applications.find((app) => app.id === selectedAppId) ?? applications[0];
  const scheduledApplications = applications.filter((app) => app.status === 'Interview Scheduled');
  const completedApplications = applications.filter((app) => app.status === 'Interview Completed' || app.status === 'Selected');
  const todayCount = scheduledApplications.filter((app) => app.appliedDate === todayIso()).length || (scheduledApplications.length ? 1 : 0);
  const averageAts = Math.round(applications.reduce((sum, app) => sum + (app.atsScore || 0), 0) / Math.max(applications.length, 1));

  const monitoringScores = useMemo(() => {
    const base = activeAppDetails?.atsScore || 76;
    return {
      confidence: Math.min(96, Math.max(58, base + 6)),
      communication: Math.min(94, Math.max(54, base - 2)),
      eyeContact: Math.min(92, Math.max(50, base - 7)),
      emotion: Math.min(95, Math.max(60, base + 3)),
      audio: Math.min(93, Math.max(52, base - 4)),
      integrity: Math.min(98, Math.max(68, base + 10)),
    };
  }, [activeAppDetails?.atsScore]);

  const handleSchedule = async () => {
    if (!selectedAppId) {
      setMessage('Select a candidate before scheduling an interview.');
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleInterview(selectedAppId, user?.email || '', date, time, type);
      setApplications((curr) => curr.map((app) => (app.id === selectedAppId ? { ...app, status: 'Interview Scheduled' } : app)));
      setMessage('Interview scheduled, invitation prepared, and candidate status updated.');
    } catch {
      setMessage('Unable to sync interview schedule right now. Please check Supabase and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const interviewModes = [
    { id: 'AI Interview', label: 'AI Screen', desc: 'Automated fit and signal review', icon: Brain, tone: 'text-violet-500', active: 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' },
    { id: 'Technical Interview', label: 'Technical', desc: 'Code, system and project depth', icon: Code, tone: 'text-blue-500', active: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' },
    { id: 'HR Interview', label: 'HR Round', desc: 'Culture, motivation and offer fit', icon: UserCheck, tone: 'text-emerald-500', active: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  ] as const;

  return (
    <div className="mx-auto max-w-[1450px] animate-fade-in space-y-7 pb-12">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Radio className="h-3.5 w-3.5" />
              Interview Operations
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Professional interview management and AI monitoring.
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
              Schedule candidates, prepare invitations, monitor live interview signals, and review post-interview decisions from one recruiter workspace.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate privacy</p>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">AI scores stay recruiter-only</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room status</p>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">Ready for video and proctoring</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decision flow</p>
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">Shortlist, reject, hire or next round</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-5 text-white dark:border-slate-800 lg:border-l lg:border-t-0">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black">Live interview room preview</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recruiter monitoring view</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black text-emerald-300">Ready</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="relative min-h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-[10px] font-bold text-emerald-300">
                    <Wifi className="h-3 w-3" />
                    Stable
                  </div>
                  <div className="flex h-full flex-col justify-end">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
                      <User className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-black">{activeAppDetails?.candidateName || 'Candidate preview'}</p>
                    <p className="text-[11px] text-slate-400">{activeAppDetails?.jobTitle || 'Target role'}</p>
                  </div>
                </div>
                <div className="min-h-44 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Recruiter panel</span>
                    <span>REC off</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <MetricBar label="Confidence" value={monitoringScores.confidence} tone="bg-emerald-400" />
                    <MetricBar label="Communication" value={monitoringScores.communication} tone="bg-blue-400" />
                    <MetricBar label="Integrity" value={monitoringScores.integrity} tone="bg-violet-400" />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[Mic, Video, Monitor, MessageSquare, ShieldCheck].map((Icon, index) => (
                  <button key={index} className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CalendarClock} label="Upcoming" value={scheduledApplications.length} detail="Scheduled interviews awaiting candidate join." tone="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300" />
        <StatCard icon={Timer} label="Today" value={todayCount} detail="Live-ready sessions shown in the room queue." tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedApplications.length} detail="Reports available for review and decisions." tone="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" />
        <StatCard icon={BarChart3} label="Avg ATS" value={`${Number.isFinite(averageAts) ? averageAts : 0}%`} detail="Average profile relevance across applicants." tone="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300" />
        <StatCard icon={AlertTriangle} label="Flags" value="2" detail="Attention and suspicious activity signals to review." tone="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" />
      </div>

      <div className="grid items-start gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Schedule Interview</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Create a polished invitation and prepare the interview room.</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">Supabase synced</span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Candidate</span>
              <span className="relative block">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select value={selectedAppId} onChange={(e) => setSelectedAppId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <option value="">Choose applicant...</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>{app.candidateName || 'Applicant'} - {app.jobTitle}</option>
                  ))}
                </select>
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Date</span>
              <span className="relative block">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200" />
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Start time</span>
              <span className="relative block">
                <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200" />
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Duration</span>
              <span className="relative block">
                <Timer className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Mode</span>
              <span className="relative block">
                <Laptop className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-10 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <option value="Online">Online video interview</option>
                  <option value="Offline">On-site office interview</option>
                  <option value="Hybrid">Hybrid interview</option>
                </select>
              </span>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Round</span>
              <select value={round} onChange={(e) => setRound(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <option>Round 1 - Screening</option>
                <option>Round 2 - Technical</option>
                <option>Round 3 - Managerial</option>
                <option>Final Round - HR</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Timezone</span>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <option>Asia/Kolkata</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </label>
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Interview type</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {interviewModes.map((segment) => {
                const Icon = segment.icon;
                const isSelected = type === segment.id;
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => setType(segment.id)}
                    className={`rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected ? segment.active : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`mb-3 h-4 w-4 ${isSelected ? '' : segment.tone}`} />
                    <p className="text-xs font-black">{segment.label}</p>
                    <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">{segment.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="mt-5 block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Private recruiter notes</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium leading-relaxed text-slate-700 outline-none transition focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" />
          </label>

          <button
            disabled={!selectedAppId || isSubmitting}
            onClick={handleSchedule}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Scheduling interview...' : 'Schedule and notify candidate'}
          </button>
        </section>

        <div className="space-y-7">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Candidate Invitation</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Candidate-facing details, without AI scoring.</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">Preview</span>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interview invite</p>
              <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{activeAppDetails?.jobTitle || 'Select a candidate'}</h4>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{activeAppDetails?.candidateName || 'Candidate name'} - {activeAppDetails?.companyName || 'Company'}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <Calendar className="mb-2 h-4 w-4 text-indigo-500" />
                  {formatDate(date)} at {time}
                </div>
                <div className="rounded-xl bg-white p-3 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <Clock className="mb-2 h-4 w-4 text-indigo-500" />
                  {duration} minutes - {timezone}
                </div>
                <div className="rounded-xl bg-white p-3 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <Video className="mb-2 h-4 w-4 text-indigo-500" />
                  {mode} - {type}
                </div>
                <div className="rounded-xl bg-white p-3 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <Briefcase className="mb-2 h-4 w-4 text-indigo-500" />
                  {round}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Accept', 'Decline', 'Request reschedule', 'Add calendar'].map((action) => (
                  <button key={action} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Upcoming Queue</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Ready rooms and candidate context.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(scheduledApplications.length ? scheduledApplications : applications.slice(0, 3)).map((app, index) => (
                <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{app.candidateName || 'Applicant'}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{app.jobTitle} - {index === 0 ? 'Today' : 'Upcoming'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${scoreTone(app.atsScore)}`}>{app.atsScore}% match</span>
                    <Link to="/interview" className="rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-black text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200">
                      Join Room
                    </Link>
                  </div>
                </div>
              ))}
              {!applications.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-xs font-semibold text-slate-400 dark:border-slate-800">
                  No applicants available yet. New applications will appear here for interview scheduling.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="grid items-start gap-7 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Live AI Monitoring</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recruiter-only interview signals and safeguards.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <MetricBar label="Facial confidence signal" value={monitoringScores.confidence} tone="bg-emerald-500" />
            <MetricBar label="Communication clarity" value={monitoringScores.communication} tone="bg-blue-500" />
            <MetricBar label="Eye contact stability" value={monitoringScores.eyeContact} tone="bg-indigo-500" />
            <MetricBar label="Emotion consistency" value={monitoringScores.emotion} tone="bg-violet-500" />
            <MetricBar label="Audio intelligence" value={monitoringScores.audio} tone="bg-cyan-500" />
            <MetricBar label="Integrity score" value={monitoringScores.integrity} tone="bg-amber-500" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              <p className="mt-2 text-[11px] font-black text-emerald-700 dark:text-emerald-200">No tab switch</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
              <Volume2 className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <p className="mt-2 text-[11px] font-black text-amber-700 dark:text-amber-200">Minor noise</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-300" />
              <p className="mt-2 text-[11px] font-black text-rose-700 dark:text-rose-200">2 attention flags</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Interview Report</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">A concise decision summary after the interview ends.</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">Draft report</span>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[180px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="grid h-28 w-28 place-items-center rounded-full border-[10px] border-indigo-500/20 bg-white text-center dark:bg-slate-900">
                <div>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-300">{activeAppDetails?.atsScore || 82}%</p>
                  <p className="text-[10px] font-black uppercase text-slate-400">AI Score</p>
                </div>
              </div>
              <p className="mt-4 text-center text-xs font-bold text-slate-600 dark:text-slate-300">Strong profile with focused follow-up needed.</p>
            </div>
            <div className="space-y-3">
              {[
                ['Strengths', 'Clear role alignment, relevant project examples, and steady communication.'],
                ['Weaknesses', 'Needs deeper explanation for scale, testing, and production debugging.'],
                ['Recommendation', 'Move to technical round with a practical system design prompt.'],
              ].map(([label, text]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {['Shortlist', 'Reject', 'Next round', 'Hire', 'Send feedback', 'Schedule another'].map((decision) => (
              <button
                key={decision}
                onClick={() => setMessage(`${decision} action noted for recruiter review.`)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {decision}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InterviewsPage;
