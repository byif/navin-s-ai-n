import { useState } from 'react';
import { Search, ClipboardList, User, MapPin, Target, Award, CheckCircle2, Cpu, HelpCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { type Candidate, type RecruiterJob } from '../../data/recruiter';

interface Props {
  rankedCandidates: (Candidate & { match: number })[];
  selectedJob: RecruiterJob | undefined;
  changeStatus: (id: string, status: any) => void;
}

export const CandidatesPage = ({ rankedCandidates, selectedJob, changeStatus }: Props) => {
  const [query, setQuery] = useState('');
  const [focusedCandidateId, setFocusedCandidateId] = useState<string | null>(null);

  const filtered = rankedCandidates.filter((c) => {
    const term = query.toLowerCase();
    if (!term) return true;
    const scoreMatch = term.match(/score above (\d+)/);
    if (scoreMatch) return c.atsScore >= Number(scoreMatch[1]) || c.resumeScore >= Number(scoreMatch[1]);
    return [c.name, c.location, ...c.skills, c.careerPrediction].join(' ').toLowerCase().includes(term);
  });

  const activeCandidate = filtered.find(c => c.id === focusedCandidateId) || filtered[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start animate-fade-in pb-12 max-w-[1400px] mx-auto">
      
      {/* LEFT WING: CANDIDATE DISCOVERY DECK */}
      <div className="space-y-5">
        {/* Floating Search Omnibar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm flex items-center relative group">
          <Search className="absolute left-4 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder='Search profiles, skills, or enter "score above 85"...' 
            className="w-full pl-10 pr-4 text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none" 
          />
        </div>

        {/* Candidate Ledger Stream */}
        <div className="space-y-3 max-h-[660px] overflow-y-auto pr-1 scrollbar-thin">
          {filtered.map((c) => {
            const isFocused = activeCandidate?.id === c.id;
            const isLowScore = c.match < 50;

            // Simple, direct reasons focused on experience levels
            let reasoning = "Strong background with the required technologies and solid project experience.";
            let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
            
            if (c.match <= 35) {
              reasoning = "Lack of professional experience in this specific field or role level.";
              statusColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60";
            } else if (c.match < 70) {
              reasoning = "Slight lack of experience with some of the specific tools required for this position.";
              statusColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60";
            }

            return (
              <div 
                key={c.id} 
                onClick={() => setFocusedCandidateId(c.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm relative overflow-visible group ${
                  isFocused 
                    ? 'border-indigo-400 bg-indigo-50/10 dark:bg-indigo-950/10 transform translate-x-0.5' 
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className={`absolute top-0 left-0 h-full w-1 bg-indigo-500 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-900 transition shrink-0">
                      <User className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight">{c.name}</h4>
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">{c.careerPrediction}</p>
                      <p className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {c.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2.5 shrink-0 relative">
                    
                    {/* HOVER HOOK WRAPPER */}
                    <div className="relative group/modal">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg tracking-wide border cursor-help font-mono transition-all ${statusColor}`}>
                        {c.match}% match
                      </span>

                      {/* FLOATING HOVER CARD */}
                      <div className="pointer-events-none absolute right-0 bottom-full mb-2 w-64 p-3.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 opacity-0 translate-y-1 group-hover/modal:opacity-100 group-hover/modal:translate-y-0 transition-all duration-150 z-50 space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          <Cpu className="h-3.5 w-3.5 text-indigo-500" /> AI Score Reason
                        </div>
                        <div className="flex gap-2 text-[11px] font-medium leading-relaxed">
                          {isLowScore ? (
                            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <p>{reasoning}</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); changeStatus(c.id, 'Shortlisted'); }} 
                      className="px-3 py-1.5 text-[10px] font-bold bg-slate-950 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition shadow-sm"
                    >
                      Shortlist
                    </button>
                  </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[10px] text-slate-400 font-semibold tracking-wide">
                  <span>ATS Score: <b className="text-slate-700 dark:text-slate-300 font-bold">{c.atsScore}%</b></span>
                  <span>Resume Sync: <b className="text-slate-700 dark:text-slate-300 font-bold">{c.resumeScore}%</b></span>
                  <span className="truncate">Evaluation: <b className="text-slate-700 dark:text-slate-300 font-bold">{c.interviewScore || 'Pending'}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT WING: DEEP RADAR EVALUATION WORKSPACE */}
      <div className="sticky top-24">
        {activeCandidate ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">Candidate Intelligence insights</h3>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/30 dark:bg-indigo-950/40 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeCandidate.name}</span> applied for your open position <b>{selectedJob?.title || activeCandidate.careerPrediction}</b>. Their overall screening metrics indicate stable cross-stack alignment.
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-500" /> Stack Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900/80">
                {activeCandidate.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md shadow-2xl">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-500" /> Evaluation Performance Matrix
              </h4>
              
              <div className="space-y-3.5">
                {[
                  { label: 'Technical Core Metric', score: activeCandidate.technicalScore || activeCandidate.atsScore },
                  { label: 'Confidence Score', score: activeCandidate.confidenceScore || 78 },
                  { label: 'Communication Competency', score: activeCandidate.communicationScore || 82 }
                ].map((metric) => (
                  <div key={metric.label} className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-tight">
                      <span className="text-slate-500 dark:text-slate-400">{metric.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{metric.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${metric.score}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-indigo-500 opacity-80" /> Verified CV Index</span>
              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Checked Sync</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            Select an applicant folder row to load comprehensive AI diagnostics.
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidatesPage;