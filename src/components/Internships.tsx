import { Sparkles } from 'lucide-react';
import { internships } from '../data/internships';
import InternshipCard from './InternshipCard';

const Internships = () => (
  <section id="internships" className="bg-white py-20 dark:bg-slate-900">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-4 w-4" /> Opportunity board</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Experience that moves your resume forward.</h2>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">Explore selected internship opportunities and build the practical evidence employers want to see.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {internships.map((internship) => <InternshipCard key={internship.id} internship={internship} />)}
      </div>
    </div>
  </section>
);

export default Internships;
