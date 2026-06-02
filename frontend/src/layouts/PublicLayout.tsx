import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, CalendarDays, ClipboardList, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
    >
      {children}
    </Link>
  );
}

export default function PublicLayout() {
  const { isAuthenticated, isStudent, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar>
        <NavLink to="/events">
          <CalendarDays className="w-4 h-4" />
          Eventos
        </NavLink>

        {isAuthenticated ? (
          <>
            {isStudent && (
              <NavLink to="/my-registrations">
                <ClipboardList className="w-4 h-4" />
                Mis inscripciones
              </NavLink>
            )}

            <NavLink to="/profile">
              <User className="w-4 h-4" />
              {user?.username}
            </NavLink>

            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login">
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </NavLink>
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
