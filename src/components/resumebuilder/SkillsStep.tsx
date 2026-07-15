import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { StepControls } from './types';

const SkillsStep = ({ data, onChange, onNext, onBack }: StepControls & { data: string[]; onChange: (data: string[]) => void }) => {
  const [input, setInput] = useState('');

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      if (!data.includes(input.trim())) {
        onChange([...data, input.trim()]);
      }
      setInput('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Skills & Expertise <Sparkles className="text-yellow-500" size={20} />
        </h2>
        <p className="text-slate-500">Add technical skills or soft skills. Press Enter to add.</p>
      </div>

      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addSkill}
        placeholder="e.g. React, Python, Leadership..."
        className="w-full p-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none mb-6"
      />

      <div className="flex flex-wrap gap-2 mb-10">
        <AnimatePresence>
          {data.map((skill: string) => (
            <motion.span
              key={skill}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              {skill}
              <X size={14} className="cursor-pointer" onClick={() => onChange(data.filter((s) => s !== skill))} />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-slate-500 font-medium">Back</button>
        <button onClick={onNext} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Next: Projects</button>
      </div>
    </div>
  );
};

export default SkillsStep;
