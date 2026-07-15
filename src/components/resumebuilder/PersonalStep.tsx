import React from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, FileText } from 'lucide-react';
import type { PersonalInfo, StepControls } from './types';

const PersonalStep = ({ data, onChange, onNext, onBack }: StepControls & { data: PersonalInfo; onChange: (data: PersonalInfo) => void }) => {
  
  // Handles both input and textarea changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Spreading existing data ensures other fields aren't deleted
    onChange({
      ...data,
      [name]: value
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
        <p className="text-gray-500 text-sm">Provide your contact details and a strong professional summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <User size={16} className="text-blue-500"/> Full Name
          </label>
          <input
            name="fullName"
            value={data.fullName || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="e.g. Navin Laddu"
          />
        </div>

        {/* Email & Phone */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <Mail size={16} className="text-blue-500"/> Email
          </label>
          <input
            name="email"
            value={data.email || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="navin@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <Phone size={16} className="text-blue-500"/> Phone
          </label>
          <input
            name="phone"
            value={data.phone || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="+91 63046 XXXXX"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-blue-500"/> Location
          </label>
          <input
            name="address"
            value={data.address || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="e.g. Khammam, India"
          />
        </div>

        {/* LinkedIn & GitHub */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <Linkedin size={16} className="text-blue-500"/> LinkedIn URL
          </label>
          <input
            name="linkedin"
            value={data.linkedin || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <Github size={16} className="text-blue-500"/> GitHub URL
          </label>
          <input
            name="github"
            value={data.github || ""}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            placeholder="github.com/username"
          />
        </div>

        {/* PROFESSIONAL SUMMARY - NEW FIELD */}
        <div className="md:col-span-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <FileText size={16} className="text-blue-500"/> Professional Summary
          </label>
          <textarea
            name="summary"
            value={data.summary || ""}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
            placeholder="Briefly describe your background, key projects (like your Chating App), and career goals..."
          />
          <p className="mt-2 text-[11px] text-gray-400 italic">
            Tip: Highlight your experience as a 3rd year B.Tech student and your tech stack like React and Node.js.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <button onClick={onBack} className="text-gray-400 font-bold hover:text-gray-600 transition-colors">Back</button>
        <button 
          onClick={onNext}
          className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          Next: Education
        </button>
      </div>
    </div>
  );
};

export default PersonalStep;
