import { useState } from 'react';
import { atsStages, type Candidate } from '../../data/recruiter';
import { User, ChevronRight, GraduationCap, MapPin, Award, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  candidates: Candidate[];
}

export const AtsPipelinePage = ({ candidates }: Props) => {
  // Set the first stage as the default active tab view
  const [activeStage, setActiveStage] = useState<string>(atsStages[0]);

  // Filter out candidates strictly belonging to the highlighted left-hand stage
  const activeCandidates = candidates.filter((c) => c.stage === activeStage);

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start animate-fade-in min-h-[600px]">
      
      {/* LEFT CONTROL TRACK - STAGE NAVIGATION */}
      <div className="space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="px-3 py-2 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Pipeline Tracks
          </h3>
        </div>

        <div className="space-y-1">
          {atsStages.map((stage) => {
            const stageCount = candidates.filter((c) => c.stage === stage).length;
            const isSelected = activeStage === stage;

            return (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 group ${
                  isSelected
                    ? 'bg-slate-950 border-slate-950 text-white dark:bg-indigo-600 dark:border-indigo-600 shadow-md transform translate-x-1'
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-2 w-2 rounded-full shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-400 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500'
                  }`} />
                  <span className="text-sm font-bold truncate tracking-tight">{stage}</span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full transition-colors ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }`}>
                    {stageCount}
                  </span>
                  <ChevronRight className={`h-4 w-4 transition-transform opacity-40 group-hover:opacity-100 ${
                    isSelected ? 'translate-x-0.5 opacity-100' : ''
                  }`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT WORKSPACE - ACTIVE STAGE ROSTER GRID */}
      <div className="space-y-6">
        {/* Workspace Title Ribbon */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {activeStage}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showing active applicant folders currently processing in this structural gate.
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl shadow-sm">
            {activeCandidates.length} {activeCandidates.length === 1 ? 'Candidate' : 'Candidates'}
          </span>
        </div>

        {/* Dynamic Display Board */}
        {activeCandidates.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCandidates.map((c) => {
              const matchesHighBar = c.atsScore >= 80;

              return (
                <div 
                  key={c.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Card Topline Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition">
                          <User className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition" />
                        </div>
                        <h4 className="font-bold text-base text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[140px]">
                          {c.name}
                        </h4>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg tracking-wide shadow-sm inline-block ${
                          matchesHighBar 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/40' 
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/40'
                        }`}>
                          {c.atsScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Meta Core Details */}
                    <div className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <p className="text-slate-800 dark:text-slate-300 font-semibold text-sm truncate">
                        {c.careerPrediction}
                      </p>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 opacity-60 text-slate-400" />
                        <span>{c.location}</span>
                      </div>
                      {c.education && (
                        <div className="flex items-center gap-2 truncate">
                          <GraduationCap className="h-3.5 w-3.5 opacity-60 text-slate-400" />
                          <span>{c.education}</span>
                        </div>
                      )}
                    </div>

                    {/* Skill Tag Pills Row */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5">
                          +{c.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Indicator Row */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-indigo-500 opacity-80" />
                      <span className="text-slate-400 dark:text-slate-500">Resume: <b className="text-slate-700 dark:text-slate-300 font-bold">{c.resumeScore}%</b></span>
                    </div>

                    {c.interviewScore ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Evaluated
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 dark:text-slate-600 text-[11px]">
                        <Clock className="h-3.5 w-3.5 opacity-60" /> Queue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 rounded-3xl space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-300 dark:text-slate-700">
              <User className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-base text-slate-700 dark:text-slate-300">Stage Empty</h4>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
              There are currently no matching applications mapped inside the {activeStage} segment.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AtsPipelinePage;