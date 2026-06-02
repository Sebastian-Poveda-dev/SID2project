import { Outlet, useNavigate } from 'react-router-dom';
import {
  User,
  ClipboardList,
  PlusCircle,
  Settings,
  BarChart2,
  LogOut,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar, { type SidebarItem } from '../components/Sidebar';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    to: '/profile',
    label: 'Mi perfil',
    icon: <User className="w-4 h-4" />,
  },
  {
    to: '/my-registrations',
    label: 'Mis inscripciones',
    icon: <ClipboardList className="w-4 h-4" />,
    roles: ['STUDENT'],
  },
  {
    to: '/create-event',
    label: 'Crear evento',
    icon: <PlusCircle className="w-4 h-4" />,
    roles: ['EMPLOYEE', 'ADMIN'],
  },
  {
    to: '/manage-events',
    label: 'Gestionar eventos',
    icon: <Settings className="w-4 h-4" />,
    roles: ['EMPLOYEE', 'ADMIN'],
  },
  {
    to: '/statistics',
    label: 'Estadísticas',
    icon: <BarChart2 className="w-4 h-4" />,
    roles: ['EMPLOYEE', 'ADMIN'],
  },
];

const ROLE_LABELS: Record<string, string> = {
  STUDENT:  'Estudiante',
  EMPLOYEE: 'Empleado',
  ADMIN:    'Administrador',
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar>
        {/* User chip */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm text-zinc-600">{user?.username}</span>
          {user?.role && (
            <Badge variant="primary" size="sm">
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </Navbar>

      {/* Shell */}
      <div className="flex flex-1 mx-auto w-full max-w-screen-xl overflow-hidden">
        <Sidebar items={SIDEBAR_ITEMS} userRole={user?.role} />

        <main className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
