import { Outlet, Link, useNavigate } from 'react-router-dom';
import { CalendarDays, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PublicLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/events" className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            UniPlan
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/events"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Eventos
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white text-center text-xs text-gray-400 py-4">
        © {new Date().getFullYear()} UniPlan — Gestión de Eventos Universitarios
      </footer>
    </div>
  );
}
