import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Code } from 'lucide-react';
import type { ProjectItem, StepControls } from './types';

const ProjectsStep = ({ data, onChange, onNext, onBack }: StepControls & { data: ProjectItem[]; onChange: (data: ProjectItem[]) => void }) => {
  const addProject = () => onChange([...data, { title: '', desc: '', tech: '' }]);
  const update = (i: number, f: keyof ProjectItem, v: string) => {
    const n = [...data]; n[i] = { ...n[i], [f]: v }; onChange(n);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button onClick={addProject} className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100"><Plus size={18}/> Add</button>
      </div>
      <AnimatePresence>
        {data.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 mb-4 relative">
             <button onClick={() => onChange(data.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
             <div className="space-y-4">
                <input placeholder="Project Name" className="bg-transparent text-lg font-bold outline-none border-b focus:border-blue-500 w-full" value={p.title} onChange={e=>update(i,'title',e.target.value)} />
                <textarea placeholder="Briefly describe what you built..." className="bg-transparent w-full h-20 outline-none resize-none" value={p.desc} onChange={e=>update(i,'desc',e.target.value)} />
                <div className="flex items-center gap-2 text-blue-600"><Code size={16}/> <input placeholder="Tech: React, Firebase, AI" className="bg-transparent outline-none text-sm w-full" value={p.tech} onChange={e=>update(i,'tech',e.target.value)} /></div>
             </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="text-gray-400">Back</button>
        <button onClick={onNext} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold">Preview</button>
      </div>
    </div>
  );
};

export default ProjectsStep;
