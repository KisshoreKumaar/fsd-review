import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../constants/roles.js';

export default function Forbidden() {
  const { user } = useAuth();
  const home = user?.role === ROLES.APPLICANT ? '/app' : '/admin';

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-md p-8 text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="page-title mt-3">403 — Not your area</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your role ({user?.role || 'guest'}) cannot open that page.
        </p>
        <Link to={home} className="mt-5 inline-block text-sm font-medium text-brand-700 hover:underline">
          Go to your dashboard
        </Link>
      </div>
    </div>
  );
}
