import { User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Estudiante',
  EMPLOYEE: 'Empleado',
  ADMIN: 'Administrador',
};

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mi perfil</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{user?.username}</p>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              {user?.role ? ROLE_LABELS[user.role] ?? user.role : '—'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-400 italic">
          La información detallada del perfil estará disponible próximamente.
        </p>
      </div>
    </div>
  );
}
