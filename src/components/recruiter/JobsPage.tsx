import { useState } from 'react';
import { Briefcase, Bot, Plus, Eye, FileText, Users, Sparkles, HelpCircle, Activity, PowerOff, AlertTriangle, X } from 'lucide-react';
import { addRecruiterJob, updateJobStatusInSupabase, type MarketplaceJob } from '../../services/recruitmentStore';

interface Props {
  jobs: MarketplaceJob[];
  setJobs: React.Dispatch<React.SetStateAction<MarketplaceJob[]>>;
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  user: any;
}

export const JobsPage = ({ jobs, setJobs, selectedJobId, setSelectedJobId, user }: Props) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State Controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);
  const [closureReason, setClosureReason] = useState<'Hired' | 'No longer needed' | 'Expired'>('Hired');

  const generateJobDescription = () => {
    setIsGenerating(true);
    const skills = jobSkills || 'React, TypeScript, REST APIs';
    const experience = jobExperience || '1-3 years';
    
    setTimeout(() => {
      setGeneratedDescription(`### Role Overview\nWe are looking for a skilled developer to build production-ready features, collaborate closely with product and design teams, and maintain clean reusable code.\n\n### Requirements\n- Experience: ${experience} of industry experience.\n- Core Stack: Mastery of ${skills}.\n\n### Preferred Qualifications\n- Strong engineering fundamentals, portfolio depth, and clear communication traits.`);
      setIsGenerating(false);
    }, 500);
  };

  const createJob = async () => {
    const title = jobTitle.trim() || 'New Role';
    const skills = jobSkills.split(',').map((s) => s.trim()).filter(Boolean);
    
    try {
      const job = await addRecruiterJob({
        title,
        description: generatedDescription || `Hiring ${title} with strong ownership and product mindset.`,
        requiredSkills: skills.length ? skills : ['Communication'],
        experienceRequired: jobExperience || '0-2 years',
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: 'As per market',
        openings: 1,
        deadline: '2026-07-30',
        status: 'Active',
        companyName: user?.recruiterProfile?.companyName || "Navin's AI Recruiting",
        companyLogo: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.recruiterProfile?.companyName || "Navin's AI")}`,
      });

      setJobs((prev) => [job, ...prev]);
      setSelectedJobId(job.id);
      setJobTitle(''); setJobSkills(''); setJobExperience(''); setGeneratedDescription('');
    } catch (error) {
      console.error(error);
    }
  };

  // Triggers when clicking the PowerOff icon button
  const handleInitiateClosure = (jobId: string, currentStatus: string) => {
    if (currentStatus === 'Closed') {
      // Direct fast re-open logic if already closed
      updateLocalAndRemoteStatus(jobId, 'Active', undefined);
    } else {
      // Open custom dialogue modal configuration for active folders
      setTargetJobId(jobId);
      setIsModalOpen(true);
    }
  };

  // Submits the payload straight to global states and Supabase storage
  const confirmJobClosure = async () => {
    if (!targetJobId) return;
    await updateLocalAndRemoteStatus(targetJobId, 'Closed', closureReason);
    setIsModalOpen(false);
    setTargetJobId(null);
  };

  const updateLocalAndRemoteStatus = async (jobId: string, targetStatus: 'Active' | 'Closed', reason?: string) => {
    try {
      // 1. Instantly update the local UI arrays state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: targetStatus, closeReason: reason } : job
        )
      );

      // 2. Persist the state mutations synchronously to Supabase
      await updateJobStatusInSupabase(jobId, targetStatus, reason);
    } catch (err) {
      console.error("Database connection failure:", err);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start animate-fade-in pb-12 relative">
      
      {/* LEFT PILLAR: MANAGEMENT & ACTION CONSOLE */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Job Posting Management</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" className="p-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
            <input value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} placeholder="Skills: React, SQL..." className="p-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
            <input value={jobExperience} onChange={(e) => setJobExperience(e.target.value)} placeholder="Experience" className="p-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={generateJobDescription} disabled={isGenerating} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition text-slate-600 dark:text-slate-400">
              <Bot className={`h-3.5 w-3.5 text-indigo-500 ${isGenerating ? 'animate-spin' : ''}`} /> 
              {isGenerating ? 'Drafting...' : 'Generate Job Description'}
            </button>
            <button onClick={createJob} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-sm transition">
              <Plus className="h-3.5 w-3.5" /> Create Job
            </button>
          </div>
        </div>

        {generatedDescription && (
          <div className="rounded-3xl border border-indigo-100/40 bg-gradient-to-b from-indigo-50/20 to-transparent p-5 dark:border-slate-800 dark:from-slate-900/40 space-y-3">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" /> AI Engine Draft Output
            </p>
            <pre className="p-4 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed shadow-inner">
              {generatedDescription}
            </pre>
          </div>
        )}
      </div>

      {/* RIGHT PILLAR: DIRECTORY WITH EXPLICIT REASON BADGES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-indigo-500" /> System Registries
          </span>
        </div>

        <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
          {jobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            const isActive = job.status === 'Active';

            return (
              <div 
                key={job.id} 
                onClick={() => setSelectedJobId(job.id)} 
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col space-y-3 shadow-sm relative overflow-hidden group ${
                  isSelected 
                    ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 transform translate-x-0.5' 
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className={`absolute top-0 left-0 h-full w-1 ${isActive ? 'bg-emerald-500' : 'bg-red-500'} ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />

                <div className="w-full flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate tracking-tight">{job.title}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                      {job.location} &bull; {job.employmentType}
                    </p>
                    {/* Publicly visible message for users detailing why the position closed */}
                    {!isActive && (job as any).closeReason && (
                      <p className="text-[10px] font-bold text-red-500 mt-1.5 italic bg-red-500/5 px-2 py-0.5 rounded-md inline-block">
                        Closed because: {(job as any).closeReason}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}>
                      {isActive ? 'Active' : 'Job Expired'}
                    </span>
                    
                    <button 
                      onClick={() => handleInitiateClosure(job.id, job.status)}
                      className={`p-1.5 rounded-md border transition-colors ${
                        isActive 
                          ? 'border-slate-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-800' 
                          : 'border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800'
                      }`}
                    >
                      <PowerOff className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="w-full grid grid-cols-5 gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <span className="flex items-center gap-0.5 truncate"><Eye className="h-3 w-3 opacity-70" /> {job.views || 0}</span>
                  <span className="flex items-center gap-0.5 truncate"><FileText className="h-3 w-3 opacity-70" /> {job.applications || 0}</span>
                  <span className="flex items-center gap-0.5 truncate"><Users className="h-3 w-3 opacity-70" /> {job.shortlisted || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CORPORATE SELECTION MODAL BACKDROP DIALOGUE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-up space-y-5 text-slate-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-extrabold text-base tracking-tight">Archive Position Lifecycle</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Flipping this position to <b>Job Expired</b> hides incoming candidate pipelines. Specify a reason to show on user indices:
            </p>

            {/* Input Selection Radios Field */}
            <div className="space-y-2">
              {[
                { id: 'Hired', label: 'Position Filled (Hired Candidate Successfully)' },
                { id: 'No longer needed', label: 'Budget/Requirement Changed (No longer needed)' },
                { id: 'Expired', label: 'Timeline Cap Out (Expired)' }
              ].map((option) => (
                <label 
                  key={option.id} 
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-xs font-bold transition ${
                    closureReason === option.id 
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="closeReason" 
                    checked={closureReason === option.id} 
                    onChange={() => setClosureReason(option.id as any)}
                    className="accent-indigo-600" 
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {/* Modal Commit Actions Footer Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={confirmJobClosure} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/10 transition">
                Confirm Expired
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobsPage;
