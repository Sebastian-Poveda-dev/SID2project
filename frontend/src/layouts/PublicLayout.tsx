import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar>
        <Link
          to="/events"
          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100"
        >
          Eventos
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100"
            >
              {user?.username}
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100"
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </Link>
            <Button
              size="sm"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          </>
        )}
      </Navbar>

      <main className="flex-1">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} UniPlan — Gestión de Eventos Universitarios
      </footer>
    </div>
  );
}
