import { ClipboardList } from 'lucide-react';
import type { RegistrationResponse, RegistrationStatus } from '../types/event';

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  REGISTERED: 'Inscrito',
  CANCELLED: 'Cancelado',
  ATTENDED: 'Asistió',
  NO_SHOW: 'No asistió',
};

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  REGISTERED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  ATTENDED: 'bg-green-100 text-green-700',
  NO_SHOW: 'bg-red-100 text-red-600',
};

export default function MyRegistrationsPage() {
  const registrations: RegistrationResponse[] = [];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mis inscripciones</h1>

      {registrations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tienes inscripciones registradas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registrations.map((reg) => (
            <div
              key={`${reg.eventId}-${reg.studentId}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">Evento #{reg.eventId}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(reg.registrationDate).toLocaleDateString('es-CO')}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[reg.registrationStatus]}`}
              >
                {STATUS_LABELS[reg.registrationStatus]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
