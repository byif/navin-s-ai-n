import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';

const templates = [
  { 
    id: 'fresher', 
    name: 'Fresher / Student', 
    desc: 'Optimized for B.Tech students. Highlights projects and technical skills.', 
    icon: <Sparkles className="text-blue-500" />,
    badge: 'Popular for Internships'
  },
  { 
    id: 'pro', 
    name: 'Professional', 
    desc: 'Corporate-ready layout. Focuses on experience and certifications.', 
    icon: <Zap className="text-amber-500" />,
    badge: 'Classic Choice'
  }
];

const TemplateStep = ({ selected, onSelect, onNext, onBack }: { selected: string; onSelect: (id: string) => void; onNext: () => void; onBack: () => void }) => {

  const handleSelect = (id: string) => {
    onSelect(id); // Forces parent state update
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Pick a Design</h2>
        <p className="text-slate-500 mt-2">Choose a layout to start building your career advisor profile.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {templates.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(t.id)}
            className={`relative cursor-pointer p-6 rounded-3xl border-2 transition-all duration-200 ${
              selected === t.id 
                ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-100' 
                : 'border-slate-100 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                {t.icon}
              </div>
              {selected === t.id && (
                <div className="bg-blue-600 text-white p-1 rounded-full">
                  <Check size={16} />
                </div>
              )}
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-1 rounded-md mb-2 inline-block">
              {t.badge}
            </span>
            <h3 className="text-xl font-bold text-slate-800">{t.name}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <button 
          onClick={onBack} 
          className="text-slate-400 font-bold hover:text-slate-700 transition-colors"
        >
          Back
        </button>

        <button 
          onClick={onNext}
          disabled={!selected}
          className={`px-10 py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-2 ${
            selected 
              ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-blue-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Continue to Personal Info
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            →
          </motion.span>
        </button>
      </div>
    </div>
  );
};

export default TemplateStep;
