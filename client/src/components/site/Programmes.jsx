import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';
import Skeleton from '../common/Skeleton.jsx';

/** Orange cards with wide uppercase titles — the template's "expertise" grid. */
export default function Programmes({ courses }) {
  return (
    <section className="bg-sand px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="display text-4xl sm:text-6xl">Programmes On Offer</h2>
        <p className="mt-5 max-w-lg text-slate-700">
          Undergraduate and postgraduate programmes for the 2026–27 cycle. Seats, eligibility and category cut-offs
          update live as the admission round progresses.
        </p>

        {courses === null ? (
          <div className="mt-10"><Skeleton.Cards count={6} /></div>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <article key={c.id} className="flex flex-col rounded-[20px] bg-brand-500 p-6 text-ink">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-wide text-[15px] font-medium uppercase leading-snug">{c.name}</h3>
                  <span className="eyebrow shrink-0 rounded-full bg-ink px-2.5 py-1 text-[9px] text-brand-500">
                    {c.degreeLevel}
                  </span>
                </div>
                <p className="mt-6 text-sm">
                  {c.department} · {c.durationYears} years · minimum {c.eligibility?.minPercentage}% in the qualifying
                  exam.
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="eyebrow text-[9px] text-ink/70">Seats left</dt>
                    <dd className="text-2xl font-medium tracking-display">{c.totalSeats - c.seatsFilled}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-[9px] text-ink/70">Cut-off (Gen)</dt>
                    <dd className="text-2xl font-medium tracking-display">{c.cutOff?.general}%</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-6">
                  <Link to="/register">
                    <Button variant="dark" size="sm">Apply now</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
