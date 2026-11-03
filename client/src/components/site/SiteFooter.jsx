import { Link } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

const COLUMNS = [
  { title: 'Office', lines: ['Admission Office', 'Main Campus'] },
  { title: 'Contact', lines: ['admissions@college.test', '080-4000-1234'] },
  { title: 'Hours', lines: ['Mon – Fri · 9:00am – 5:00pm', 'Portal open 24/7'] },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-8">
        <p
          aria-hidden
          className="select-none text-center font-wide text-[11.5vw] font-semibold uppercase leading-none tracking-tight
            text-cream xl:text-[150px]"
        >
          Admissions
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Logo className="text-cream" />
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="eyebrow text-cream">{c.title}</h3>
              {c.lines.map((l) => (
                <p key={l} className="mt-2 text-sm text-cream/70">{l}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/15 py-6 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <div className="flex gap-6">
            <Link to="/results" className="hover:text-cream">Published results</Link>
            <Link to="/register" className="hover:text-cream">Apply</Link>
            <Link to="/login" className="hover:text-cream">Staff sign in</Link>
          </div>
          <p>© 2026 College Admissions · Online Admission Management System</p>
        </div>
      </div>
    </footer>
  );
}
