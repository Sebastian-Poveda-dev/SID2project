import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CalendarDays, X } from 'lucide-react';
import type { RegistrationResponse, RegistrationStatus, EventType } from '../types/event';
import { fetchMyRegistrations, cancelRegistration } from '../features/registrations/services/registrationService';

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

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WORKSHOP: 'Taller',
  TALK: 'Charla',
  SPORTS_TOURNAMENT: 'Torneo deportivo',
  VOLUNTEER: 'Voluntariado',
  OTHER: 'Otro',
};

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRegistrations(await fetchMyRegistrations());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inscripciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCancel(eventId: number) {
    setCancelling(eventId);
    try {
      await cancelRegistration(eventId);
      setRegistrations((prev) =>
        prev.map((r) =>
          r.eventId === eventId ? { ...r, registrationStatus: 'CANCELLED' } : r
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar.');
    } finally {
      setCancelling(null);
    }
  }

  const active = registrations.filter((r) => r.registrationStatus === 'REGISTERED');
  const past = registrations.filter((r) => r.registrationStatus !== 'REGISTERED');

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mis inscripciones</h1>

      {loading && <p className="text-sm text-gray-400 py-10 text-center">Cargando…</p>}

      {!loading && error && (
        <p className="text-sm text-red-500 py-10 text-center">
          {error}{' '}
          <button onClick={load} className="underline text-indigo-600">Reintentar</button>
        </p>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tienes inscripciones registradas.</p>
        </div>
      )}

      {!loading && !error && active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Activas ({active.length})
          </h2>
          <div className="flex flex-col gap-3">
            {active.map((reg) => (
              <div
                key={reg.eventId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/events/${reg.eventId}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                  >
                    {reg.eventTitle}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{EVENT_TYPE_LABELS[reg.eventType]}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(reg.eventStartDateTime).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[reg.registrationStatus]}`}>
                    {STATUS_LABELS[reg.registrationStatus]}
                  </span>
                  <button
                    onClick={() => handleCancel(reg.eventId)}
                    disabled={cancelling === reg.eventId}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    {cancelling === reg.eventId ? 'Cancelando…' : 'Cancelar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Historial
          </h2>
          <div className="flex flex-col gap-3">
            {past.map((reg) => (
              <div
                key={reg.eventId}
                className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 opacity-70"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{reg.eventTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {EVENT_TYPE_LABELS[reg.eventType]}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[reg.registrationStatus]}`}>
                  {STATUS_LABELS[reg.registrationStatus]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
