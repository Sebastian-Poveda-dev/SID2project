import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { token, user, isAuthenticated, login, logout } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isStudent = user?.role === 'STUDENT';

  return { token, user, isAuthenticated, isAdmin, isEmployee, isStudent, login, logout };
}
