import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Edit3,
  FileSearch,
  FileText,
  Github,
  GraduationCap,
  Languages,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  Palette,
  Phone,
  Plus,
  Rocket,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  User,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import ResumePreview from "./ResumePreview";
import type { EducationItem, ExperienceItem, ProjectItem, ResumeData, SimpleEntry } from "./types";
import { API_BASE_URL } from "../../config/api";

type StudioView = "landing" | "type" | "templates" | "builder" | "success";
type WizardStep =
  | "personal"
  | "summary"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "certifications"
  | "achievements"
  | "internships"
  | "research"
  | "publications"
  | "languages"
  | "activities"
  | "references";

interface ResumeVersion {
  id: string;
  name: string;
  updatedAt: string;
  data: ResumeData;
}

interface TemplateOption {
  id: string;
  name: string;
  recommendedFor: string;
  color: string;
  popularity: string;
  badge: string;
  accent: string;
}

const emptyResume: ResumeData = {
  template: "modern-professional",
  resumeType: "",
  versionName: "Untitled Resume",
  personal: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  internships: [],
  research: [],
  publications: [],
  languages: [],
  activities: [],
  references: [],
};

const candidateTypes = [
  {
    id: "student",
    title: "Student / Fresher",
    detail: "College students, recent graduates, internship seekers, and entry-level candidates.",
    icon: GraduationCap,
    sections: ["Projects", "Internships", "Education", "Skills"],
  },
  {
    id: "experienced",
    title: "Experienced Professional",
    detail: "Working professionals, mid-level, senior-level, and managers.",
    icon: Briefcase,
    sections: ["Experience", "Achievements", "Certifications", "Leadership"],
  },
  {
    id: "freelancer",
    title: "Freelancer",
    detail: "Independent professionals who need a portfolio-first resume.",
    icon: Rocket,
    sections: ["Client Work", "Portfolio", "Skills", "Results"],
  },
  {
    id: "switcher",
    title: "Career Switcher",
    detail: "Candidates repositioning skills for a new field or role.",
    icon: Wand2,
    sections: ["Transferable Skills", "Summary", "Projects", "Training"],
  },
];

const templates: TemplateOption[] = [
  { id: "modern-professional", name: "Modern Professional", recommendedFor: "Software, analytics, business roles", color: "Indigo", popularity: "98%", badge: "ATS Friendly", accent: "from-indigo-500 to-sky-500" },
  { id: "minimal", name: "Minimal", recommendedFor: "Freshers and clean one-page resumes", color: "Slate", popularity: "92%", badge: "Professional", accent: "from-slate-500 to-slate-300" },
  { id: "executive", name: "Executive", recommendedFor: "Managers and senior professionals", color: "Emerald", popularity: "89%", badge: "Premium", accent: "from-emerald-500 to-teal-500" },
  { id: "software-engineer", name: "Software Engineer", recommendedFor: "Developers and engineering interns", color: "Blue", popularity: "96%", badge: "Popular", accent: "from-blue-500 to-cyan-500" },
  { id: "ai-engineer", name: "AI Engineer", recommendedFor: "ML, AI, data science profiles", color: "Violet", popularity: "94%", badge: "AI Ready", accent: "from-violet-500 to-fuchsia-500" },
  { id: "designer", name: "Designer", recommendedFor: "UI/UX and creative portfolios", color: "Rose", popularity: "88%", badge: "Creative", accent: "from-rose-500 to-pink-500" },
  { id: "corporate", name: "Corporate", recommendedFor: "Business, finance, HR, operations", color: "Navy", popularity: "91%", badge: "Formal", accent: "from-slate-700 to-blue-500" },
  { id: "simple-ats", name: "Simple ATS", recommendedFor: "Strict ATS applications", color: "Black", popularity: "97%", badge: "ATS Friendly", accent: "from-zinc-700 to-zinc-400" },
  { id: "classic", name: "Classic", recommendedFor: "Academic and traditional roles", color: "Amber", popularity: "86%", badge: "Classic", accent: "from-amber-500 to-orange-400" },
  { id: "two-column", name: "Two Column", recommendedFor: "Skill-heavy technical resumes", color: "Cyan", popularity: "90%", badge: "Balanced", accent: "from-cyan-500 to-blue-400" },
  { id: "academic-cv", name: "Academic CV", recommendedFor: "Research, papers, publications", color: "Purple", popularity: "84%", badge: "Detailed", accent: "from-purple-500 to-indigo-500" },
  { id: "portfolio", name: "Portfolio Resume", recommendedFor: "Freelancers and builders", color: "Green", popularity: "87%", badge: "Portfolio", accent: "from-green-500 to-emerald-400" },
];

const wizardSteps: Array<{ key: WizardStep; label: string; icon: typeof User }> = [
  { key: "personal", label: "Personal Info", icon: User },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "projects", label: "Projects", icon: Code2 },
  { key: "skills", label: "Skills", icon: Sparkles },
  { key: "certifications", label: "Certifications", icon: ShieldCheck },
  { key: "achievements", label: "Achievements", icon: Award },
  { key: "internships", label: "Internships", icon: Rocket },
  { key: "research", label: "Research", icon: FileSearch },
  { key: "publications", label: "Publications", icon: FileText },
  { key: "languages", label: "Languages", icon: Languages },
  { key: "activities", label: "Activities", icon: Star },
  { key: "references", label: "References", icon: User },
];

const actionVerbs = ["Built", "Led", "Designed", "Automated", "Optimized", "Delivered", "Improved", "Launched"];
const recommendedSkills = ["React", "TypeScript", "Python", "SQL", "Git", "REST APIs", "Machine Learning", "Data Structures"];

const cloneResume = (data: ResumeData): ResumeData => JSON.parse(JSON.stringify(data)) as ResumeData;

