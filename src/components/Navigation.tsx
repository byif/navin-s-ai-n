import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bot,
  Briefcase,
  FileSearch,
  FileText,
  GraduationCap,
  Home,
  Menu,
  ClipboardList,
  Sparkles,
  Video,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import type { User as AuthUser } from '../types/auth';
import NotificationBell from './NotificationBell';
import { GlobalSearchBar } from './GlobalSearchBar';

const jobSeekerNavigationItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/careers', label: 'Career Paths', icon: Briefcase },
  { to: '/jobs', label: 'Available Jobs', icon: ClipboardList },
  { to: '/applications', label: 'My Applications', icon: FileText },
  { to: '/resume', label: 'Analyze Resume', icon: FileSearch },
  { to: '/resumebuilder', label: 'Build Resume', icon: FileText },
  { to: '/chatbot', label: 'AI Advisor', icon: Bot },
  { to: '/interview', label: 'Interview', icon: Video },
];

export const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const isRecruiter = user?.role === 'recruiter';

  return (
    // PREMIUM CHANGES: Added an explicit top neon glow border, backdrop blur, and smooth shadow blending
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80 h-16 flex items-center transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500">
      <div className="w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Left Flag */}
        <Link to="/" className="flex items-center gap-3 shrink-0 mr-4 group" onClick={() => setIsMenuOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none transform group-hover:scale-105 transition-all duration-300">
            <GraduationCap className="h-5.5 w-5.5" />
          </span>
          <div className="hidden sm:block">
            <span className="block text-sm font-black tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Navin's AI
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 -mt-0.5">
              <Sparkles className="h-2.5 w-2.5 animate-pulse" />
              Career Intelligence
            </span>
          </div>
        </Link>

        {/* ACTIVE NAVIGATION ROW */}
        <div className="hidden lg:flex items-center gap-x-1 flex-1 justify-center max-w-4xl mx-4 overflow-x-hidden">
          {isRecruiter ? <GlobalSearchBar /> : <NavLinks items={jobSeekerNavigationItems} />}
        </div>

        {/* Right side operational controls panel */}
        <div className="hidden items-center gap-3 md:flex shrink-0 ml-4">
          <div className="flex items-center gap-1">
            <NotificationBell />
            <DarkModeToggle />
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800/80 mx-1" />
          <UserMenu user={user} logout={logout} />
        </div>

        {/* Mobile menu layout handler toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE EXPANDED PANEL LINKS OVERLAY */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-t border-slate-200/80 bg-white/95 px-4 py-4 shadow-xl dark:border-slate-800/60 dark:bg-slate-950/95 lg:hidden animate-fade-in max-h-[calc(100vh-64px)] overflow-y-auto backdrop-blur-xl">
          {isRecruiter ? (
            <div className="relative mb-4 flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search profiles..." className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200" />
            </div>
          ) : (
            <NavLinks mobile onNavigate={() => setIsMenuOpen(false)} items={jobSeekerNavigationItems} />
          )}
          
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800 md:hidden">
            <UserMenu user={user} logout={logout} />
            <div className="flex items-center gap-1">
              <NotificationBell />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLinks = ({ mobile, onNavigate, items }: { mobile?: boolean; onNavigate?: () => void; items: typeof jobSeekerNavigationItems }) => (
  <div className={mobile ? 'grid gap-1 sm:grid-cols-2' : 'flex items-center gap-x-1'}>
    {items.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold tracking-tight transition-all duration-200 whitespace-nowrap shrink-0 border select-none group',
            isActive
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 dark:shadow-none font-extrabold scale-[1.02]'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100 bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-900/60 border-transparent'
          ].join(' ')
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </div>
);

const UserMenu = ({
  user,
}: {
  user: AuthUser | null;
  logout: () => void | Promise<void>;
}) => (
  <div className="flex items-center gap-3">
    <div className="hidden text-right sm:block select-none">
      <p className="max-w-28 truncate text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">
        {user?.name || 'Navin'}
      </p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5">
        {user?.role === "recruiter"
          ? user.recruiterProfile?.companyName || "Recruiter Suite"
          : user?.role === "admin"
          ? "System Admin"
          : "Candidate Dashboard"}
      </p>
    </div>

    {/* PROFILE BUTTON: Upgraded with a glowing gradient ring border */}
    <Link
      to="/profile"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-xs font-black uppercase text-white shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-400/10 hover:ring-indigo-500 transition-all duration-300 hover:scale-105 shrink-0 cursor-pointer"
      aria-label="Open Profile"
    >
      {(user?.name || user?.email || "U").charAt(0)}
    </Link>
  </div>
);

export default Navigation;
