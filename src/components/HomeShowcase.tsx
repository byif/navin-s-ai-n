import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  Cloud,
  FileSearch,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
  Workflow,
} from 'lucide-react';

const features = [
  {
    eyebrow: 'Resume creation',
    title: 'Resume Studio',
    description: 'Create ATS-friendly resumes using professional templates and AI-powered writing assistance.',
    highlights: ['Resume Builder', 'Live Preview', 'Resume Versions', 'AI Suggestions', 'PDF Download'],
    button: 'Build Resume',
    path: '/resumebuilder',
    icon: FileText,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    eyebrow: 'Resume intelligence',
    title: 'Resume Analyzer',
    description: 'Analyze resumes instantly with ATS scoring, keyword detection, formatting checks, and improvement suggestions.',
    highlights: ['ATS Score', 'Resume Score', 'AI Analysis', 'Skill Gap Detection', 'Resume Improvement'],
    button: 'Analyze Resume',
    path: '/resume',
    icon: FileSearch,
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    eyebrow: 'AI chatbot',
    title: 'AI Chatbot',
    description: 'Chat with the career assistant for resume help, interview tips, learning guidance, and next-step advice.',
    highlights: ['Resume Help', 'Career Advice', 'Interview Tips', 'Learning Guidance'],
    button: 'Open Chatbot',
    path: '/chatbot',
    icon: Bot,
    accent: 'from-cyan-500 to-blue-500',
  },
];

const reasons = [
  { title: 'AI Powered', detail: 'Career insights, matching, and guidance driven by intelligent workflows.', icon: Sparkles },
  { title: 'ATS Friendly', detail: 'Resume tools designed for readability, structure, and recruiter systems.', icon: ShieldCheck },
  { title: 'Real-time Notifications', detail: 'Stay aware of applications, updates, and recruiter actions.', icon: BellRing },
  { title: 'Interview Intelligence', detail: 'Practice with feedback for confidence, clarity, and presence.', icon: Video },
  { title: 'Role-Based Platform', detail: 'Purpose-built journeys for students, recruiters, and admins.', icon: Users },
  { title: 'Cloud Storage', detail: 'Keep profiles, resumes, and applications connected securely.', icon: Cloud },
  { title: 'Recruiter ATS', detail: 'Manage candidates, rankings, job posts, and hiring analytics.', icon: BarChart3 },
  { title: 'Career Guidance', detail: 'Move from uncertainty to a focused roadmap and next actions.', icon: GraduationCap },
];

const stats = [
  { value: 10000, suffix: '+', label: 'Resumes Created' },
  { value: 250, suffix: '+', label: 'Career Resources' },
  { value: 95, suffix: '%', label: 'ATS Accuracy' },
  { value: 500, suffix: '+', label: 'Jobs Posted' },
  { value: 1000, suffix: '+', label: 'Students Guided' },
];

const seekerSteps = ['Create Profile', 'Build Resume', 'Analyze Resume', 'Find Jobs', 'Apply', 'Interview', 'Get Hired'];
const recruiterSteps = ['Create Company', 'Post Job', 'Receive Applications', 'AI Ranking', 'Interview', 'Hire'];

const momentumCards = [
  {
    title: 'Resume Clarity',
    detail: 'Turn scattered achievements into a structured, recruiter-friendly profile with stronger sections and cleaner wording.',
    metric: '01',
  },
  {
    title: 'Skill Direction',
    detail: 'See which skills matter for your next role, then use recommendations to decide what to learn first.',
    metric: '02',
  },
  {
    title: 'Interview Confidence',
    detail: 'Prepare answers, refine communication, and walk into interviews with a clearer sense of your story.',
    metric: '03',
  },
  {
    title: 'Action Plan',
    detail: 'Move from analysis to action with a simple next-step flow for resumes, learning, applications, and preparation.',
    metric: '04',
  },
];

const technologies = ['React', 'TypeScript', 'Supabase', 'FastAPI', 'Python', 'Machine Learning', 'Hugging Face', 'AI Powered'];

const useCountUp = (target: number) => {
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setActive(true);
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    let frame = 0;
    const totalFrames = 56;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setValue(Math.round(target * progress));
      if (frame >= totalFrames) window.clearInterval(timer);
    }, 24);

    return () => window.clearInterval(timer);
  }, [active, target]);

  return { ref, value };
};

