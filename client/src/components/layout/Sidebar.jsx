import { NavLink } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';

const APPLICANT_LINKS = [
  { to: '/app', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/app/application', label: 'My application', icon: '📝' },
  { to: '/app/documents', label: 'Documents', icon: '📎' },
  { to: '/app/payment', label: 'Fee payment', icon: '💳' },
  { to: '/app/status', label: 'Status & result', icon: '📈' },
  { to: '/app/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/app/account', label: 'Account', icon: '🔑' },
];

const STAFF_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/applications', label: 'Applications', icon: '🗂️' },
  { to: '/admin/courses', label: 'Courses', icon: '🎓', adminOnly: true },
  { to: '/admin/cutoffs', label: 'Cut-offs', icon: '🎯', adminOnly: true },
  { to: '/admin/merit', label: 'Merit lists', icon: '🏅', adminOnly: true },
  { to: '/admin/officers', label: 'Officers', icon: '👥', adminOnly: true },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/admin/account', label: 'Account', icon: '🔑' },
];

export default function Sidebar({ role, open, onClose }) {
  const links = (role === ROLES.APPLICANT ? APPLICANT_LINKS : STAFF_LINKS).filter(
    (l) => !l.adminOnly || role === ROLES.ADMIN,
  );

  return (
    <>
      {open && <button className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={onClose} aria-label="Close menu" />}
      <aside
        className={`fixed z-20 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto bg-cream
          px-3 py-4 transition-transform lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition
                 ${isActive ? 'bg-ink font-medium text-cream' : 'text-slate-700 hover:bg-sand'}`
              }
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-8 px-4 text-xs leading-relaxed text-slate-500">
          Admission cycle 2026–27
          <br />
          Need help? admissions@college.test
        </p>
      </aside>
    </>
  );
}
