import { ArrowUpRight, Building2, Calendar, MapPin } from 'lucide-react';
import type { Internship } from '../data/internships';

const InternshipCard = ({ internship }: { internship: Internship }) => (
  <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex items-center gap-4">
      <img src={internship.logo} alt="" className="h-12 w-12 rounded-2xl object-cover" />
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white">{internship.position}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Building2 className="h-4 w-4" /> {internship.company}</p>
      </div>
    </div>
    <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-500" /> {internship.location}</p>
      <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-500" /> {internship.duration} &bull; {internship.type}</p>
    </div>
    <a href={internship.applyUrl} target="_blank" rel="noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Explore opportunity <ArrowUpRight className="h-4 w-4" /></a>
  </article>
);

export default InternshipCard;
