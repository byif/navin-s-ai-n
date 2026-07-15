import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';
import type { ResumeData } from '../resumebuilder/types';

const FresherTemplate = ({ data }: { data: ResumeData }) => {
  const { personal, education, skills, projects } = data;

  return (
    <div className="p-12 font-sans text-slate-800 bg-white min-h-[1050px] shadow-sm flex flex-col">
      {/* Premium Header */}
      <header className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div className="flex-1">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-4">
            {personal.fullName || "Navin Laddu"}
          </h1>
          <p className="text-[13px] text-slate-500 font-bold uppercase tracking-[0.3em] mb-4">
            B.Tech (Computer Science & AI-ML)
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><Mail size={14} /> {personal.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> {personal.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {personal.address}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {personal.linkedin && (
            <span className="text-[11px] font-bold bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Linkedin size={12} className="text-blue-600"/> {personal.linkedin}
            </span>
          )}
          {personal.github && (
            <span className="text-[11px] font-bold bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2">
              <Github size={12}/> {personal.github}
            </span>
          )}
        </div>
      </header>

      {/* Summary Section */}
      <section className="mb-10">
        <p className="text-[15px] leading-relaxed text-slate-600 font-medium">
          {personal.summary || "Add a professional summary to highlight your vision."}
        </p>
      </section>

      <div className="grid grid-cols-12 gap-12 flex-1">
        {/* Main Content Area */}
        <div className="col-span-8 space-y-10">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
              Technical Projects <div className="h-[2px] bg-slate-100 flex-1"/>
            </h2>
            {projects?.map((proj, i) => (
              <div key={i} className="mb-8 relative group">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {proj.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                    {proj.tech}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                  {proj.desc}
                </p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
              Education <div className="h-[2px] bg-slate-100 flex-1"/>
            </h2>
            <div className="space-y-6">
              {education?.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{edu.university}</h3>
                    <p className="text-[13px] text-slate-500 font-semibold">{edu.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black text-slate-900">{edu.year}</p>
                    <p className="text-[11px] font-bold text-blue-600">CGPA: {edu.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="col-span-4">
          <section className="mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1.5 border border-slate-200 text-[11px] font-bold rounded-lg hover:border-blue-500 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </section>
          
          {/* Subtle Resume Hint */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-wider mb-2">Portfolio Note</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Actively seeking internship opportunities to leverage my full-stack skills in real-world environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FresherTemplate;
