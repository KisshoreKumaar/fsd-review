import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';
import { formatDateTime } from '../../utils/format.js';

export default function NotificationBell() {
  const { notifications, unread, readOne, readAll, connected } = useSocket();
  const { user } = useAuth();
  const allHref = user?.role === ROLES.APPLICANT ? '/app/notifications' : '/admin/notifications';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 hover:bg-ink/10"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-brand-500">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <span
          className={`absolute bottom-1 right-1.5 h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-700' : 'bg-ink/30'}`}
          title={connected ? 'Live updates on' : 'Reconnecting…'}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-3 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white text-ink shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unread > 0 && (
              <button onClick={readAll} className="text-xs font-medium text-brand-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Nothing yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && readOne(n._id)}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50
                    ${n.isRead ? 'opacity-60' : ''}`}
                >
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>

          <Link
            to={allHref}
            onClick={() => setOpen(false)}
            className="block bg-ink px-4 py-3 text-center font-wide text-[10px] font-medium uppercase tracking-[0.12em] text-brand-500 hover:text-brand-300"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
