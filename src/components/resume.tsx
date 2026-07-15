import { useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  FileText,
  Layers,
  Lightbulb,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  UploadCloud,
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface CareerMatch {
  career: string;
  confidence: number;
  matched_skills: string[];
}

interface SectionCheck {
  name: string;
  found: boolean;
  points: number;
}

interface LearningResourceRecommendation {
  skill: string;
  resource_name: string;
  description: string;
  link: string;
  estimated_time: string;
}

interface ResumeAnalysis {
  predicted_career: string;
  career_matches: CareerMatch[];
  score: number;
  sections: SectionCheck[];
  suggestions: string[];
  word_count: number;
  targeted_analysis?: boolean;
  target_role?: string;
  required_skills?: string[];
  resume_skills?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  recommended_skills?: string[];
  match_score?: number;
  skill_gap_score?: number;
  targeted_match_score?: number;
  skill_gaps?: string[];
  learning_resources?: LearningResourceRecommendation[];
}

const clampPercent = (value = 0) => Math.min(100, Math.max(0, Math.round(value)));

const SkillChip = ({
  skill,
  tone,
}: {
  skill: string;
  tone: 'green' | 'red' | 'blue' | 'slate';
}) => {
  const styles = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    red: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    blue: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300',
    slate: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[tone]}`}>{skill}</span>;
};

const ProgressBar = ({ label, value, tone }: { label: string; value: number; tone: 'indigo' | 'rose' }) => {
  const safeValue = clampPercent(value);
  const fill = tone === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500';

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${fill} transition-all duration-1000 ease-out`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};

const ScoreRing = ({ value, label }: { value: number; label: string }) => {
  const safeValue = clampPercent(value);

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid h-32 w-32 place-items-center rounded-full"
        style={{ background: `conic-gradient(rgb(99 102 241) ${safeValue * 3.6}deg, rgb(226 232 240) 0deg)` }}
      >
        <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white text-center dark:bg-slate-900">
          <div>
            <p className="text-3xl font-black text-slate-950 dark:text-white">{safeValue}%</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Resume = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const analyzeResume = async () => {
    if (!file) {
      setError('Choose a PDF resume before starting the analysis.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobTitle.trim()) formData.append('job_title', jobTitle.trim());
    if (jobDescription.trim()) formData.append('job_description', jobDescription.trim());

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || 'Resume analysis failed.');
      setAnalysis(data);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not connect to the analyzer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
                <Sparkles className="h-4 w-4" /> AI Resume Intelligence
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Turn your resume into a stronger career signal.</h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Upload your PDF to receive an explainable resume score, role recommendations, matched skills, and focused improvement steps.
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /> PDF validation and readable-text checks</span>
              <span className="flex items-center gap-3"><FileSearch className="h-5 w-5 text-indigo-300" /> Role matching with explainable evidence</span>
              <span className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-amber-300" /> Actionable recommendations</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div
            className="cursor-pointer rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setError('');
              }}
            />
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <UploadCloud className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold">{file ? file.name : 'Drop in your resume PDF'}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {file ? `${(file.size / 1024).toFixed(0)} KB selected` : 'Click here to select a readable PDF resume.'}
            </p>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Briefcase className="h-4 w-4 text-indigo-500" />
                Job Title <span className="text-xs font-medium italic text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Junior Frontend Developer"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Layers className="h-4 w-4 text-indigo-500" />
                Job Description <span className="text-xs font-medium italic text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste role requirements for intelligent skill gap analysis."
                className="min-h-[46px] max-h-[160px] resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0" /> {error}
            </div>
          )}

          <button
            type="button"
            onClick={analyzeResume}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {loading ? 'Analyzing your resume...' : 'Analyze resume'}
          </button>
        </section>

        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </div>
  );
};

