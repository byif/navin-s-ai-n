import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="bg-slate-950 py-16 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300"><Mail className="h-6 w-6" /></span>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300"><Sparkles className="h-4 w-4" /> Career insights</p>
        <h2 className="mt-3 text-3xl font-bold">Keep your career plan moving.</h2>
        <p className="mt-3 text-slate-300">Receive practical learning ideas, opportunities, and resume guidance.</p>
        {subscribed ? (
          <p className="mt-7 font-semibold text-emerald-300">Thanks for subscribing. You are on the list.</p>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); setSubscribed(true); setEmail(''); }} className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400" required />
            <button className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold transition hover:bg-indigo-400">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
