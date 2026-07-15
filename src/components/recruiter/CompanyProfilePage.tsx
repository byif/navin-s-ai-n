import { useState } from 'react';
import { Building2, MapPin, Globe, Users, ShieldCheck, Sparkles, Plus, X, Eye, Heart, Code2, Save } from 'lucide-react';

interface RecruiterProfile {
  companyName: string;
  companyLogo: string;
  website: string;
  location: string;
  companySize: string;
  description: string;
  techStack: string[];
  cultureValues: string[];
}

interface Props {
  user: {
    recruiterProfile?: RecruiterProfile;
    email: string;
  } | null;
  onUpdateProfile?: (updatedProfile: RecruiterProfile) => void;
}

export const CompanyProfilePage = ({ user, onUpdateProfile }: Props) => {
  // Initialize with fallback mock values if user context isn't fully loaded yet
  const [name, setName] = useState(user?.recruiterProfile?.companyName || "Navin's AI Technologies");
  const [logo, setLogo] = useState(user?.recruiterProfile?.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60');
  const [website, setWebsite] = useState(user?.recruiterProfile?.website || 'https://navinsai.in');
  const [location, setLocation] = useState(user?.recruiterProfile?.location || 'Hyderabad, India');
  const [size, setSize] = useState(user?.recruiterProfile?.companySize || '51-200 employees');
  const [description, setDescription] = useState(
    user?.recruiterProfile?.description || 
    'Building next-generation full-stack software architectures and intelligence pipelines to optimize cross-functional operations.'
  );

  // High-end tag parameters arrays
  const [techStack, setTechStack] = useState<string[]>(user?.recruiterProfile?.techStack || ['React', 'TypeScript', 'Node.js', 'Supabase']);
  const [newTech, setNewTech] = useState('');
  
  const [cultureValues, setCultureValues] = useState<string[]>(user?.recruiterProfile?.cultureValues || ['Ownership Mindset', 'Radical Candor', 'Velocity Over Perfection']);
  const [newValue, setNewValue] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setSavedSuccess(false);
    
    const updatedPayload: RecruiterProfile = {
      companyName: name,
      companyLogo: logo,
      website,
      location,
      companySize: size,
      description,
      techStack,
      cultureValues
    };

    setTimeout(() => {
      if (onUpdateProfile) onUpdateProfile(updatedPayload);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  const addTechTag = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };

  const addCultureTag = () => {
    if (newValue.trim() && !cultureValues.includes(newValue.trim())) {
      setCultureValues([...cultureValues, newValue.trim()]);
      setNewValue('');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start animate-fade-in pb-12 max-w-[1400px] mx-auto">
      
      {/* LEFT PILLAR: STUDIO SETTINGS FORM EDITOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Profile Studio</h2>
          </div>
          {savedSuccess && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg animate-fade-in border border-emerald-100">
              ✓ Synced to Cloud Store
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Row 1: Brand Name & Scale */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Legal Brand Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operational Scale</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full p-3 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition">
                <option>1-10 employees</option>
                <option>11-50 employees</option>
                <option>51-200 employees</option>
                <option>201-500 employees</option>
                <option>500+ employees</option>
              </select>
            </div>
          </div>

          {/* Row 2: Digital Coordinates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HQ Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 pl-9 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Web URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full p-3 pl-9 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition" />
              </div>
            </div>
          </div>

          {/* Row 3: Logo Assets CDN Link */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logo Asset URL</label>
            <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." className="w-full p-3 text-xs font-mono rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition" />
          </div>

          {/* Row 4: Corporate Narrative Mission statement */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Value Narrative</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 text-xs font-medium rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition leading-relaxed" />
          </div>

          {/* Dynamic Interactive Chip Allocator 1: Tech Stack */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Code2 className="h-3.5 w-3.5 text-indigo-500" /> Company Core Tech Stack</label>
            <div className="flex gap-2">
              <input value={newTech} onChange={(e) => setNewTech(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTechTag()} placeholder="Add framework or language (e.g., Python)" className="flex-1 p-2.5 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              <button onClick={addTechTag} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {techStack.map(tech => (
                <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-lg">
                  {tech} <X className="h-3 w-3 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setTechStack(techStack.filter(t => t !== tech))} />
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Chip Allocator 2: Culture Values */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-rose-500" /> Cultural DNA Pillars</label>
            <div className="flex gap-2">
              <input value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCultureTag()} placeholder="Add traits (e.g., Remote First)" className="flex-1 p-2.5 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              <button onClick={addCultureTag} className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cultureValues.map(val => (
                <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 rounded-lg">
                  {val} <X className="h-3 w-3 text-slate-400 hover:text-red-500 cursor-pointer" onClick={() => setCultureValues(cultureValues.filter(v => v !== val))} />
                </span>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs tracking-wide shadow-sm shadow-indigo-600/10 transition mt-4 flex items-center justify-center gap-2">
            <Save className="h-4 w-4" /> {isSaving ? 'Synchronizing Brand Nodes...' : 'Commit Profile Schema'}
          </button>
        </div>
      </div>

      {/* RIGHT PILLAR: REAL-TIME CANDIDATE-FACING PREVIEW CARD */}
      <div className="sticky top-24 space-y-5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Eye className="h-3.5 w-3.5 text-indigo-500" /> Live Candidate Preview Deck
        </span>

        {/* Corporate Glass Card layout */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
          {/* Decorative header color strip background layout zone */}
          <div className="h-20 bg-gradient-to-r from-indigo-500 to-violet-600 relative p-4 flex items-end">
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black bg-white/20 backdrop-blur-md text-white rounded-md uppercase tracking-wider border border-white/10">
              <ShieldCheck className="h-3 w-3 text-emerald-300" /> Verified Hub
            </span>
          </div>

          {/* Main Card Data Payload Display Grid */}
          <div className="p-6 relative pt-12 space-y-5">
            {/* Logo Image Float Position frame anchor */}
            <div className="absolute -top-9 left-6 h-16 w-16 bg-white border dark:border-slate-800 dark:bg-slate-950 p-1 rounded-2xl shadow-sm overflow-hidden">
              <img src={logo} alt="" className="w-full h-full object-cover rounded-xl" onError={(e) => { (e.target as HTMLImageElement).src = "https://api.dicebear.com/8.x/initials/svg?seed=Navin's%20AI"; }} />
            </div>

            <div>
              <h3 className="font-black text-xl text-slate-800 dark:text-slate-200 tracking-tight leading-none">{name || 'Untitled Identity'}</h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-400 font-semibold mt-3">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {size}</span>
                <span className="flex items-center gap-1 text-indigo-500 hover:underline cursor-pointer"><Globe className="h-3 w-3" /> Website</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Company Mission Overview</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {description || 'No corporate description details written yet.'}
              </p>
            </div>

            {/* Candidate-facing Tech Alignment Summary view */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Ecosystem Tech</span>
              <div className="flex flex-wrap gap-1">
                {techStack.map(tech => (
                  <span key={tech} className="px-2 py-0.5 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate-facing Culture Value view */}
            <div className="space-y-2 pt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Culture Alignment Framework</span>
              <div className="flex flex-wrap gap-1">
                {cultureValues.map(val => (
                  <span key={val} className="px-2 py-0.5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">
                    ⚡ {val}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default CompanyProfilePage;
