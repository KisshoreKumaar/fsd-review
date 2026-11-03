import { Link, NavLink } from 'react-router-dom';
import Logo from '../common/Logo.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/results', label: 'Results' },
  { to: '/login', label: 'Sign in' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 rounded-b-[20px] bg-brand-500 text-ink">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-8">
        <Logo />

        <Link
          to="/register"
          className="absolute left-1/2 top-0 hidden -translate-x-1/2 rounded-b-[20px] bg-ink px-9 pb-3 pt-4
            font-wide text-[11px] font-medium uppercase tracking-[0.14em] text-brand-500 ring-1 ring-brand-500
            transition hover:text-brand-300 sm:block"
        >
          Apply now
        </Link>

        <nav className="ml-auto flex items-center gap-4 text-sm sm:gap-7">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `underline-offset-4 hover:underline ${isActive ? 'underline' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
