import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import type { ResumeData } from '../resumebuilder/types';

const ProfessionalTemplate = ({ data }: { data: ResumeData }) => {
  const { personal, education, skills, projects } = data;

  return (
    <div className="flex min-h-[1050px] bg-white shadow-lg text-[#333] font-serif">
      {/* Sidebar: Left Column (Beige Background) */}
      <div className="w-[32%] bg-[#f3ede7] p-8 flex flex-col gap-10 border-r border-gray-200">
        
        {/* Contact Details */}
        <section>
          <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-4 tracking-tight uppercase">Contact Details</h2>
          <div className="space-y-4 text-sm">
            {personal.email && (
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-1.5 rounded-full text-white"><Mail size={12} /></div>
                <span className="break-all underline decoration-slate-400">{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-1.5 rounded-full text-white"><Phone size={12} /></div>
                <span>{personal.phone}</span>
              </div>
            )}
            {personal.address && (
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-1.5 rounded-full text-white"><MapPin size={12} /></div>
                <span>{personal.address}</span>
              </div>
            )}
          </div>
        </section>

        {/* Education Section */}
        <section>
          <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-4 tracking-tight uppercase">Education</h2>
          {education?.map((edu, i) => (
            <div key={i} className="mb-6 relative pl-4 border-l-2 border-slate-800">
              <p className="font-bold text-[15px] leading-tight text-slate-900">{edu.branch || "Course Name"}</p>
              <p className="text-slate-700 text-sm mt-1">{edu.university || "University Name"}</p>
              <p className="text-slate-500 text-xs mt-1 font-bold italic">{edu.year} | {edu.grade}</p>
            </div>
          ))}
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-4 tracking-tight uppercase">Skills</h2>
          <div className="space-y-3">
            {skills?.map((skill: string, i: number) => (
              <p key={i} className="text-sm font-medium text-slate-800 flex justify-between">
                <span>{skill}</span>
                <span className="text-slate-400 italic font-normal">— Expert</span>
              </p>
            ))}
          </div>
        </section>
      </div>

      {/* Main Content: Right Column */}
      <div className="w-[68%] p-12 bg-white">
        <header className="mb-12 border-t-[12px] border-slate-800 pt-6">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black leading-none">
            {personal.fullName || "YOUR NAME"}
          </h1>
          <p className="mt-4 text-slate-500 tracking-[0.2em] font-bold text-sm uppercase">Aspiring Professional</p>
        </header>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-1 mb-4 uppercase tracking-tight">Summary</h2>
          <p className="text-[15px] text-slate-700 leading-relaxed text-justify">
            Passionate B.Tech student with expertise in modern technologies. 
            Proven ability to develop scalable applications and solve complex technical challenges.
            Committed to continuous learning and delivering professional-grade software solutions.
          </p>
        </section>

        {/* Work / Projects */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-1 mb-6 uppercase tracking-tight">Key Projects</h2>
          {projects?.map((proj, i) => (
            <div key={i} className="mb-8">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-extrabold uppercase text-slate-900">{proj.title}</h3>
                <span className="text-sm font-bold text-slate-400 italic">{proj.tech}</span>
              </div>
              <ul className="list-disc ml-5 space-y-2 text-[14px] text-slate-700">
                <li className="font-medium">Integrated core features using {proj.tech}.</li>
                <li>{proj.desc || "Collaborated on the full lifecycle of the project from concept to deployment."}</li>
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b-2 border-black pb-1 mb-4 uppercase tracking-tight">Socials</h2>
          <div className="flex gap-6 text-sm font-bold text-slate-600">
            {personal.linkedin && <span className="flex items-center gap-2 underline"><Linkedin size={14}/> LinkedIn</span>}
            {personal.github && <span className="flex items-center gap-2 underline"><Github size={14}/> GitHub</span>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;
