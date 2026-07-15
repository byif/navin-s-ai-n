import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';
import { supabase } from '../lib/supabase';

const loginRoles: Array<{ role: UserRole; title: string; description: string; icon: typeof GraduationCap }> = [
  { role: 'job_seeker', title: 'Candidate Login', description: 'Resume tools, career advisor, applications, and AI interviews.', icon: GraduationCap },
  { role: 'recruiter', title: 'Recruiter Login', description: 'ATS dashboard, job posting, candidate ranking, and interviews.', icon: Briefcase },
];

const metrics = ['ATS-ready resumes', 'Secure Supabase sessions', 'AI interview monitoring', 'Recruiter analytics'];

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'job_seeker';
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(() => localStorage.getItem('navins_remember_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem('navins_remember_email')));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  const roleTitle = selectedRole === 'recruiter' ? 'Recruiter workspace' : 'Candidate workspace';

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6 && !loading, [email, password, loading]);

  const routeForRole = (role: UserRole) => (role === 'recruiter' ? '/recruiter' : role === 'admin' ? '/admin' : '/');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const effectiveRole: UserRole = email.toLowerCase().startsWith('admin') ? 'admin' : selectedRole;
      const user = await login(email.trim(), password, effectiveRole);
      if (rememberMe) localStorage.setItem('navins_remember_email', email.trim());
      else localStorage.removeItem('navins_remember_email');
      setMessage('Login successful. Opening your workspace...');
      window.setTimeout(() => navigate(routeForRole(user.role)), 350);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (selectedRole !== 'job_seeker') return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (googleError) setError(googleError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first, then request a reset link.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login` });
      if (resetError) throw resetError;
      setMessage('Password reset link sent. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.45),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.24),transparent_32%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <Link to="/login" className="relative flex items-center gap-3 text-xl font-black"><GraduationCap className="h-8 w-8 text-indigo-300" /> Navin's AI</Link>
        <div className="relative max-w-xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-300"><Sparkles className="h-4 w-4" /> Enterprise access</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">Secure access for career growth and hiring teams.</h1>
          <p className="mt-5 text-base font-medium leading-8 text-slate-300">A focused login experience with role-based routing, trusted sessions, and AI-powered workspace continuity.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {metrics.map((item) => <p key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm font-bold text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {item}</p>)}
          </div>
        </div>
        <p className="relative flex items-center gap-2 text-sm font-semibold text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Protected authentication powered by Supabase.</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
        <form className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-8" onSubmit={handleSubmit}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Welcome back</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Sign in to {roleTitle}</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Choose your role and continue to the right dashboard.</p>

          <div className="mt-6 grid gap-3">
            {loginRoles.map(({ role, title, description, icon: Icon }) => (
              <button key={role} type="button" onClick={() => setSelectedRole(role)} className={`rounded-2xl border p-4 text-left transition ${selectedRole === role ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-100' : 'border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-indigo-500/50'}`}>
                <span className="flex items-center gap-3 text-sm font-black"><Icon className="h-5 w-5" /> {title}</span>
                <span className="mt-1 block text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{description}</span>
              </button>
            ))}
          </div>

          <label className="mt-6 block text-sm font-bold">Email address</label>
          <div className="relative mt-2"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" placeholder="you@example.com" /></div>

          <label className="mt-5 block text-sm font-bold">Password</label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Enter your password" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3.5 text-slate-400 transition hover:text-indigo-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 font-semibold text-slate-500 dark:text-slate-400"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" /> Remember me</label>
            <button type="button" onClick={handleForgotPassword} className="font-bold text-indigo-600 transition hover:text-indigo-500">Forgot password?</button>
          </div>

          {message && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{message}</p>}
          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}

          <button type="submit" disabled={!canSubmit} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>

          {selectedRole === 'job_seeker' && (
            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              Continue with Google
            </button>
          )}

          <p className="mt-6 text-center text-sm font-medium text-slate-500">New to Navin's AI? <Link to={`/register?role=${selectedRole}`} className="font-black text-indigo-600 hover:text-indigo-500">Create an account</Link></p>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;