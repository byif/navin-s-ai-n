import { ArrowUpRight } from 'lucide-react';
import type { Career } from '../types/career';

const CareerCard = ({ career }: { career: Career }) => {
  const { title, icon: Icon, description, skills, learnMoreUrl, jobBoardUrl } = career;
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-300">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{skill}</span>)}
      </div>
      <div className="mt-6 flex gap-4 border-t border-slate-100 pt-4 text-sm font-semibold dark:border-slate-800">
        <a href={learnMoreUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Roadmap <ArrowUpRight className="h-4 w-4" /></a>
        <a href={jobBoardUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">View jobs <ArrowUpRight className="h-4 w-4" /></a>
      </div>
    </article>
  );
};

export default CareerCard;
