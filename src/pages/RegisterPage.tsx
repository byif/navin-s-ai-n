import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, CheckCircle2, Eye, EyeOff, FileImage, Globe, GraduationCap, Loader2, Lock, Mail, ShieldCheck, Sparkles, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

const candidateBenefits = ['Resume Builder', 'Resume Analyzer', 'ATS Optimization', 'Career Guidance', 'AI Mock Interviews', 'Job Applications'];
const recruiterBenefits = ['Company Dashboard', 'Job Posting', 'Candidate Management', 'Interview Scheduling', 'Recruitment Analytics', 'Applicant Tracking'];

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'job_seeker';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }, [password]);

  const benefits = role === 'recruiter' ? recruiterBenefits : candidateBenefits;
  const stepOneReady = role === 'job_seeker' ? name.trim() && email.trim() : name.trim() && email.trim() && companyName.trim() && designation.trim();
  const finalReady = password.length >= 6 && password === confirmPassword && acceptedTerms && !loading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      if (!stepOneReady) {
        setError('Please complete the required profile details.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    if (!finalReady) {
      setError(password !== confirmPassword ? 'Passwords do not match.' : 'Please complete password and terms requirements.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const user = await register(email.trim(), password, name.trim(), role, role === 'recruiter' ? { companyName, designation, companyWebsite, industry } : undefined);
      setSuccess('Account created. Opening your workspace...');
      window.setTimeout(() => navigate(user.role === 'recruiter' ? '/recruiter' : '/'), 450);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (role !== 'job_seeker') return;
    setLoading(true);
    setError('');
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (googleError) setError(googleError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.45),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_32%)]" />
        <div className="relative flex items-center gap-3 text-xl font-black"><GraduationCap className="h-8 w-8 text-indigo-300" /> Navin's AI</div>
        <div className="relative max-w-xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-indigo-300"><Sparkles className="h-4 w-4" /> Guided onboarding</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">Create the workspace that matches your role.</h1>
          <p className="mt-5 text-base font-medium leading-8 text-slate-300">A short onboarding flow keeps candidate and recruiter setup focused, professional, and secure.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((item) => <p key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-sm font-bold text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {item}</p>)}
          </div>
        </div>
        <p className="relative flex items-center gap-2 text-sm font-semibold text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Email verification depends on your Supabase project settings.</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-white">
        <form className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-8" onSubmit={handleSubmit}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Create account</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">{role === 'recruiter' ? 'Recruiter onboarding' : 'Candidate onboarding'}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <RoleButton active={role === 'job_seeker'} icon={GraduationCap} label="Candidate" onClick={() => { setRole('job_seeker'); setStep(1); }} />
            <RoleButton active={role === 'recruiter'} icon={Briefcase} label="Recruiter" onClick={() => { setRole('recruiter'); setStep(1); }} />
          </div>

          <div className="mt-6 flex gap-2">
            {[1, 2].map((item) => <div key={item} className={`h-2 flex-1 rounded-full ${step >= item ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`} />)}
          </div>

          {step === 1 ? (
            <div className="mt-6 grid gap-4">
              <Field icon={User} label="Full Name" value={name} onChange={setName} placeholder="Your name" type="text" />
              <Field icon={Mail} label={role === 'recruiter' ? 'Business Email' : 'Email Address'} value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
              {role === 'recruiter' && (
                <>
                  <Field icon={Building2} label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Company name" type="text" />
                  <Field icon={Briefcase} label="Designation" value={designation} onChange={setDesignation} placeholder="HR Manager, Recruiter..." type="text" />
                  <Field icon={Globe} label="Company Website" value={companyWebsite} onChange={setCompanyWebsite} placeholder="https://company.com" type="url" required={false} />
                  <Field icon={Sparkles} label="Industry" value={industry} onChange={setIndustry} placeholder="Technology, Finance..." type="text" required={false} />
                  <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                    <span className="flex items-center gap-2"><FileImage className="h-4 w-4" /> Company logo optional</span>
                    <input type="file" accept="image/*" className="mt-3 block w-full text-xs" onChange={(event) => setCompanyLogo(event.target.files?.[0]?.name || '')} />
                    {companyLogo && <span className="mt-2 block text-xs text-indigo-600 dark:text-indigo-300">Selected: {companyLogo}</span>}
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <PasswordField label="Password" value={password} onChange={setPassword} showPassword={showPassword} setShowPassword={setShowPassword} />
              <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} showPassword={showPassword} setShowPassword={setShowPassword} />
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400"><span>Password strength</span><span>{strength}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={`h-full rounded-full ${strength >= 75 ? 'bg-emerald-500' : strength >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${strength}%` }} /></div>
              </div>
              <label className="flex items-start gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600" /> I agree to use Navin's AI responsibly and accept the platform terms.</label>
            </div>
          )}

          {success && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">{success}</p>}
          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}

          <button disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 1 ? <>Continue <ArrowRight className="h-4 w-4" /></> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
          {step === 2 && <button type="button" onClick={() => setStep(1)} className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300">Back to profile details</button>}
          {role === 'job_seeker' && <button type="button" onClick={handleGoogleSignup} disabled={loading} className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white">Sign up with Google</button>}
          <p className="mt-6 text-center text-sm font-medium text-slate-500">Already registered? <Link to={`/login?role=${role}`} className="font-black text-indigo-600 hover:text-indigo-500">Sign in</Link></p>
        </form>
      </section>
    </div>
  );
};

const RoleButton = ({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof GraduationCap; label: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left text-sm font-black transition ${active ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-100' : 'border-slate-200 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:text-slate-300'}`}><Icon className="mb-2 h-5 w-5" /> {label}</button>
);

const Field = ({ icon: Icon, label, value, onChange, placeholder, type, required = true }: { icon: typeof User; label: string; value: string; onChange: (value: string) => void; placeholder: string; type: string; required?: boolean }) => (
  <label className="block text-sm font-bold">
    {label}
    <span className="relative mt-2 block"><Icon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" placeholder={placeholder} /></span>
  </label>
);

const PasswordField = ({ label, value, onChange, showPassword, setShowPassword }: { label: string; value: string; onChange: (value: string) => void; showPassword: boolean; setShowPassword: (value: boolean) => void }) => (
  <label className="block text-sm font-bold">
    {label}
    <span className="relative mt-2 block"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" /><input type={showPassword ? 'text' : 'password'} required value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm font-semibold outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Create a secure password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 transition hover:text-indigo-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span>
  </label>
);

export default RegisterPage;