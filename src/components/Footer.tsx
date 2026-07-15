import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Sparkles } from 'lucide-react';

const featureLinks = [
  { label: 'Career Paths', to: '/careers' },
  { label: 'Resume Builder', to: '/resumebuilder' },
  { label: 'Resume Analyzer', to: '/resume' },
  { label: 'Available Jobs', to: '/jobs' },
  { label: 'AI Advisor', to: '/chatbot' },
  { label: 'Interview', to: '/interview' },
];

const resourceLinks = [
  { label: 'Resources', href: '#platform' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: 'mailto:navinladdu803@gmail.com' },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/30">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-black tracking-tight">Navin's AI</p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Career Intelligence</p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A professional AI platform for resumes, career guidance, interviews, job discovery, and recruiter workflows.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">Features</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {featureLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">Resources</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-white">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-300">Connect</h4>
            <a href="mailto:navinladdu803@gmail.com" className="mt-4 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
              <Mail className="h-4 w-4" />
              Email
            </a>
            <div className="mt-5 flex gap-3">
              <a href="https://github.com" className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:border-indigo-300/30 hover:text-white" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:border-indigo-300/30 hover:text-white" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Navin's AI. Developed by Navin Reddy.</p>
          <p>Built for focused career growth and modern hiring.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
