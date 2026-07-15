import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Bookmark, Briefcase, Camera, FileText, Github, Globe, Linkedin, LogOut, Mail, MapPin, Phone, Save, Settings, Upload, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { readStore, subscribeToStore, type JobApplication, type MarketplaceJob } from '../services/recruitmentStore';

type ProfileForm = {
  phone: string;
  location: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  certifications: string;
  github: string;
  linkedin: string;
  portfolio: string;
  resumeName: string;
  resumeUrl: string;
  photoUrl: string;
};

const emptyForm: ProfileForm = {
  phone: '',
  location: '',
  skills: '',
  education: '',
  experience: '',
  projects: '',
  certifications: '',
  github: '',
  linkedin: '',
  portfolio: '',
  resumeName: '',
  resumeUrl: '',
  photoUrl: '',
};

const JobSeekerProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<MarketplaceJob[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMetadata = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setMessage('Profile opened, but Supabase user metadata could not be loaded.');
        }
        const metadata = data.user?.user_metadata || {};
        if (!active) return;
        setForm({
          phone: metadata.phone || '',
          location: metadata.location || '',
          skills: Array.isArray(metadata.skills) ? metadata.skills.join(', ') : metadata.skills || '',
          education: metadata.education || '',
          experience: metadata.experience || '',
          projects: metadata.projects || '',
          certifications: metadata.certifications || '',
          github: metadata.github || '',
          linkedin: metadata.linkedin || '',
          portfolio: metadata.portfolio || '',
          resumeName: metadata.resumeName || '',
          resumeUrl: metadata.resumeUrl || '',
          photoUrl: metadata.photoUrl || user?.avatar || '',
        });
      } catch {
        if (active) {
          setForm((current) => ({ ...current, photoUrl: current.photoUrl || user?.avatar || '' }));
          setMessage('Profile opened with placeholders because Supabase metadata is temporarily unavailable.');
        }
      }
    };

    loadMetadata();
    return () => {
      active = false;
    };
  }, [user?.avatar]);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const store = await readStore();
        const mine = store.applications.filter((application) => application.candidateEmail === user?.email);
        setApplications(mine);
        setSavedJobs(store.jobs.filter((job) => store.savedJobs[user?.email || '']?.includes(job.id)));
      } catch {
        setApplications([]);
        setSavedJobs([]);
      }
    };

    loadStore();
    return subscribeToStore(loadStore);
  }, [user?.email]);

  const scores = useMemo(() => {
    const latest = applications[0];
    return {
      resume: latest?.resumeScore || 0,
      ats: latest?.atsScore || 0,
      interview: 0,
    };
  }, [applications]);

  const updateField = (key: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const uploadFile = async (file: File, kind: 'resume' | 'photo') => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      const extension = file.name.split('.').pop();
      const path = `${user.id}/${kind}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from('resumes').getPublicUrl(path);
      setForm((current) => ({
        ...current,
        [kind === 'resume' ? 'resumeUrl' : 'photoUrl']: data.publicUrl,
        ...(kind === 'resume' ? { resumeName: file.name } : {}),
      }));
      setMessage(`${kind === 'resume' ? 'Resume' : 'Photo'} uploaded. Click Save Profile to persist it.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const skills = form.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: form.phone,
          location: form.location,
          skills,
          education: form.education,
          experience: form.experience,
          projects: form.projects,
          certifications: form.certifications,
          github: form.github,
          linkedin: form.linkedin,
          portfolio: form.portfolio,
          resumeName: form.resumeName,
          resumeUrl: form.resumeUrl,
          photoUrl: form.photoUrl,
        },
      });
      if (error) throw new Error(error.message);

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user?.id,
        email: user?.email,
        full_name: user?.name,
        role: user?.role,
        avatar_url: form.photoUrl || null,
        primary_resume_name: form.resumeName || null,
        primary_resume_path: form.resumeUrl || null,
      });
      if (profileError) {
        setMessage('Profile saved in Supabase Auth. Run the SQL schema to enable profile table persistence.');
        setSaving(false);
        return;
      }
      await refreshUser();
      setMessage('Profile saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-slate-950 p-8 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-4xl font-bold">
                {form.photoUrl ? <img src={form.photoUrl} alt="Profile" className="h-full w-full object-cover" /> : initials}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Profile</p>
                <h1 className="mt-2 text-4xl font-bold">{user?.name || "Navin's AI User"}</h1>
                <p className="mt-2 flex items-center gap-2 text-slate-300"><Mail className="h-4 w-4" /> {user?.email || 'Email not added'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="btn-secondary cursor-pointer bg-white/10 text-white hover:bg-white/20">
                <Camera className="h-4 w-4" /> Photo
                <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'photo')} />
              </label>
              <button onClick={logout} className="btn-secondary bg-white/10 text-white hover:bg-white/20"><LogOut className="h-4 w-4" /> Logout</button>
            </div>
          </div>
        </section>

        {message && <p className="rounded-2xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{message}</p>}

        <section className="grid gap-4 md:grid-cols-3">
          <ScoreCard label="Resume Score" value={scores.resume} />
          <ScoreCard label="ATS Score" value={scores.ats} />
          <ScoreCard label="Interview Score" value={scores.interview} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-bold"><UserRound className="h-5 w-5 text-indigo-500" /> Edit Profile</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field icon={Phone} label="Phone" value={form.phone} onChange={(value) => updateField('phone', value)} />
              <Field icon={MapPin} label="Location" value={form.location} onChange={(value) => updateField('location', value)} />
              <Field label="Skills" value={form.skills} onChange={(value) => updateField('skills', value)} placeholder="Add Skills" />
              <Field label="Education" value={form.education} onChange={(value) => updateField('education', value)} placeholder="Add Education" />
              <Field label="Experience" value={form.experience} onChange={(value) => updateField('experience', value)} placeholder="Add Experience" />
              <Field label="Certifications" value={form.certifications} onChange={(value) => updateField('certifications', value)} placeholder="Add Certifications" />
              <Field icon={Github} label="GitHub" value={form.github} onChange={(value) => updateField('github', value)} />
              <Field icon={Linkedin} label="LinkedIn" value={form.linkedin} onChange={(value) => updateField('linkedin', value)} />
              <Field icon={Globe} label="Portfolio" value={form.portfolio} onChange={(value) => updateField('portfolio', value)} />
            </div>
            <label className="mt-5 block text-sm font-semibold">Projects</label>
            <textarea value={form.projects} onChange={(event) => updateField('projects', event.target.value)} className="input mt-2 min-h-28" placeholder="Add Projects" />
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={saveProfile} disabled={saving} className="btn-primary"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}</button>
              <button onClick={() => setMessage('Settings are connected to your Supabase profile.')} className="btn-secondary"><Settings className="h-4 w-4" /> Settings</button>
            </div>
          </div>

          <aside className="space-y-6">
            <Panel title="Resume Upload" icon={Upload}>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <FileText className="h-10 w-10 text-indigo-500" />
                <span className="mt-3 font-semibold">{form.resumeName || 'Upload Resume'}</span>
                <span className="mt-1 text-sm text-slate-500">Stored in Supabase Storage</span>
                <input type="file" accept=".pdf" className="hidden" onChange={(event) => event.target.files?.[0] && uploadFile(event.target.files[0], 'resume')} />
              </label>
              {form.resumeUrl && <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex font-semibold text-indigo-600">Resume Preview</a>}
            </Panel>

            <Panel title="Profile Details" icon={UserRound}>
              <div className="space-y-3">
                <DisplayItem label="Skills" value={form.skills} empty="Add Skills" />
                <DisplayItem label="Education" value={form.education} empty="Add Education" />
                <DisplayItem label="Experience" value={form.experience} empty="Add Experience" />
                <DisplayItem label="Projects" value={form.projects} empty="Add Projects" />
                <DisplayItem label="Certifications" value={form.certifications} empty="Add Certifications" />
                <DisplayItem label="Phone" value={form.phone} empty="Add Phone" />
                <DisplayItem label="Location" value={form.location} empty="Add Location" />
                <DisplayItem label="Portfolio" value={form.portfolio || form.github || form.linkedin} empty="Add Portfolio" />
              </div>
            </Panel>

            <Panel title="Saved Jobs" icon={Bookmark}>
              {savedJobs.length === 0 ? <p className="text-sm text-slate-500">No saved jobs yet.</p> : savedJobs.map((job) => <p key={job.id} className="rounded-xl bg-slate-50 p-3 text-sm font-semibold dark:bg-slate-950">{job.title}</p>)}
            </Panel>

            <Panel title="Applied Jobs" icon={Briefcase}>
              {applications.length === 0 ? <p className="text-sm text-slate-500">You haven't applied for any jobs yet.</p> : applications.map((application) => <p key={application.id} className="rounded-xl bg-slate-50 p-3 text-sm font-semibold dark:bg-slate-950">{application.jobTitle} - {application.status}</p>)}
            </Panel>
          </aside>
        </section>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value, onChange, placeholder }: { icon?: typeof Phone; label: string; value: string; onChange: (value: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-semibold">{label}</label>
    <div className="relative mt-2">
      {Icon && <Icon className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder || label} className={`input ${Icon ? 'pl-11' : ''}`} />
    </div>
  </div>
);

const ScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-3 text-4xl font-bold text-indigo-600">{value || 'Pending'}</p>
  </div>
);

const DisplayItem = ({ label, value, empty }: { label: string; value: string; empty: string }) => (
  <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
    <p className="font-semibold text-slate-500">{label}</p>
    <p className="mt-1 font-semibold">{value || empty}</p>
  </div>
);

const Panel = ({ title, icon: Icon, children }: { title: string; icon: typeof Upload; children: ReactNode }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Icon className="h-5 w-5 text-indigo-500" /> {title}</h2>
    {children}
  </section>
);

export default JobSeekerProfilePage;
