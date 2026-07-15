const AdminDashboard = () => (
  <div className="min-h-screen bg-slate-50 px-6 py-12 dark:bg-slate-950">
    <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Admin workspace</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Platform Administration</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">Admin routing is ready. User management, moderation, audit logs, and platform analytics can be added here without touching job-seeker or recruiter workflows.</p>
    </div>
  </div>
);

export default AdminDashboard;
