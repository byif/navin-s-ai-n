import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  FileSearch,
  FileText,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';

console.log('Supabase Connected', supabase);

const journey = [
  { label: 'Analyze your resume', detail: 'Get ATS insights and skill gaps', icon: FileSearch, path: '/resume' },
  { label: 'Explore career paths', detail: 'Discover roles that match your profile', icon: Briefcase, path: '/careers' },
  { label: 'Practice interviews', detail: 'Build confidence with live feedback', icon: Video, path: '/interview' },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(79,70,229,0.26),transparent_34%),radial-gradient(circle_at_75%_18%,rgba(14,165,233,0.16),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <div className="animate-[fadeInUp_0.8s_ease-out]">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-white/[0.06] px-4 py-2 text-sm font-bold text-indigo-100 shadow-lg shadow-indigo-950/20 backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-200" />
            AI career operating system for students and recruiters
          </div>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Build a career plan that moves with you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Navin's AI helps you build resumes, analyze skill gaps, discover roles, prepare for interviews, and connect with hiring workflows from one premium workspace.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/resume')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:bg-indigo-100"
            >
              Analyze my resume <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/resumebuilder')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 font-bold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-300/40 hover:bg-white/[0.1]"
            >
              <FileText className="h-4 w-4" /> Build a resume
            </button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-300">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Personalized guidance</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> ATS-ready workflow</span>
            <span className="flex items-center gap-2"><Bot className="h-4 w-4 text-emerald-400" /> AI advisor support</span>
          </div>
        </div>

        <div className="animate-[fadeInUp_1s_ease-out] rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_-44px_rgba(79,70,229,0.75)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Recommended next steps</p>
              <h2 className="mt-1 text-xl font-black">Your career journey</h2>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Live</span>
          </div>

          <div className="mt-4 space-y-3">
            {journey.map(({ label, detail, icon: Icon, path }, index) => (
              <button
                type="button"
                key={label}
                onClick={() => navigate(path)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-300/30 hover:bg-slate-900/90"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-slate-100">{index + 1}. {label}</span>
                  <span className="mt-0.5 block text-sm text-slate-400">{detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-300" />
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {['Resume', 'Skills', 'Interview'].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-center">
                <p className="text-xl font-black">{[92, 78, 86][index]}%</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
