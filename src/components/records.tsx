import { useEffect, useState } from 'react';
import { AlertCircle, FileText, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface ResumeRecord {
  id: number;
  filename: string;
  predicted_career: string;
  score: number;
  uploaded_at: string;
}

const Records = () => {
  const [records, setRecords] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/records`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load saved resume analyses.');
        return response.json();
      })
      .then(setRecords)
      .catch((recordsError: Error) => setError(recordsError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-4 w-4" /> Resume intelligence</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Saved resume analyses</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">Review previously analyzed resumes, predicted career paths, and quality scores.</p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading && <p className="flex items-center gap-2 p-6 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved analyses...</p>}
          {error && <p className="flex items-center gap-2 p-6 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> {error}</p>}
          {!loading && !error && records.length === 0 && <p className="p-6 text-sm text-slate-500">No resume analyses have been saved yet.</p>}
          {records.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60">
                  <tr><th className="px-6 py-4">Resume</th><th className="px-6 py-4">Predicted path</th><th className="px-6 py-4">Score</th><th className="px-6 py-4">Analyzed</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((record) => (
                    <tr key={record.id} className="text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60">
                      <td className="flex items-center gap-3 px-6 py-4 font-semibold"><FileText className="h-4 w-4 text-indigo-500" /> {record.filename}</td>
                      <td className="px-6 py-4">{record.predicted_career}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{record.score}/100</span></td>
                      <td className="px-6 py-4 text-slate-500">{record.uploaded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
