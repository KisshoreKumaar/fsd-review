import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../common/Spinner.jsx';
import { ROLES } from '../../constants/roles.js';

export default function ProtectedRoute({ roles }) {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Spinner label="Checking your session…" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />;

  // Accounts created with a temporary password must set their own first.
  const account = user.role === ROLES.APPLICANT ? '/app/account' : '/admin/account';
  if (user.mustChangePassword && location.pathname !== account) return <Navigate to={account} replace />;

  return <Outlet />;
}
