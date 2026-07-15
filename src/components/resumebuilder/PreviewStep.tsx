import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Check, Download, ArrowLeft } from "lucide-react";
import ResumePreview from "./ResumePreview";
import type { Dispatch, SetStateAction } from "react";
import type { PersonalInfo, ResumeData } from "./types";

const PreviewStep = ({ resumeData, setResumeData, onBack }: { resumeData: ResumeData; setResumeData: Dispatch<SetStateAction<ResumeData>>; onBack: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Function to handle quick edits from the preview screen
  const handleQuickEdit = (field: keyof PersonalInfo, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Final Review</h2>
          <p className="text-slate-500">Perfect your details before downloading.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
              isEditing ? 'bg-green-600 text-white shadow-green-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEditing ? <><Check size={18}/> Save Changes</> : <><Edit3 size={18}/> Quick Edit</>}
          </button>
          
          {!isEditing && (
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              <Download size={18} /> Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Quick Edit Form (Visible only when Editing) */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="lg:col-span-4 space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl h-fit sticky top-10"
            >
              <h3 className="font-bold text-lg mb-4 text-blue-600 underline">Quick Personal Edit</h3>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <input 
                  value={resumeData.personal.fullName} 
                  onChange={(e) => handleQuickEdit('fullName', e.target.value)}
                  className="w-full p-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                <input 
                  value={resumeData.personal.email} 
                  onChange={(e) => handleQuickEdit('email', e.target.value)}
                  className="w-full p-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Note: For Education/Skills, use the main "Edit" button to return to steps.</p>
              <button onClick={onBack} className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                <ArrowLeft size={14}/> Back to Steps
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Resume Display */}
        <div className={`${isEditing ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="bg-slate-200 p-4 md:p-10 rounded-[40px] shadow-inner border border-slate-300">
            <div className="bg-white shadow-2xl rounded-sm overflow-hidden transform transition-all">
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
