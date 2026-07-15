import type { ReactNode } from 'react';
import type { ResumeData } from './types';

const fallback = {
  name: 'Your Name',
  role: 'Target Role',
  summary: 'Add a focused professional summary that explains your strengths, target role, and strongest proof points.',
};

const ResumePreview = ({ resumeData }: { resumeData: ResumeData }) => {
  const template = resumeData.template || 'modern-professional';

  if (['minimal', 'simple-ats'].includes(template)) return <MinimalAts data={resumeData} />;
  if (['executive', 'classic'].includes(template)) return <ExecutiveTimeline data={resumeData} />;
  if (['software-engineer', 'two-column'].includes(template)) return <SoftwareEngineer data={resumeData} />;
  if (['ai-engineer', 'academic-cv'].includes(template)) return <AiEngineer data={resumeData} />;
  if (['designer', 'portfolio'].includes(template)) return <CreativePortfolio data={resumeData} />;
  if (template === 'corporate' || template === 'pro' || template === 'professional') return <CorporateSidebar data={resumeData} />;

  return <ModernProfessional data={resumeData} />;
};

const Header = ({ data, dark }: { data: ResumeData; dark?: boolean }) => (
  <header>
    <h1 className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}>
      {data.personal.fullName || fallback.name}
    </h1>
    <p className={`mt-2 text-sm font-bold uppercase tracking-[0.18em] ${dark ? 'text-indigo-100' : 'text-indigo-700'}`}>
      {data.versionName || fallback.role}
    </p>
    <div className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs ${dark ? 'text-slate-200' : 'text-slate-600'}`}>
      {[data.personal.email, data.personal.phone, data.personal.address, data.personal.linkedin, data.personal.github].filter(Boolean).map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  </header>
);

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-7">
    <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{title}</h2>
    {children}
  </section>
);

const Summary = ({ data }: { data: ResumeData }) => (
  <p className="text-sm leading-7 text-slate-700">{data.personal.summary || fallback.summary}</p>
);

const Skills = ({ data }: { data: ResumeData }) => (
  <div className="flex flex-wrap gap-2">
    {(data.skills.length ? data.skills : ['React', 'Python', 'SQL']).map((skill) => (
      <span key={skill} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{skill}</span>
    ))}
  </div>
);

const Projects = ({ data }: { data: ResumeData }) => (
  <div className="space-y-4">
    {(data.projects.length ? data.projects : [{ title: 'Project Title', desc: 'Describe your project impact, tools, and measurable result.', tech: 'Tech stack' }]).map((project, index) => (
      <div key={`${project.title}-${index}`}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-black text-slate-950">{project.title || 'Project Title'}</h3>
          <span className="text-xs font-bold text-indigo-700">{project.tech}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{project.desc}</p>
      </div>
    ))}
  </div>
);

const Education = ({ data }: { data: ResumeData }) => (
  <div className="space-y-3">
    {(data.education.length ? data.education : [{ university: 'University Name', branch: 'Degree / Branch', year: 'Year', grade: 'Grade' }]).map((edu, index) => (
      <div key={`${edu.university}-${index}`} className="flex justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-950">{edu.university}</h3>
          <p className="text-sm text-slate-600">{edu.branch}</p>
        </div>
        <p className="text-right text-xs font-bold text-slate-500">{edu.year}<br />{edu.grade}</p>
      </div>
    ))}
  </div>
);

const Experience = ({ data }: { data: ResumeData }) => (
  <div className="space-y-4">
    {((data.experience || []).length ? data.experience || [] : [{ company: 'Company', role: 'Role', duration: 'Duration', description: 'Describe ownership, tools, and measurable impact.' }]).map((job, index) => (
      <div key={`${job.company}-${index}`}>
        <div className="flex justify-between gap-4">
          <h3 className="font-black text-slate-950">{job.role}</h3>
          <span className="text-xs font-bold text-slate-500">{job.duration}</span>
        </div>
        <p className="text-sm font-bold text-indigo-700">{job.company}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{job.description}</p>
      </div>
    ))}
  </div>
);

const Extras = ({ data }: { data: ResumeData }) => {
  const entries = [...(data.certifications || []), ...(data.achievements || [])].slice(0, 4);
  if (!entries.length) return null;
  return (
    <div className="space-y-2">
      {entries.map((item, index) => (
        <p key={`${item.title}-${index}`} className="text-sm text-slate-700"><span className="font-bold">{item.title}</span> {item.year ? `(${item.year})` : ''} - {item.detail}</p>
      ))}
    </div>
  );
};

const ModernProfessional = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="min-h-[1050px] bg-white p-12 font-sans text-slate-900">
    <div className="border-b-4 border-indigo-600 pb-7">
      <Header data={data} />
    </div>
    <Section title="Professional Summary"><Summary data={data} /></Section>
    <div className="grid grid-cols-[1.4fr_0.8fr] gap-10">
      <div>
        <Section title="Experience"><Experience data={data} /></Section>
        <Section title="Projects"><Projects data={data} /></Section>
      </div>
      <div>
        <Section title="Skills"><Skills data={data} /></Section>
        <Section title="Education"><Education data={data} /></Section>
        <Section title="Certifications & Achievements"><Extras data={data} /></Section>
      </div>
    </div>
  </div>
);

const MinimalAts = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="min-h-[1050px] bg-white p-14 font-serif text-slate-950">
    <div className="text-center">
      <Header data={data} />
    </div>
    <Section title="Summary"><Summary data={data} /></Section>
    <Section title="Skills"><Skills data={data} /></Section>
    <Section title="Experience"><Experience data={data} /></Section>
    <Section title="Projects"><Projects data={data} /></Section>
    <Section title="Education"><Education data={data} /></Section>
  </div>
);

const ExecutiveTimeline = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="min-h-[1050px] bg-white p-0 font-sans text-slate-950">
    <div className="bg-slate-950 p-12 text-white">
      <Header data={data} dark />
    </div>
    <div className="p-12">
      <Section title="Executive Summary"><Summary data={data} /></Section>
      <div className="mt-7 border-l-2 border-slate-300 pl-6">
        <Section title="Timeline Experience"><Experience data={data} /></Section>
        <Section title="Selected Impact"><Projects data={data} /></Section>
      </div>
      <Section title="Education & Credentials"><Education data={data} /></Section>
    </div>
  </div>
);

const SoftwareEngineer = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="grid min-h-[1050px] grid-cols-[0.34fr_0.66fr] bg-white font-sans text-slate-950">
    <aside className="bg-slate-950 p-8 text-white">
      <Header data={data} dark />
      <Section title="Technical Skills"><Skills data={data} /></Section>
      <Section title="Education"><Education data={data} /></Section>
    </aside>
    <main className="p-10">
      <Section title="Engineer Profile"><Summary data={data} /></Section>
      <Section title="Projects First"><Projects data={data} /></Section>
      <Section title="Experience"><Experience data={data} /></Section>
    </main>
  </div>
);

const AiEngineer = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="min-h-[1050px] bg-white p-12 font-sans text-slate-950">
    <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white">
      <Header data={data} dark />
    </div>
    <div className="grid grid-cols-[1fr_0.8fr] gap-10">
      <div>
        <Section title="AI / ML Summary"><Summary data={data} /></Section>
        <Section title="Research & Publications"><Extras data={{ ...data, certifications: data.research, achievements: data.publications }} /></Section>
        <Section title="AI Projects"><Projects data={data} /></Section>
      </div>
      <div>
        <Section title="Skills Emphasis"><Skills data={data} /></Section>
        <Section title="Education"><Education data={data} /></Section>
      </div>
    </div>
  </div>
);

const CreativePortfolio = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="min-h-[1050px] bg-white p-10 font-sans text-slate-950">
    <div className="grid grid-cols-[0.9fr_1.1fr] gap-8">
      <div className="rounded-[32px] bg-gradient-to-br from-rose-500 to-orange-400 p-8 text-white">
        <Header data={data} dark />
        <Section title="Skills"><Skills data={data} /></Section>
      </div>
      <div>
        <Section title="Profile"><Summary data={data} /></Section>
        <Section title="Portfolio Projects"><Projects data={data} /></Section>
        <Section title="Activities & Achievements"><Extras data={{ ...data, certifications: data.activities, achievements: data.achievements }} /></Section>
      </div>
    </div>
  </div>
);

const CorporateSidebar = ({ data }: { data: ResumeData }) => (
  <div id="resume-print-area" className="grid min-h-[1050px] grid-cols-[0.3fr_0.7fr] bg-white font-serif text-slate-950">
    <aside className="bg-[#f3ede7] p-8">
      <Section title="Contact"><p className="text-sm leading-7">{data.personal.email}<br />{data.personal.phone}<br />{data.personal.address}</p></Section>
      <Section title="Skills"><Skills data={data} /></Section>
      <Section title="Education"><Education data={data} /></Section>
    </aside>
    <main className="p-12">
      <div className="border-t-[12px] border-slate-900 pt-7">
        <Header data={data} />
      </div>
      <Section title="Summary"><Summary data={data} /></Section>
      <Section title="Professional Experience"><Experience data={data} /></Section>
      <Section title="Projects"><Projects data={data} /></Section>
    </main>
  </div>
);

export default ResumePreview;
