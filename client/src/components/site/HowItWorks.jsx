const STEPS = [
  { n: '01', title: 'Register', body: 'Create an account and verify your email with a one-time code.' },
  { n: '02', title: 'Apply', body: 'Five short steps — personal, address, academics, preferences, review. Saved as you go.' },
  { n: '03', title: 'Upload & pay', body: 'Add marksheets, photo and signature, then pay the ₹750 fee online.' },
  { n: '04', title: 'Track', body: 'Watch verification happen live and see your merit rank the day it is published.' },
];

export default function HowItWorks() {
  return (
    <section className="bg-cream px-4 py-20 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="display text-4xl sm:text-6xl">One Portal, Start To Seat</h2>
          <p className="mt-6 max-w-sm text-slate-700">
            Every applicant follows the same transparent path, and every decision along it is recorded with a date
            and a reason.
          </p>
        </div>
        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t border-ink pt-5">
              <p className="font-wide text-3xl font-medium text-brand-500">{s.n}</p>
              <h3 className="eyebrow mt-4 text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
