import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABELS, ROLES } from '../../constants/roles.js';
import Logo from '../common/Logo.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const isApplicant = user?.role === ROLES.APPLICANT;
  const home = isApplicant ? '/app' : '/admin';
  const tab = isApplicant
    ? { to: '/app/application', label: 'My application' }
    : { to: '/admin/applications', label: 'Review queue' };

  return (
    <header className="sticky top-0 z-30 rounded-b-[20px] bg-brand-500 text-ink">
      <div className="relative flex h-14 items-center gap-3 px-3 sm:px-6">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-ink/10 lg:hidden"
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <Logo to={home} />

        {/* The template's hanging tab: a black pill attached to the bar's lower edge. */}
        <Link
          to={tab.to}
          className="absolute left-1/2 top-0 hidden -translate-x-1/2 rounded-b-[20px] bg-ink px-8 pb-3 pt-4
            font-wide text-[11px] font-medium uppercase tracking-[0.14em] text-brand-500 ring-1 ring-brand-500
            transition hover:text-brand-300 md:block"
        >
          {tab.label}
        </Link>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <NotificationBell />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">{user?.name}</p>
            <p className="text-xs text-ink/70">{ROLE_LABELS[user?.role] || ''}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-full px-3 py-1.5 font-wide text-[10px] font-medium uppercase tracking-[0.12em]
              underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
