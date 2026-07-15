import { useState } from 'react';
import { Activity, Sparkles, ShieldCheck, TrendingUp, Users, UserCheck, Briefcase, Calendar } from 'lucide-react';

export const AnalyticsPage = () => {
  // Simulator calculation state values
  const [totalApplicants, setTotalApplicants] = useState(120);
  const [aiPassRate, setAiPassRate] = useState(60);
  const [techPassRate, setTechPassRate] = useState(45);
  const [hrPassRate, setHrPassRate] = useState(80);

  // Derive funnel metrics step-by-step
  const passedAI = Math.round(totalApplicants * (aiPassRate / 100));
  const passedTech = Math.round(passedAI * (techPassRate / 100));
  const finalOffers = Math.round(passedTech * (hrPassRate / 100));

  const totalConversionRate = totalApplicants > 0 ? ((finalOffers / totalApplicants) * 100).toFixed(1) : "0.0";

  // Mock data for the historical monthly ledger node graph
  const monthlyData = [
    { month: 'Jan', processed: 90, accepted: 12, height: 'h-24' },
    { month: 'Feb', processed: 140, accepted: 22, height: 'h-36' },
    { month: 'Mar', processed: 180, accepted: 31, height: 'h-48' },
    { month: 'Apr', processed: 110, accepted: 18, height: 'h-28' },
    { month: 'May', processed: 160, accepted: 28, height: 'h-40' },
    { month: 'Jun', processed: totalApplicants, accepted: finalOffers, height: 'h-32' } // Binds dynamically to your live sandbox sliders!
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-[1300px] mx-auto">
      
      {/* 1. TOP PERFORMANCE METRIC NODES */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'AI Screening Velocity', value: '94.2%', trend: '+4.1% this week', color: 'text-violet-500', bg: 'bg-violet-500/5' },
          { label: 'Funnel Conversion Rate', value: `${totalConversionRate}%`, trend: 'Based on active rules', color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Avg Interview Evaluation', value: '81.4%', trend: 'Highly qualified pool', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Database Active Caches', value: '1,420', trend: 'Fully synchronized', color: 'text-blue-500', bg: 'bg-blue-500/5' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-medium text-slate-400">{stat.trend}</p>
            </div>
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <Activity className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. EXPLANATORY HERO HEADER */}
      <div className="bg-slate-950 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" /> Intelligence Center
          </p>
          <h2 className="text-xl font-extrabold tracking-tight">Interactive Pipeline Analytics Sandbox</h2>
          <p className="text-xs text-slate-400 font-medium max-w-2xl">
            Simulate and analyze your recruitment pipeline behavior. Adjust volume indices and matching parameters to model exact pipeline conversion drop-offs.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 self-start md:self-auto shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Real-time Simulation Engine
        </div>
      </div>

      {/* 3. NATIVE REACT INTERACTIVE FUNNEL SIMULATOR */}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* CONTROL PANEL CONFIGURATION CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            Simulation Parameters
          </h3>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Total Applicants Pool</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{totalApplicants} profiles</span>
            </div>
            <input 
              type="range" min="10" max="500" step="10"
              value={totalApplicants} onChange={(e) => setTotalApplicants(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>AI Screening Pass Rate</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{aiPassRate}%</span>
            </div>
            <input 
              type="range" min="10" max="100"
              value={aiPassRate} onChange={(e) => setAiPassRate(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Technical Round Pass Rate</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{techPassRate}%</span>
            </div>
            <input 
              type="range" min="10" max="100"
              value={techPassRate} onChange={(e) => setTechPassRate(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>HR Culture Fit Pass Rate</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{hrPassRate}%</span>
            </div>
            <input 
              type="range" min="10" max="100"
              value={hrPassRate} onChange={(e) => setHrPassRate(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* VISUAL REPORT & FUNNEL CHART CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Pipeline Yield Output
          </h3>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" /> Initial Applicants</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{totalApplicants}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full transition-all duration-300" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-violet-500" /> Passed AI Filtering</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{passedAI}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-violet-500 h-full rounded-full transition-all duration-300" style={{ width: `${(passedAI / totalApplicants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Passed Technical Round</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{passedTech}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${(passedTech / totalApplicants) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Projected Final Offers</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{finalOffers}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${(finalOffers / totalApplicants) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-[11px] font-medium text-slate-500 leading-relaxed border border-slate-100 dark:border-slate-900/60 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>
              With an initial pool of <b>{totalApplicants}</b> profiles, your current filter configuration yields an overall recruitment conversion rate of <b className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{totalConversionRate}%</b>.
            </span>
          </div>
        </div>
      </div>

      {/* 4. NEW ADDITION: MONTHLY HISTORICAL TREND HIGH-CONTRAST BAR GRAPH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">Historical Recruitment Metrics (H1 2026)</h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 tracking-wide">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> Processed</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Selected</div>
          </div>
        </div>

        {/* Vertical Chart Node Grid Block */}
        <div className="grid grid-cols-6 items-end gap-2 pt-6 h-64 border-b border-slate-100 dark:border-slate-800/80">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex flex-col items-center space-y-3 group h-full justify-end">
              <div className="w-full flex justify-center items-end gap-1.5 px-2">
                {/* Processed total background indicator column */}
                <div 
                  className={`w-4 sm:w-6 bg-slate-100 dark:bg-slate-800 rounded-t-md group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-all duration-300 relative ${data.height}`}
                  title={`Processed: ${data.processed}`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.processed}
                  </span>
                </div>
                {/* Hired results primary indicator column */}
                <div 
                  className="w-4 sm:w-6 bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300 relative"
                  style={{ height: `${Math.max((data.accepted / data.processed) * 100, 15)}%` }}
                  title={`Offers Extended: ${data.accepted}`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-black text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.accepted}
                  </span>
                </div>
              </div>
              
              {/* Labels Footer Text Row */}
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider pt-2 border-t border-transparent group-hover:text-slate-800 dark:group-hover:text-slate-200">
                {data.month}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;