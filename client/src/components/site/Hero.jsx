import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';

const STEPS = [
  { label: 'Submitted', done: true },
  { label: 'Under review', done: true },
  { label: 'Verified', done: true },
  { label: 'Shortlisted', current: true },
  { label: 'Admitted' },
];

/** Split hero: cream copy on the left, an ink "live status" composition on the right. */
export default function Hero() {
  return (
    <section className="grid lg:min-h-[560px] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-14 sm:px-8 lg:px-14">
        <p className="eyebrow text-brand-600">Admission cycle 2026–27</p>
        <h1 className="display mt-5 text-5xl sm:text-6xl xl:text-7xl">
          Admission That Moves At Your Pace
        </h1>
        <p className="mt-6 max-w-md text-base text-slate-700">
          Apply online, upload your certificates once, pay the fee securely and follow every step to your seat —
          without a single trip to campus.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register">
            <Button size="lg">Start your application</Button>
          </Link>
          <Link to="/results">
            <Button size="lg" variant="secondary">View results</Button>
          </Link>
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden bg-ink" aria-hidden>
        <div className="absolute -right-24 -top-28 h-[440px] w-[440px] rounded-full bg-brand-500" />
        <div className="absolute -bottom-40 -left-20 h-[360px] w-[360px] rounded-full border border-cream/15" />

        <div className="absolute right-8 top-10 rounded-2xl bg-ink px-6 py-5 text-cream ring-1 ring-cream/10 sm:right-14">
          <p className="eyebrow text-brand-500">Merit rank</p>
          <p className="mt-1 text-5xl font-medium tracking-display">#12</p>
          <p className="mt-1 text-xs text-cream/60">Score 91.40 · seat allotted</p>
        </div>

        <div className="absolute bottom-8 left-6 right-6 rounded-2xl bg-cream p-6 text-ink shadow-2xl sm:left-12 sm:right-auto sm:w-[340px]">
          <p className="eyebrow text-slate-500">Sample application</p>
          <p className="mt-1 text-lg font-semibold">ADM2026000147</p>
          <ol className="mt-4 space-y-2.5">
            {STEPS.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold
                    ${s.done ? 'bg-ink text-brand-500' : s.current ? 'bg-brand-500 text-ink' : 'border border-slate-300'}`}
                >
                  {s.done ? '✓' : ''}
                </span>
                <span className={s.done || s.current ? 'font-medium' : 'text-slate-400'}>{s.label}</span>
                {s.current && <span className="eyebrow ml-auto text-[9px] text-brand-600">Live</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