const AnalysisResults = ({ analysis }: { analysis: ResumeAnalysis }) => {
  const hasTargetedAnalysis = Boolean(analysis.targeted_analysis);

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Resume score</p>
          <div className="mt-5 flex items-center gap-5">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-indigo-100 bg-indigo-50 text-3xl font-bold text-indigo-700 dark:border-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-200">
              {analysis.score}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{analysis.score >= 80 ? 'Strong foundation' : analysis.score >= 60 ? 'Good start' : 'Ready to improve'}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{analysis.word_count} words analyzed across your resume.</p>
            </div>
          </div>
        </div>

        {hasTargetedAnalysis && <SkillGapPanel analysis={analysis} />}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-bold">Resume completeness</h2>
          <div className="mt-4 space-y-3">
            {analysis.sections.map((section) => (
              <div key={section.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {section.found ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                  {section.name}
                </span>
                <span className="text-slate-400">{section.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Best-fit career path</p>
          <h2 className="mt-2 text-3xl font-bold">{analysis.predicted_career}</h2>
          <div className="mt-5 space-y-3">
            {analysis.career_matches.map((match) => (
              <div key={match.career} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{match.career}</h3>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{match.confidence}% match</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.matched_skills.map((skill) => <SkillChip key={skill} skill={skill} tone="slate" />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
          <h2 className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100"><Lightbulb className="h-5 w-5" /> Recommended improvements</h2>
          <div className="mt-4 space-y-3">
            {analysis.suggestions.length ? analysis.suggestions.map((suggestion) => (
              <p key={suggestion} className="flex gap-2 text-sm leading-6 text-amber-900 dark:text-amber-200"><ArrowRight className="mt-1 h-4 w-4 shrink-0" /> {suggestion}</p>
            )) : (
              <p className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200"><FileText className="h-4 w-4" /> Your resume includes the core sections. Keep achievements measurable and role-specific.</p>
            )}
          </div>
        </div>

        {hasTargetedAnalysis && <LearningResources resources={analysis.learning_resources ?? []} />}
      </div>
    </section>
  );
};

const SkillGapPanel = ({ analysis }: { analysis: ResumeAnalysis }) => {
  const matchScore = clampPercent(analysis.match_score ?? analysis.targeted_match_score ?? 0);
  const gapScore = clampPercent(analysis.skill_gap_score ?? 100 - matchScore);
  const matchedSkills = analysis.matched_skills ?? [];
  const missingSkills = analysis.missing_skills ?? analysis.skill_gaps ?? [];
  const recommendedSkills = analysis.recommended_skills ?? missingSkills;
  const requiredSkills = analysis.required_skills ?? [];

  return (
    <div className="animate-[fadeInUp_0.7s_ease-out] rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
            <Target className="h-4 w-4" /> Intelligent skill gap
          </p>
          <h2 className="mt-2 text-2xl font-bold">{analysis.target_role ?? 'Target Role'}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{requiredSkills.length} target skills compared with your resume.</p>
        </div>
        <ScoreRing value={matchScore} label="Match" />
      </div>

      <div className="mt-6 grid gap-4">
        <ProgressBar label="Overall match" value={matchScore} tone="indigo" />
        <ProgressBar label="Skill gap" value={gapScore} tone="rose" />
      </div>

      <div className="mt-6 grid gap-4">
        <SkillGroup title="Matched skills" skills={matchedSkills} tone="green" emptyText="No direct matches found yet." />
        <SkillGroup title="Missing skills" skills={missingSkills} tone="red" emptyText="No missing skills detected from this job input." />
        <SkillGroup title="Recommended skills" skills={recommendedSkills} tone="blue" emptyText="Add a job description to unlock recommendations." />
      </div>
    </div>
  );
};

const SkillGroup = ({
  title,
  skills,
  tone,
  emptyText,
}: {
  title: string;
  skills: string[];
  tone: 'green' | 'red' | 'blue';
  emptyText: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
    <h3 className="text-sm font-bold">{title}</h3>
    <div className="mt-3 flex flex-wrap gap-2">
      {skills.length ? skills.map((skill) => <SkillChip key={`${title}-${skill}`} skill={skill} tone={tone} />) : <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>}
    </div>
  </div>
);

const LearningResources = ({ resources }: { resources: LearningResourceRecommendation[] }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
      <BookOpen className="h-4 w-4" /> Learning resources
    </p>
    <div className="mt-5 grid gap-3">
      {resources.length ? resources.map((resource) => (
        <a
          key={`${resource.skill}-${resource.resource_name}`}
          href={resource.link}
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-700"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">{resource.skill}</span>
              <h3 className="mt-3 font-bold text-slate-950 dark:text-white">{resource.resource_name}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{resource.description}</p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-500" />
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            <Timer className="h-3.5 w-3.5" /> {resource.estimated_time}
          </p>
        </a>
      )) : (
        <div className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          No missing skills were detected, so no extra learning resources are needed for this target.
        </div>
      )}
    </div>
  </div>
);

export default Resume;
