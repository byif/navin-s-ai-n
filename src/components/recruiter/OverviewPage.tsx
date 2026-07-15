import { useMemo } from 'react';
import { Briefcase, CheckCircle2, FileText, Users, Shield, Radio, Layers, Activity, Calendar, ArrowUpRight } from 'lucide-react';
import { type MarketplaceJob, type JobApplication } from '../../services/recruitmentStore';

interface Props {
  jobs: MarketplaceJob[];
  applications: JobApplication[];
  user: any;
}

export const OverviewPage = ({ jobs, applications, user }: Props) => {
  // Explicitly fallback to your name for a professional, personalized greeting
  const hrName = user?.name || user?.recruiterProfile?.fullName || 'Navin';
  
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  
  const averageAtsScore = useMemo(() => {
    if (!applications.length) return 0;
    return Math.round(applications.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) / applications.length);
  }, [applications]);

  // Current Date display for corporate scheduling alignment
  const currentDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      
      {/* 1. EXECUTIVE UTILITY BANNER (Compact & Functional) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Terminal Node Alpha
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{hrName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            System load nominal. Your automated candidate match queues are fully synchronized.
          </p>
        </div>

        {/* Corporate Timestamp Widget */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800/80 self-start sm:self-auto">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{currentDateString}</span>
        </div>
      </div>

      {/* 2. COMPACT MATRIX METRICS ROW */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Postings', value: jobs.length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Active Pipeline', value: activeJobsCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Total Applicants', value: applications.length, icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/5' },
          { label: 'Shortlisted Pool', value: shortlistedCount, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 ${stat.bg} ${stat.color} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. PROFESSIONAL SPLIT SYSTEMS INDEX */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* SYSTEM ACTIVITY TRACKER (Takes 2 Columns) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Functional Ratios</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Live Diagnostics</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Match Index Avg</p>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{averageAtsScore}%</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apps Per Role</p>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                {jobs.length ? (applications.length / jobs.length).toFixed(1) : 0}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Velocity</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Optimal</p>
            </div>
          </div>

          {/* Saturated Horizontal Loader Track */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Database Queue Saturation</span>
              <span className="text-slate-600 dark:text-slate-400">{applications.length} Profiles Cached</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, (applications.length * 6)))}%` }} 
              />
            </div>
          </div>
        </div>

        {/* INTEGRATION INFRASTRUCTURE LOGGER (Takes 1 Column) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Registries</h3>
            </div>
            <ArrowUpRight className="h-3 w-3 text-slate-400" />
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Supabase Data Gateway', desc: 'Sync Active', status: 'Online', icon: Radio },
              { label: 'Automated Screening AI', desc: 'Model Parsing', status: 'Operational', icon: Shield }
            ].map((item) => {
              const SubIcon = item.icon;
              return (
                <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SubIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-100/50 dark:border-indigo-900/30 shrink-0 ml-2">
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OverviewPage;