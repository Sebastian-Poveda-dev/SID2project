import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  User,
  ClipboardList,
  PlusCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: Array<'STUDENT' | 'EMPLOYEE' | 'ADMIN'>;
}

const sidebarLinks: SidebarLink[] = [
  { to: '/profile', label: 'Mi perfil', icon: <User className="w-4 h-4" /> },
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
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleLinks = sidebarLinks.filter(
    (link) => !link.roles || (user && link.roles.includes(user.role as 'STUDENT' | 'EMPLOYEE' | 'ADMIN'))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/events" className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            UniPlan
          </NavLink>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.username}{' '}
              <span className="text-xs text-indigo-500 font-medium">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 py-6 px-3 flex-shrink-0">
          <nav className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 px-8 py-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