const HomeShowcase = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-950 text-white">
      <section className="border-y border-white/10 bg-slate-950 py-20" id="platform">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Platform overview"
            title="Build, analyze, and improve with AI support."
            description="Navin's AI keeps the overview focused on the three core tools: Resume Studio, Resume Analyzer, and the AI Chatbot."
          />

          <CoreModules onNavigate={(path) => navigate(path)} />
        </div>
      </section>

      <section className="bg-slate-900/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Why Navin's AI?"
            title="Professional tools for every step of the career journey."
            description="Designed to help candidates become more employable and recruiters move faster with clearer signals."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.07] hover:shadow-[0_22px_70px_-34px_rgba(99,102,241,0.7)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200 transition group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950 py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      </section>

      <section className="bg-slate-900/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Process timeline"
            title="A clear path for candidates and recruiters."
            description="Two focused journeys, connected by intelligent resumes, applications, interviews, and hiring signals."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Timeline title="Job Seeker" steps={seekerSteps} icon={Target} />
            <Timeline title="Recruiter" steps={recruiterSteps} icon={Workflow} />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="Career momentum"
            title="Small improvements that make your profile feel ready."
            description="Instead of generic stories, this section highlights the practical outcomes Navin's AI is designed to create."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {momentumCards.map((card) => (
              <div key={card.title} className="group rounded-[26px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.9)] transition hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.065]">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">{card.metric}</span>
                <h3 className="mt-5 text-xl font-black tracking-tight">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{card.detail}</p>
                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-300 group-hover:w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">Featured technologies</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Modern stack. Practical AI.</h2>
            </div>
            <div className="flex max-w-3xl flex-wrap gap-3">
              {technologies.map((technology) => (
                <span key={technology} className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-bold text-slate-200">
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-indigo-600 via-slate-900 to-slate-950 p-8 shadow-[0_28px_90px_-40px_rgba(99,102,241,0.8)] sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-indigo-100">
                <Sparkles className="h-4 w-4" /> Ready to Build Your Career?
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Turn your profile into a career-ready signal.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-indigo-100/80">
                Start with a polished resume, discover the right direction, and move into interviews with confidence.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button type="button" onClick={() => navigate('/resumebuilder')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-100">
                Start Building Resume <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => navigate('/careers')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/15">
                Explore Career Paths
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <div className="mx-auto max-w-3xl text-center">
    <p className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">
      <Sparkles className="h-3.5 w-3.5" /> {eyebrow}
    </p>
    <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">{description}</p>
  </div>
);

const CoreModules = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [primary, secondary, tertiary] = features;

  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <ModuleCard feature={primary} featured onNavigate={onNavigate} />
      <div className="grid gap-5">
        <ModuleCard feature={secondary} onNavigate={onNavigate} />
        <ModuleCard feature={tertiary} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

const ModuleCard = ({
  feature,
  featured,
  onNavigate,
}: {
  feature: (typeof features)[number];
  featured?: boolean;
  onNavigate: (path: string) => void;
}) => {
  const Icon = feature.icon;

  return (
    <article className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.95)] transition duration-300 hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.065] ${featured ? 'min-h-[560px] sm:p-8' : 'min-h-[270px]'}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accent}`} />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-400/15" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">{feature.eyebrow}</p>
            <h3 className={`${featured ? 'mt-4 text-4xl sm:text-5xl' : 'mt-3 text-2xl'} font-black tracking-tight`}>{feature.title}</h3>
          </div>
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-black/20`}>
            <Icon className="h-6 w-6" />
          </span>
        </div>

        <p className={`${featured ? 'mt-6 max-w-xl text-lg leading-8' : 'mt-4 text-sm leading-6'} text-slate-400`}>{feature.description}</p>

        {featured && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {feature.highlights.slice(0, 4).map((highlight) => (
                <span key={highlight} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-slate-200">
                  {highlight}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-white p-4 text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Workspace focus</p>
              <p className="mt-2 text-sm font-semibold leading-6">Write, preview, refine, and export a professional resume without leaving the flow.</p>
            </div>
          </div>
        )}

        {!featured && (
          <div className="mt-5 flex flex-wrap gap-2">
            {feature.highlights.slice(0, 4).map((highlight) => (
              <span key={highlight} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-bold text-slate-300">
                {highlight}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onNavigate(feature.path)}
          className={`mt-auto inline-flex w-fit items-center gap-2 rounded-xl ${featured ? 'bg-white text-slate-950 hover:bg-indigo-100' : 'border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]'} px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5`}
        >
          {feature.button} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
};

const StatCard = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const { ref, value: current } = useCountUp(value);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-center">
      <p className="text-3xl font-black tracking-tight sm:text-4xl">{current.toLocaleString()}{suffix}</p>
      <p className="mt-2 text-sm font-semibold text-slate-400">{label}</p>
    </div>
  );
};

const Timeline = ({ title, steps, icon: Icon }: { title: string; steps: string[]; icon: typeof Target }) => (
  <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-6">
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-200">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-black">{title}</h3>
    </div>
    <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step} className="flex shrink-0 items-center gap-3">
          <div className="w-36 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
            <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-xs font-black">{index + 1}</span>
            <p className="mt-3 text-sm font-bold text-slate-200">{step}</p>
          </div>
          {index < steps.length - 1 && <ArrowRight className="h-5 w-5 text-slate-600" />}
        </div>
      ))}
    </div>
  </div>
);

export default HomeShowcase;
