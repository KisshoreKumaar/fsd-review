import Logo from '../../components/common/Logo.jsx';

const POINTS = [
  'Apply online and keep a draft as you go',
  'Upload certificates once, track verification live',
  'Pay the fee securely with an instant receipt',
  'See your merit rank the moment it is published',
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-cream lg:flex">
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-brand-500" aria-hidden />
        <Logo className="relative text-cream" />
        <div className="relative">
          <h2 className="display text-6xl text-brand-500">One Portal For The Whole Admission Cycle</h2>
          <ul className="mt-10 divide-y divide-cream/15 border-y border-cream/15">
            {POINTS.map((p) => (
              <li key={p} className="py-3 text-sm text-cream/80">{p}</li>
            ))}
          </ul>
        </div>
        <p className="eyebrow relative text-cream/50">Admission cycle 2026–27 · Applications open</p>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-8 sm:px-10">
        <Logo className="lg:hidden" />
        <div className="m-auto w-full max-w-md py-10">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-slate-600">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
