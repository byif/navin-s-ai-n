import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Briefcase, User, Activity, ArrowRight, Code, Home } from 'lucide-react';
import { readStore, type JobApplication, type MarketplaceJob } from '../services/recruitmentStore';

interface SearchResult {
  label: string;
  sublabel: string;
  type: 'Candidate' | 'Job Opening' | 'Skill Segment' | 'Platform view';
  url: string;
  icon: any;
}

export const GlobalSearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [liveJobs, setLiveJobs] = useState<MarketplaceJob[]>([]);
  const [liveApps, setLiveApps] = useState<JobApplication[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hook into your live core data registry system on mount
  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const store = await readStore();
        setLiveJobs(store?.jobs || []);
        setLiveApps(store?.applications || []);
      } catch (err) {
        console.error("Failed to sync search memory buffer registries", err);
      }
    };
    fetchPlatformData();
  }, [searchQuery]);

  // Close dropdown when focus handles move outside component bounds
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safe multi-dimensional search filtering logic
  const getFilteredResults = (): SearchResult[] => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results: SearchResult[] = [];

    // Category A: Match Live Core System Routes
    const structuralViews = [
      { label: 'Overview Console', sublabel: 'System metrics & summaries', url: '/recruiter?section=overview', icon: Home },
      { label: 'Active Jobs Hub', sublabel: 'Postings & requirements structural deck', url: '/recruiter?section=jobs', icon: Briefcase },
      { label: 'Talent Discovery Pool', sublabel: 'Ranked scores & candidate ledger tracking', url: '/recruiter?section=candidates', icon: User },
      { label: 'Yield Pipeline Analytics', sublabel: 'Funnel conversion parameter modules', url: '/recruiter?section=analytics', icon: Activity },
    ];
    
    structuralViews.forEach(view => {
      if (view.label.toLowerCase().includes(cleanQuery) || view.sublabel.toLowerCase().includes(cleanQuery)) {
        results.push({ ...view, type: 'Platform view' });
      }
    });

    // Category B: Safe Check Applicant Records
    if (Array.isArray(liveApps)) {
      liveApps.forEach(app => {
        const candidateName = app?.candidateName || '';
        const candidateEmail = app?.candidateEmail || '';
        
        if (candidateName.toLowerCase().includes(cleanQuery) || candidateEmail.toLowerCase().includes(cleanQuery)) {
          results.push({
            label: candidateName || 'Untitled Applicant',
            sublabel: `Applicant • ${candidateEmail || 'No Email Registered'}`,
            type: 'Candidate',
            url: '/recruiter?section=candidates',
            icon: User
          });
        }
      });
    }

    // Category C: Safe Check Available Job Postings
    if (Array.isArray(liveJobs)) {
      liveJobs.forEach(job => {
        const title = job?.title || '';
        const companyName = job?.companyName || "Navin's AI";
        const location = job?.location || 'Remote';
        const requiredSkills = Array.isArray(job?.requiredSkills) ? job.requiredSkills : [];

        const matchesTitle = title.toLowerCase().includes(cleanQuery);
        const matchesSkills = requiredSkills.some(s => typeof s === 'string' && s.toLowerCase().includes(cleanQuery));
        
        if (matchesTitle) {
          results.push({
            label: title,
            sublabel: `${companyName} • ${location}`,
            type: 'Job Opening',
            url: '/recruiter?section=jobs',
            icon: Briefcase
          });
        } else if (matchesSkills) {
          results.push({
            label: `Skill Segment: ${cleanQuery}`,
            sublabel: `Required for role: ${title}`,
            type: 'Skill Segment',
            url: '/recruiter?section=candidates',
            icon: Code
          });
        }
      });
    }

    return results.slice(0, 6); // Cap at top 6 highly-relevant results
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="w-full relative flex flex-col" ref={dropdownRef}>
      <div className="w-full relative group flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search applicants, profiles, active jobs, skill tags..." 
          className="w-full pl-10 pr-12 py-1.5 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200 dark:focus:bg-slate-950 dark:focus:border-indigo-500 transition-all shadow-inner"
        />
        <div className="absolute right-3 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-bold rounded-md border border-slate-300/40 dark:border-slate-700/60 pointer-events-none select-none font-mono">
          <Command className="h-2.5 w-2.5" />K
        </div>
      </div>

      {/* DYNAMIC SYSTEM RESULT PORTAL */}
      {isDropdownOpen && filteredResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="p-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
            Real-time Database Matches
          </div>
          <div className="p-1.5 space-y-0.5">
            {filteredResults.map((result, idx) => {
              const ResultIcon = result.icon || Search;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    navigate(result.url);
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:bg-white dark:group-hover:bg-slate-950 transition shrink-0">
                      <ResultIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate tracking-tight">
                        {result.label}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                        {result.sublabel}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/60 rounded-md uppercase tracking-wider flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                    {result.type} <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