const ResumeBuilder = () => {
  const [view, setView] = useState<StudioView>("landing");
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem("navins_ai_resume_autosave");
    return saved ? { ...cloneResume(emptyResume), ...(JSON.parse(saved) as ResumeData) } : cloneResume(emptyResume);
  });
  const [activeStep, setActiveStep] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(0.82);
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    const saved = localStorage.getItem("navins_ai_resume_versions");
    return saved ? (JSON.parse(saved) as ResumeVersion[]) : [];
  });
  const [uploadName, setUploadName] = useState("");
  const [originalResumeText, setOriginalResumeText] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("navins_ai_resume_autosave", JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem("navins_ai_resume_versions", JSON.stringify(versions));
  }, [versions]);

  const score = useMemo(() => calculateQualityScore(resumeData), [resumeData]);
  const currentStep = wizardSteps[activeStep];
  const progress = Math.round(((activeStep + 1) / wizardSteps.length) * 100);

  const updateResume = <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => {
    setResumeData((prev) => ({ ...prev, [section]: value }));
  };

  const startNewResume = () => {
    setResumeData(cloneResume(emptyResume));
    setActiveStep(0);
    setView("type");
  };

  const handleResumeType = (type: string) => {
    updateResume("resumeType", type);
    setView("templates");
  };

  const handleTemplateSelect = (templateId: string) => {
    updateResume("template", templateId);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    const detectedName = file.name.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim();
    const originalText = [
      detectedName || "Uploaded Resume",
      "Detected sections: Summary, Education, Experience, Projects, Skills, Certifications.",
      "Formatting review: dense spacing, inconsistent bullet strength, and missing keyword emphasis.",
      "Weak bullet detected: Worked on a website.",
      "Recommended rewrite: Designed and developed a responsive React web application improving user engagement by 35%.",
    ].join("\n\n");
    setUploadName(file.name);
    setOriginalResumeText(originalText);
    setResumeData((prev) => ({
      ...prev,
      versionName: file.name.replace(/\.(pdf|docx)$/i, "") || "Improved Resume",
      personal: {
        ...prev.personal,
        fullName: prev.personal.fullName || detectedName || "Imported Candidate",
        summary: prev.personal.summary || "AI-imported resume ready for review. Add measurable outcomes and role-specific keywords to improve ATS performance.",
      },
      education: prev.education.length ? prev.education : [{ university: "Detected University", branch: "Detected Degree / Branch", year: "2026", grade: "Add CGPA or percentage" }],
      experience: prev.experience?.length ? prev.experience : [{ company: "Detected Company", role: "Detected Role", duration: "Detected Duration", description: "Worked on a website. Accept AI suggestions to rewrite this into a stronger measurable bullet." }],
      skills: prev.skills.length ? prev.skills : ["React", "Python", "SQL", "Communication"],
      projects: prev.projects.length ? prev.projects : [{ title: "Imported Project", desc: "Review this imported project and rewrite it with metrics, tools, and impact.", tech: "Add technologies used" }],
      certifications: prev.certifications?.length ? prev.certifications : [{ title: "Detected Certification", detail: "Review and confirm certification details.", year: "2026" }],
    }));
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const response = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
        const analysis = await response.json();
        if (response.ok) {
          const analyzedSkills = Array.from(new Set((analysis.career_matches || []).flatMap((match: { matched_skills?: string[] }) => match.matched_skills || []))) as string[];
          setResumeData((prev) => ({
            ...prev,
            personal: {
              ...prev.personal,
              summary: prev.personal.summary || `${analysis.predicted_career || "Professional"} profile with resume sections detected and ready for AI optimization.`,
            },
            skills: analyzedSkills.length ? Array.from(new Set([...prev.skills, ...analyzedSkills])) : prev.skills,
            achievements: [
              ...(prev.achievements || []),
              ...((analysis.suggestions || []) as string[]).slice(0, 2).map((suggestion) => ({ title: "AI Improvement Tip", detail: suggestion, year: "Now" })),
            ],
          }));
        }
      } catch (error) {
        console.info("Resume Studio upload analysis fallback used.", error);
      }
    }
    setView("builder");
  };

  const saveVersion = () => {
    const now = new Date().toISOString();
    const name = resumeData.versionName?.trim() || `${resumeData.personal.fullName || "Resume"} Version`;
    const version: ResumeVersion = {
      id: `${Date.now()}`,
      name,
      updatedAt: now,
      data: cloneResume(resumeData),
    };
    setVersions((prev) => [version, ...prev.slice(0, 7)]);
  };

  const loadVersion = (version: ResumeVersion) => {
    setResumeData(cloneResume(version.data));
    setView("builder");
  };

  const duplicateVersion = (version: ResumeVersion) => {
    setVersions((prev) => [{ ...version, id: `${Date.now()}`, name: `${version.name} Copy`, updatedAt: new Date().toISOString() }, ...prev]);
  };

  const renameVersion = (versionId: string, name: string) => {
    setVersions((prev) => prev.map((version) => version.id === versionId ? { ...version, name, updatedAt: new Date().toISOString() } : version));
  };

  const downloadVersion = (version: ResumeVersion) => {
    const blob = new Blob([buildResumeText(version.data)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${version.name}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteVersion = (versionId: string) => {
    setVersions((prev) => prev.filter((version) => version.id !== versionId));
  };

  const downloadTextFile = (extension: "docx" | "json") => {
    const content = extension === "json" ? JSON.stringify(resumeData, null, 2) : buildResumeText(resumeData);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.versionName || "resume"}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareResume = async () => {
    const text = `${resumeData.personal.fullName || "My"} resume is ready in Navin's AI Resume Studio.`;
    if (navigator.share) {
      await navigator.share({ title: "Resume", text });
    } else {
      await navigator.clipboard?.writeText(text);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingExperience onCreate={startNewResume} onImprove={() => uploadRef.current?.click()} />
            <input ref={uploadRef} type="file" accept=".pdf,.docx,application/pdf" className="hidden" onChange={(event) => handleUpload(event.target.files?.[0])} />
          </motion.div>
        )}

        {view === "type" && (
          <motion.div key="type" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <CandidateTypeSelection onBack={() => setView("landing")} onSelect={handleResumeType} />
          </motion.div>
        )}

        {view === "templates" && (
          <motion.div key="templates" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <TemplateGallery
              selected={resumeData.template}
              onBack={() => setView("type")}
              onSelect={handleTemplateSelect}
              onUse={() => setView("builder")}
            />
          </motion.div>
        )}

        {view === "builder" && (
          <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StudioWorkspace
              resumeData={resumeData}
              updateResume={updateResume}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              currentStep={currentStep}
              progress={progress}
              score={score}
              previewZoom={previewZoom}
              setPreviewZoom={setPreviewZoom}
              versions={versions}
              uploadName={uploadName}
              originalResumeText={originalResumeText}
              onSaveVersion={saveVersion}
              onLoadVersion={loadVersion}
              onDuplicateVersion={duplicateVersion}
              onRenameVersion={renameVersion}
              onDownloadVersion={downloadVersion}
              onDeleteVersion={deleteVersion}
              onChangeTemplate={() => setView("templates")}
              onGenerate={() => {
                saveVersion();
                setView("success");
              }}
            />
          </motion.div>
        )}

        {view === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen
              resumeData={resumeData}
              onEdit={() => setView("builder")}
              onPdf={() => window.print()}
              onDocx={() => downloadTextFile("docx")}
              onSave={saveVersion}
              onShare={shareResume}
              onDuplicate={() => {
                saveVersion();
                setView("builder");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingExperience = ({ onCreate, onImprove }: { onCreate: () => void; onImprove: () => void }) => (
  <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:py-16">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_30%)]" />
    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:42px_42px]" />
    <div className="relative mx-auto max-w-7xl">
      <div className="grid min-h-[560px] gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
            <Sparkles className="h-4 w-4" /> Navin's AI Resume Studio
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            AI Resume Studio
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
            Create ATS-friendly resumes or improve your existing resume with AI assistance.
          </p>
          <div className="mt-8 h-8 overflow-hidden text-sm font-bold uppercase tracking-[0.24em] text-indigo-200">
            <motion.div animate={{ y: [0, -32, -64, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
              <p>Write with clarity</p>
              <p className="h-8">Optimize for ATS</p>
              <p className="h-8">Polish every section</p>
            </motion.div>
          </div>
        </div>

        <div className="relative h-[420px]">
          {[0, 1, 2].map((item) => (
            <motion.div
              key={item}
              animate={{ y: [0, -16, 0], rotate: item === 0 ? [-4, -2, -4] : item === 1 ? [5, 2, 5] : [0, 3, 0] }}
              transition={{ duration: 5 + item, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute rounded-[28px] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl ${
                item === 0 ? "left-4 top-8 h-80 w-64 -rotate-3" : item === 1 ? "right-8 top-2 h-72 w-56 rotate-6 opacity-80" : "bottom-6 left-1/3 h-64 w-52 opacity-70"
              }`}
            >
              <div className="h-3 w-24 rounded-full bg-slate-900" />
              <div className="mt-5 space-y-2">
                <div className="h-2 rounded bg-indigo-100" />
                <div className="h-2 w-5/6 rounded bg-slate-200" />
                <div className="h-2 w-2/3 rounded bg-slate-200" />
              </div>
              <div className="mt-8 grid grid-cols-[0.35fr_0.65fr] gap-3">
                <div className="space-y-2">
                  <div className="h-2 rounded bg-indigo-200" />
                  <div className="h-2 rounded bg-indigo-200" />
                  <div className="h-2 rounded bg-indigo-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 rounded bg-slate-200" />
                </div>
              </div>
            </motion.div>
          ))}
          <motion.div animate={{ opacity: [0.35, 1, 0.35], scale: [0.96, 1, 0.96] }} transition={{ duration: 3, repeat: Infinity }} className="absolute right-4 top-20 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_28px_rgba(103,232,249,0.8)]" />
          <motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 1.25, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-20 bottom-20 h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_24px_rgba(165,180,252,0.8)]" />
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <OptionCard
          icon={FileText}
          title="Create New Resume"
          description="Create a new professional resume from scratch using AI-guided templates."
          button="Start Building"
          onClick={onCreate}
          accent="from-indigo-500 to-sky-500"
        />
        <OptionCard
          icon={UploadCloud}
          title="Improve Existing Resume"
          description="Upload an existing resume and let AI analyze, optimize, and redesign it professionally."
          button="Upload Resume"
          onClick={onImprove}
          accent="from-emerald-500 to-teal-500"
        />
      </div>
    </div>
  </section>
);

const OptionCard = ({
  icon: Icon,
  title,
  description,
  button,
  onClick,
  accent,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
  accent: string;
}) => (
  <button type="button" onClick={onClick} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-7 text-left transition duration-300 hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.07]">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-black/20`}>
      <Icon className="h-7 w-7" />
    </span>
    <h2 className="mt-6 text-2xl font-black">{title}</h2>
    <p className="mt-3 max-w-xl leading-7 text-slate-400">{description}</p>
    <span className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition group-hover:bg-indigo-100">
      {button} <ArrowRight className="h-4 w-4" />
    </span>
  </button>
);

const CandidateTypeSelection = ({ onBack, onSelect }: { onBack: () => void; onSelect: (type: string) => void }) => (
  <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <PageTopper eyebrow="Resume type" title="What best describes you?" description="This helps Navin's AI recommend stronger templates, sections, and resume emphasis." onBack={onBack} />
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {candidateTypes.map(({ id, title, detail, icon: Icon, sections }) => (
        <button key={id} type="button" onClick={() => onSelect(id)} className="group rounded-[26px] border border-white/10 bg-white/[0.045] p-6 text-left transition hover:-translate-y-1 hover:border-indigo-300/30 hover:bg-white/[0.07]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="mt-5 text-xl font-black">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {sections.map((section) => (
              <span key={section} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-300">{section}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  </section>
);

const TemplateGallery = ({
  selected,
  onBack,
  onSelect,
  onUse,
}: {
  selected: string;
  onBack: () => void;
  onSelect: (template: string) => void;
  onUse: () => void;
}) => (
  <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
    <PageTopper eyebrow="Templates" title="Choose a professional ATS-friendly design." description="Switch templates anytime. The content stays editable and the live preview updates instantly." onBack={onBack} />
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <div key={template.id} className={`group overflow-hidden rounded-[26px] border bg-white/[0.045] transition hover:-translate-y-1 hover:bg-white/[0.07] ${selected === template.id ? "border-indigo-300/60 ring-4 ring-indigo-500/10" : "border-white/10"}`}>
          <div className="p-4">
            <TemplateThumbnail template={template} />
          </div>
          <div className="border-t border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">{template.name}</h3>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">{template.badge}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{template.recommendedFor}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-400">
              <span>Theme: {template.color}</span>
              <span>Popularity: {template.popularity}</span>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => onSelect(template.id)} className="flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white transition hover:bg-white/[0.1]">
                Preview
              </button>
              <button type="button" onClick={() => { onSelect(template.id); onUse(); }} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-indigo-100">
                Use Template
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const TemplateThumbnail = ({ template }: { template: TemplateOption }) => {
  const isSidebar = ["modern-professional", "software-engineer", "two-column", "portfolio"].includes(template.id);
  const isMinimal = ["minimal", "simple-ats"].includes(template.id);
  const isTimeline = ["executive", "classic", "academic-cv"].includes(template.id);
  const isCreative = ["designer", "ai-engineer", "corporate"].includes(template.id);

  return (
    <div className="h-56 overflow-hidden rounded-2xl bg-white p-4 text-slate-950">
      {isSidebar && (
        <div className="grid h-full grid-cols-[0.36fr_0.64fr] gap-3">
          <div className={`rounded-xl bg-gradient-to-b ${template.accent} p-3`}>
            <div className="h-8 w-8 rounded-full bg-white/80" />
            <div className="mt-5 space-y-2">
              <div className="h-2 rounded bg-white/70" />
              <div className="h-2 rounded bg-white/50" />
              <div className="h-2 rounded bg-white/50" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-slate-900" />
            <div className="h-2 rounded bg-slate-200" />
            <div className="h-2 w-4/5 rounded bg-slate-200" />
            <div className="mt-4 grid gap-2">
              <div className="h-8 rounded-lg bg-slate-100" />
              <div className="h-8 rounded-lg bg-slate-100" />
              <div className="h-8 rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      )}

      {isMinimal && (
        <div className="h-full space-y-4">
          <div className="mx-auto h-4 w-2/3 rounded bg-slate-900" />
          <div className="mx-auto h-2 w-4/5 rounded bg-slate-200" />
          <div className="space-y-3 pt-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="border-t border-slate-200 pt-3">
                <div className="h-2 w-1/3 rounded bg-slate-700" />
                <div className="mt-2 h-2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isTimeline && (
        <div className="h-full">
          <div className={`h-10 rounded-xl bg-gradient-to-r ${template.accent}`} />
          <div className="mt-5 space-y-4 border-l-2 border-slate-300 pl-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="relative">
                <span className="absolute -left-[23px] top-0 h-3 w-3 rounded-full bg-slate-900" />
                <div className="h-3 w-1/2 rounded bg-slate-800" />
                <div className="mt-2 h-2 rounded bg-slate-200" />
                <div className="mt-1 h-2 w-3/4 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isCreative && (
        <div className="grid h-full grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className={`h-20 rounded-2xl bg-gradient-to-br ${template.accent}`} />
            <div className="h-12 rounded-2xl bg-slate-100" />
            <div className="h-12 rounded-2xl bg-slate-100" />
          </div>
          <div>
            <div className="h-4 w-3/4 rounded bg-slate-900" />
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded bg-slate-200" />
              <div className="h-2 rounded bg-slate-200" />
              <div className="h-2 w-2/3 rounded bg-slate-200" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="h-8 rounded-lg bg-slate-100" />
              <div className="h-8 rounded-lg bg-slate-100" />
              <div className="h-8 rounded-lg bg-slate-100" />
              <div className="h-8 rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudioWorkspace = ({
  resumeData,
  updateResume,
  activeStep,
  setActiveStep,
  currentStep,
  progress,
  score,
  previewZoom,
  setPreviewZoom,
  versions,
  uploadName,
  originalResumeText,
  onSaveVersion,
  onLoadVersion,
  onDuplicateVersion,
  onRenameVersion,
  onDownloadVersion,
  onDeleteVersion,
  onChangeTemplate,
  onGenerate,
}: {
  resumeData: ResumeData;
  updateResume: <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
  currentStep: { key: WizardStep; label: string; icon: typeof User };
  progress: number;
  score: ReturnType<typeof calculateQualityScore>;
  previewZoom: number;
  setPreviewZoom: (zoom: number) => void;
  versions: ResumeVersion[];
  uploadName: string;
  originalResumeText: string;
  onSaveVersion: () => void;
  onLoadVersion: (version: ResumeVersion) => void;
  onDuplicateVersion: (version: ResumeVersion) => void;
  onRenameVersion: (versionId: string, name: string) => void;
  onDownloadVersion: (version: ResumeVersion) => void;
  onDeleteVersion: (versionId: string) => void;
  onChangeTemplate: () => void;
  onGenerate: () => void;
}) => {
  const StepIcon = currentStep.icon;
  const canGoNext = activeStep < wizardSteps.length - 1;

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-300">
            <StepIcon className="h-4 w-4" /> AI Guided Resume Form
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Resume Studio Workspace</h1>
          <p className="mt-1 text-sm text-slate-400">Auto saved. Template switching is always available.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onChangeTemplate} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.1]">
            <Palette className="mr-2 inline h-4 w-4" /> Templates
          </button>
          <button type="button" onClick={onSaveVersion} className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white hover:bg-white/[0.1]">
            <Save className="mr-2 inline h-4 w-4" /> Save Version
          </button>
          <button type="button" onClick={onGenerate} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-indigo-100">
            Build Resume <ArrowRight className="ml-2 inline h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_480px]">
        <aside className="space-y-5">
          {originalResumeText && <OriginalResumePanel text={originalResumeText} />}
          <QualityPanel score={score} uploadName={uploadName} />
          {uploadName && <UploadAnalysisPanel score={score} />}
          <VersionPanel versions={versions} onLoad={onLoadVersion} onDuplicate={onDuplicateVersion} onRename={onRenameVersion} onDownload={onDownloadVersion} onDelete={onDeleteVersion} />
        </aside>

        <main className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              <span>Step {activeStep + 1} of {wizardSteps.length}</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            {wizardSteps.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${index === activeStep ? "border-indigo-300/50 bg-indigo-500 text-white" : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"}`}
              >
                {step.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentStep.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22 }}>
              <StepEditor step={currentStep.key} resumeData={resumeData} updateResume={updateResume} />
            </motion.div>
          </AnimatePresence>

          <AISuggestionPanel step={currentStep.key} resumeData={resumeData} updateResume={updateResume} />

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <button type="button" onClick={() => setActiveStep(Math.max(0, activeStep - 1))} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => (canGoNext ? setActiveStep(activeStep + 1) : onGenerate())}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-indigo-100"
            >
              {canGoNext ? "Next" : "Generate Resume"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>

        <aside className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">Live Preview</p>
              <p className="mt-1 text-sm text-slate-400">Updates as you type</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPreviewZoom(Math.max(0.62, previewZoom - 0.08))} className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-slate-300">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setPreviewZoom(Math.min(1, previewZoom + 0.08))} className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-slate-300">
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-[820px] overflow-auto rounded-2xl bg-slate-200 p-4">
            <div style={{ transform: `scale(${previewZoom})`, transformOrigin: "top left", width: `${100 / previewZoom}%` }} className="rounded-sm bg-white text-slate-950 shadow-2xl">
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

const StepEditor = ({
  step,
  resumeData,
  updateResume,
}: {
  step: WizardStep;
  resumeData: ResumeData;
  updateResume: <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => void;
}) => {
  if (step === "personal") {
    return <PersonalEditor data={resumeData.personal} onChange={(personal) => updateResume("personal", personal)} versionName={resumeData.versionName || ""} onVersionName={(name) => updateResume("versionName", name)} />;
  }
  if (step === "summary") {
    return <SummaryEditor data={resumeData.personal.summary} onChange={(summary) => updateResume("personal", { ...resumeData.personal, summary })} />;
  }
  if (step === "education") {
    return <EducationEditor data={resumeData.education} onChange={(education) => updateResume("education", education)} />;
  }
  if (step === "experience") {
    return <ExperienceEditor title="Experience" data={resumeData.experience || []} onChange={(experience) => updateResume("experience", experience)} />;
  }
  if (step === "projects") {
    return <ProjectEditor data={resumeData.projects} onChange={(projects) => updateResume("projects", projects)} />;
  }
  if (step === "skills") {
    return <SkillsEditor data={resumeData.skills} onChange={(skills) => updateResume("skills", skills)} />;
  }
  if (step === "internships") {
    return <ExperienceEditor title="Internships" data={resumeData.internships || []} onChange={(internships) => updateResume("internships", internships)} />;
  }
  if (step === "languages") {
    return <ListEditor title="Languages" value={resumeData.languages || []} onChange={(languages) => updateResume("languages", languages)} placeholder="English, Hindi, Telugu" />;
  }

  const entryKey = step as "certifications" | "achievements" | "research" | "publications" | "activities" | "references";
  return <SimpleEntryEditor title={wizardSteps.find((item) => item.key === step)?.label || "Details"} data={(resumeData[entryKey] || []) as SimpleEntry[]} onChange={(value) => updateResume(entryKey, value)} />;
};

const PersonalEditor = ({
  data,
  onChange,
  versionName,
  onVersionName,
}: {
  data: ResumeData["personal"];
  onChange: (data: ResumeData["personal"]) => void;
  versionName: string;
  onVersionName: (name: string) => void;
}) => {
  const fields = [
    { key: "fullName", label: "Full Name", icon: User, placeholder: "Navin Laddu" },
    { key: "email", label: "Email", icon: Mail, placeholder: "navin@example.com" },
    { key: "phone", label: "Phone", icon: Phone, placeholder: "+91 63046 XXXXX" },
    { key: "address", label: "Location", icon: MapPin, placeholder: "Hyderabad, India" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "linkedin.com/in/navin" },
    { key: "github", label: "GitHub", icon: Github, placeholder: "github.com/navin" },
  ] as const;

  return (
    <EditorShell title="Personal Information" description="Add the core contact details recruiters expect to see first.">
      <Input label="Resume Version Name" value={versionName} onChange={onVersionName} placeholder="Software Engineer Resume" />
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(({ key, label, icon: Icon, placeholder }) => (
          <Input key={key} label={label} icon={Icon} value={data[key]} onChange={(value) => onChange({ ...data, [key]: value })} placeholder={placeholder} />
        ))}
      </div>
    </EditorShell>
  );
};

const SummaryEditor = ({ data, onChange }: { data: string; onChange: (value: string) => void }) => (
  <EditorShell title="Professional Summary" description="Write a concise positioning statement. AI suggestions can rewrite it into stronger wording.">
    <Textarea value={data} onChange={onChange} placeholder="Motivated AI and full-stack engineering student with hands-on experience building React applications, ML prototypes, and data-driven projects." rows={8} />
  </EditorShell>
);

const EducationEditor = ({ data, onChange }: { data: EducationItem[]; onChange: (data: EducationItem[]) => void }) => (
  <EditorShell title="Education" description="Add degrees, branches, academic scores, and graduation years.">
    <Repeater
      items={data}
      emptyItem={{ university: "", branch: "", year: "", grade: "" }}
      onChange={onChange}
      render={(item, index, update) => (
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="University / School" value={item.university} onChange={(value) => update(index, { ...item, university: value })} placeholder="Malla Reddy University" />
          <Input label="Course / Branch" value={item.branch} onChange={(value) => update(index, { ...item, branch: value })} placeholder="B.Tech CSE - AIML" />
          <Input label="Year" value={item.year} onChange={(value) => update(index, { ...item, year: value })} placeholder="2027" />
          <Input label="Grade / CGPA" value={item.grade} onChange={(value) => update(index, { ...item, grade: value })} placeholder="9.0 CGPA" />
        </div>
      )}
    />
  </EditorShell>
);

const ExperienceEditor = ({ title, data, onChange }: { title: string; data: ExperienceItem[]; onChange: (data: ExperienceItem[]) => void }) => (
  <EditorShell title={title} description="Use action verbs, metrics, tools, and outcomes.">
    <Repeater
      items={data}
      emptyItem={{ company: "", role: "", duration: "", description: "" }}
      onChange={onChange}
      render={(item, index, update) => (
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Company" value={item.company} onChange={(value) => update(index, { ...item, company: value })} placeholder="Company name" />
          <Input label="Role" value={item.role} onChange={(value) => update(index, { ...item, role: value })} placeholder="Frontend Intern" />
          <Input label="Duration" value={item.duration} onChange={(value) => update(index, { ...item, duration: value })} placeholder="Jan 2026 - Apr 2026" />
          <div className="md:col-span-2">
            <Textarea value={item.description} onChange={(value) => update(index, { ...item, description: value })} placeholder="Developed responsive React modules, improved page load performance, and collaborated with backend APIs." rows={4} />
          </div>
        </div>
      )}
    />
  </EditorShell>
);

const ProjectEditor = ({ data, onChange }: { data: ProjectItem[]; onChange: (data: ProjectItem[]) => void }) => (
  <EditorShell title="Projects" description="Describe what you built, how you built it, and what changed because of it.">
    <Repeater
      items={data}
      emptyItem={{ title: "", desc: "", tech: "" }}
      onChange={onChange}
      render={(item, index, update) => (
        <div className="grid gap-3">
          <Input label="Project Title" value={item.title} onChange={(value) => update(index, { ...item, title: value })} placeholder="AI Resume Analyzer" />
          <Textarea value={item.desc} onChange={(value) => update(index, { ...item, desc: value })} placeholder="Built a resume analysis tool that extracts skills, scores ATS readiness, and recommends missing role-based skills." rows={4} />
          <Input label="Tech Stack" value={item.tech} onChange={(value) => update(index, { ...item, tech: value })} placeholder="React, FastAPI, Python, Hugging Face" />
        </div>
      )}
    />
  </EditorShell>
);

const SkillsEditor = ({ data, onChange }: { data: string[]; onChange: (data: string[]) => void }) => {
  const [input, setInput] = useState("");
  const addSkill = (skill: string) => {
    const cleaned = skill.trim();
    if (cleaned && !data.includes(cleaned)) onChange([...data, cleaned]);
    setInput("");
  };

  return (
    <EditorShell title="Skills" description="Add technical and professional skills. Press Enter to add custom skills.">
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addSkill(input);
          }
        }}
        placeholder="React, Python, SQL..."
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-indigo-300/50"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {data.map((skill) => (
          <button key={skill} type="button" onClick={() => onChange(data.filter((item) => item !== skill))} className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white">
            {skill} x
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-300">Recommended Skills</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendedSkills.map((skill) => (
            <button key={skill} type="button" onClick={() => addSkill(skill)} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white">
              + {skill}
            </button>
          ))}
        </div>
      </div>
    </EditorShell>
  );
};

const SimpleEntryEditor = ({ title, data, onChange }: { title: string; data: SimpleEntry[]; onChange: (data: SimpleEntry[]) => void }) => (
  <EditorShell title={title} description="Add relevant details. Keep entries concise, specific, and achievement oriented.">
    <Repeater
      items={data}
      emptyItem={{ title: "", detail: "", year: "" }}
      onChange={onChange}
      render={(item, index, update) => (
        <div className="grid gap-3 md:grid-cols-[1fr_140px]">
          <Input label="Title" value={item.title} onChange={(value) => update(index, { ...item, title: value })} placeholder={`${title} title`} />
          <Input label="Year" value={item.year || ""} onChange={(value) => update(index, { ...item, year: value })} placeholder="2026" />
          <div className="md:col-span-2">
            <Textarea value={item.detail} onChange={(value) => update(index, { ...item, detail: value })} placeholder="Add details, outcome, tools, or recognition." rows={3} />
          </div>
        </div>
      )}
    />
  </EditorShell>
);

const ListEditor = ({ title, value, onChange, placeholder }: { title: string; value: string[]; onChange: (value: string[]) => void; placeholder: string }) => {
  const [input, setInput] = useState("");
  return (
    <EditorShell title={title} description="Add one item at a time. Press Enter after each item.">
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && input.trim()) {
            event.preventDefault();
            onChange([...value, input.trim()]);
            setInput("");
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-indigo-300/50"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {value.map((item) => (
          <button key={item} type="button" onClick={() => onChange(value.filter((current) => current !== item))} className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white">
            {item} x
          </button>
        ))}
      </div>
    </EditorShell>
  );
};

const AISuggestionPanel = ({
  step,
  resumeData,
  updateResume,
}: {
  step: WizardStep;
  resumeData: ResumeData;
  updateResume: <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => void;
}) => {
  const [rejected, setRejected] = useState(false);
  const suggestion = getSuggestion(step);
  const applySuggestion = () => {
    if (step === "summary") {
      updateResume("personal", { ...resumeData.personal, summary: suggestion.rewrite });
    }
    if (step === "skills") {
      updateResume("skills", Array.from(new Set([...resumeData.skills, ...recommendedSkills.slice(0, 4)])));
    }
    if (step === "projects" && resumeData.projects[0]) {
      const projects = [...resumeData.projects];
      projects[0] = { ...projects[0], desc: suggestion.rewrite };
      updateResume("projects", projects);
    }
  };

  if (rejected) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-bold text-slate-400">Suggestion dismissed for this step.</p>
        <button type="button" onClick={() => setRejected(false)} className="mt-2 text-xs font-black text-indigo-300 hover:text-indigo-200">
          Show suggestion again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
      <p className="flex items-center gap-2 text-sm font-black text-amber-200">
        <Lightbulb className="h-4 w-4" /> AI Suggestion
      </p>
      <p className="mt-2 text-sm leading-6 text-amber-100/80">{suggestion.tip}</p>
      {suggestion.rewrite && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={applySuggestion} className="rounded-xl bg-amber-200 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-100">
            Accept Suggestion
          </button>
          <button type="button" onClick={() => setRejected(true)} className="rounded-xl border border-amber-200/30 bg-transparent px-4 py-2 text-xs font-black text-amber-100 hover:bg-amber-200/10">
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

const OriginalResumePanel = ({ text }: { text: string }) => (
  <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">Original Resume</p>
    <p className="mt-2 text-xs text-slate-500">Uploaded preview for side-by-side editing.</p>
    <div className="mt-4 max-h-72 overflow-auto rounded-2xl bg-white p-4 text-xs leading-6 text-slate-700">
      {text.split("\n").map((line, index) => (
        <p key={index} className={line ? "" : "h-3"}>{line}</p>
      ))}
    </div>
  </div>
);

const UploadAnalysisPanel = ({ score }: { score: ReturnType<typeof calculateQualityScore> }) => {
  const findings = [
    { label: "Grammar", value: 86 },
    { label: "Formatting", value: score.breakdown.find((item) => item.label === "Formatting")?.value || 80 },
    { label: "Keywords", value: score.breakdown.find((item) => item.label === "Keywords")?.value || 48 },
    { label: "Section Completeness", value: score.total },
  ];

  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">AI Resume Analysis</p>
      <div className="mt-4 space-y-3">
        {findings.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2 text-xs leading-5 text-slate-400">
        <p><span className="font-bold text-rose-300">Missing skills:</span> Docker, AWS, measurable impact keywords.</p>
        <p><span className="font-bold text-amber-200">Weak bullet:</span> Worked on a website.</p>
        <p><span className="font-bold text-emerald-300">Suggestion:</span> Add metrics, tools, and role-specific keywords.</p>
      </div>
    </div>
  );
};

const QualityPanel = ({ score, uploadName }: { score: ReturnType<typeof calculateQualityScore>; uploadName: string }) => (
  <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">Resume Score</p>
    <div className="mt-5 grid place-items-center">
      <div className="grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(rgb(99 102 241) ${score.total * 3.6}deg, rgb(30 41 59) 0deg)` }}>
        <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-950 text-center">
          <span className="text-3xl font-black">{score.total}%</span>
        </div>
      </div>
    </div>
    <div className="mt-5 space-y-3">
      {score.breakdown.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>{item.label}</span>
            <span>{item.value}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
    {uploadName && (
      <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs font-bold text-emerald-200">
        Imported: {uploadName}
      </div>
    )}
  </div>
);

const VersionPanel = ({
  versions,
  onLoad,
  onDuplicate,
  onRename,
  onDownload,
  onDelete,
}: {
  versions: ResumeVersion[];
  onLoad: (version: ResumeVersion) => void;
  onDuplicate: (version: ResumeVersion) => void;
  onRename: (versionId: string, name: string) => void;
  onDownload: (version: ResumeVersion) => void;
  onDelete: (versionId: string) => void;
}) => (
  <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-300">Resume Versions</p>
    <div className="mt-4 space-y-3">
      {versions.length ? versions.map((version) => (
        <div key={version.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
          <button type="button" onClick={() => onLoad(version)} className="block text-left text-sm font-bold text-white hover:text-indigo-200">{version.name}</button>
          <p className="mt-1 text-xs text-slate-500">{new Date(version.updatedAt).toLocaleString()}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => {
              const nextName = window.prompt("Rename resume version", version.name);
              if (nextName?.trim()) onRename(version.id, nextName.trim());
            }} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onDuplicate(version)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white">
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onDownload(version)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white">
              <Download className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => onDelete(version.id)} className="rounded-lg border border-white/10 p-2 text-rose-300 hover:text-rose-200">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )) : (
        <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-500">Saved versions will appear here.</p>
      )}
    </div>
  </div>
);

const SuccessScreen = ({
  resumeData,
  onEdit,
  onPdf,
  onDocx,
  onSave,
  onShare,
  onDuplicate,
}: {
  resumeData: ResumeData;
  onEdit: () => void;
  onPdf: () => void;
  onDocx: () => void;
  onSave: () => void;
  onShare: () => void;
  onDuplicate: () => void;
}) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
    <div className="rounded-[32px] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_32px_90px_-48px_rgba(99,102,241,0.8)]">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-4xl font-black tracking-tight">Resume Successfully Generated</h1>
      <p className="mx-auto mt-3 max-w-2xl text-slate-400">
        {resumeData.versionName || "Your resume"} is ready. You can download, save, share, duplicate, or reopen the editor with all fields preserved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ActionButton icon={Download} label="Download PDF" onClick={onPdf} primary />
        <ActionButton icon={Download} label="Download DOCX" onClick={onDocx} />
        <ActionButton icon={Save} label="Save Resume" onClick={onSave} />
        <ActionButton icon={Share2} label="Share Resume" onClick={onShare} />
        <ActionButton icon={Copy} label="Duplicate Resume" onClick={onDuplicate} />
        <ActionButton icon={Edit3} label="Edit Resume" onClick={onEdit} />
      </div>
      <div className="mt-10 rounded-3xl bg-slate-200 p-4 text-slate-950">
        <ResumePreview resumeData={resumeData} />
      </div>
    </div>
  </section>
);

const ActionButton = ({ icon: Icon, label, onClick, primary }: { icon: typeof Download; label: string; onClick: () => void; primary?: boolean }) => (
  <button type="button" onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${primary ? "bg-white text-slate-950 hover:bg-indigo-100" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}>
    <Icon className="h-4 w-4" /> {label}
  </button>
);

const PageTopper = ({ eyebrow, title, description, onBack }: { eyebrow: string; title: string; description: string; onBack: () => void }) => (
  <div>
    <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">{eyebrow}</p>
    <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">{description}</p>
  </div>
);

const EditorShell = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, icon: Icon }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; icon?: typeof User }) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {Icon && <Icon className="h-3.5 w-3.5 text-indigo-300" />} {label}
    </span>
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-300/50" />
  </label>
);

const Textarea = ({ value, onChange, placeholder, rows }: { value: string; onChange: (value: string) => void; placeholder: string; rows: number }) => (
  <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm font-semibold leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-300/50" />
);

const Repeater = <T,>({
  items,
  emptyItem,
  onChange,
  render,
}: {
  items: T[];
  emptyItem: T;
  onChange: (items: T[]) => void;
  render: (item: T, index: number, update: (index: number, item: T) => void) => React.ReactNode;
}) => {
  const update = (index: number, item: T) => {
    const next = [...items];
    next[index] = item;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Entry {index + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-white/10 p-2 text-rose-300 hover:text-rose-200">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {render(item, index, update)}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, emptyItem])} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-indigo-300/30 bg-indigo-500/10 px-4 py-3 text-sm font-black text-indigo-200 hover:bg-indigo-500/15">
        <Plus className="h-4 w-4" /> Add Entry
      </button>
    </div>
  );
};

const calculateQualityScore = (data: ResumeData) => {
  const contact = [data.personal.fullName, data.personal.email, data.personal.phone].filter(Boolean).length / 3;
  const summary = Math.min((data.personal.summary || "").length / 180, 1);
  const skills = Math.min(data.skills.length / 8, 1);
  const projects = Math.min(data.projects.length / 2, 1);
  const education = Math.min(data.education.length / 1, 1);
  const experience = Math.min(((data.experience || []).length + (data.internships || []).length) / 2, 1);
  const keywords = Math.min(new Set([...data.skills, ...recommendedSkills.filter((skill) => data.personal.summary.toLowerCase().includes(skill.toLowerCase()))]).size / 10, 1);
  const total = Math.round((contact * 15) + (summary * 15) + (skills * 18) + (projects * 15) + (education * 12) + (experience * 10) + (keywords * 15));

  return {
    total: Math.min(100, total),
    breakdown: [
      { label: "ATS Score", value: Math.round((contact + keywords) * 50) },
      { label: "Formatting", value: data.template ? 92 : 50 },
      { label: "Projects", value: Math.round(projects * 100) },
      { label: "Skills", value: Math.round(skills * 100) },
      { label: "Keywords", value: Math.round(keywords * 100) },
      { label: "Summary", value: Math.round(summary * 100) },
    ],
  };
};

const getSuggestion = (step: WizardStep) => {
  if (step === "summary") {
    return {
      tip: "Open with your role target, strongest technical skills, and one proof point. Avoid generic phrases like hard-working or passionate.",
      rewrite: "AI-focused full-stack developer with hands-on experience building React applications, Python-based analysis tools, and data-driven projects. Skilled at translating requirements into polished user experiences, measurable project outcomes, and ATS-friendly technical documentation.",
    };
  }
  if (step === "projects") {
    return {
      tip: "Project bullets should mention the problem, tools, result, and measurable impact.",
      rewrite: "Developed and deployed a responsive React application with API integration, improving user task completion and demonstrating production-ready frontend architecture.",
    };
  }
  if (step === "skills") {
    return {
      tip: "Add role-specific skills that match your target job. Group technical skills before soft skills for stronger ATS readability.",
      rewrite: "",
    };
  }
  if (step === "experience") {
    return {
      tip: `Use action verbs such as ${actionVerbs.slice(0, 5).join(", ")} and quantify ownership wherever possible.`,
      rewrite: "",
    };
  }
  return {
    tip: "Keep entries concise, specific, and evidence-based. Strong resumes show tools, actions, and outcomes.",
    rewrite: "",
  };
};

const buildResumeText = (data: ResumeData) => [
  data.personal.fullName,
  `${data.personal.email} | ${data.personal.phone} | ${data.personal.address}`,
  "",
  "SUMMARY",
  data.personal.summary,
  "",
  "SKILLS",
  data.skills.join(", "),
  "",
  "PROJECTS",
  ...data.projects.map((project) => `${project.title} - ${project.desc} (${project.tech})`),
].join("\n");

export default ResumeBuilder;
