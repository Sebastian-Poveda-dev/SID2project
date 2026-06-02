import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from '../utils/tokenUtils';

export default function ProtectedRoute() {
  const { token, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  /* Expired token caught here as a safety net (store also checks on hydration) */
  if (isAuthenticated && token && isTokenExpired(token)) {
    logout();
    return <Navigate to="/login" state={{ from: location, reason: 'expired' }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
