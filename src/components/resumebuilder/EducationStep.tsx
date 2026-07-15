import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Trash2, Calendar, BookOpen, Star } from 'lucide-react';
import type { EducationItem, StepControls } from './types';

const EducationStep = ({ data, onChange, onNext, onBack }: StepControls & { data: EducationItem[]; onChange: (data: EducationItem[]) => void }) => {
  
  // Add a new empty education object
  const addEducation = () => {
    onChange([...data, { university: '', branch: '', year: '', grade: '' }]);
  };

  // Remove a specific education entry
  const removeEducation = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  // Update a specific field for a specific index
  const handleChange = (index: number, field: keyof EducationItem, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Education</h2>
          <p className="text-gray-500">Add your academic qualifications.</p>
        </div>
        <button 
          onClick={addEducation}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all"
        >
          <Plus size={18} /> Add More
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {data.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative group"
            >
              <button 
                onClick={() => removeEducation(index)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* University/School */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                    <GraduationCap size={14}/> University / School
                  </label>
                  <input
                    value={edu.university || ""}
                    onChange={(e) => handleChange(index, 'university', e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Malla Reddy University"
                  />
                </div>

                {/* Branch/Course */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                    <BookOpen size={14}/> Branch / Course
                  </label>
                  <input
                    value={edu.branch || ""}
                    onChange={(e) => handleChange(index, 'branch', e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. B.Tech (CSE - AIML)"
                  />
                </div>

                {/* Passing Year & Grade */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                      <Calendar size={14}/> Passing Year
                    </label>
                    <input
                      value={edu.year || ""}
                      onChange={(e) => handleChange(index, 'year', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="2027"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                      <Star size={14}/> Grade / CGPA
                    </label>
                    <input
                      value={edu.grade || ""}
                      onChange={(e) => handleChange(index, 'grade', e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="9.0 or 85%"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {data.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            No education history added. Click "Add More" to start.
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">Back</button>
        <button 
          onClick={onNext}
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all"
        >
          Next: Skills
        </button>
      </div>
    </div>
  );
};

export default EducationStep;
