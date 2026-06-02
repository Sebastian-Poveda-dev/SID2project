import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Tag, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import type { EventType } from '../types/event';
import { useEvent } from '../features/events/hooks/useEvent';
import { registerForEvent, cancelRegistration, fetchMyRegistrations } from '../features/registrations/services/registrationService';
import { useAuthStore } from '../store/authStore';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WORKSHOP: 'Taller',
  TALK: 'Charla',
  SPORTS_TOURNAMENT: 'Torneo deportivo',
  VOLUNTEER: 'Voluntariado',
  OTHER: 'Otro',
};

interface DynamicDataSectionProps {
  data: Record<string, unknown>;
}

function DynamicDataSection({ data }: DynamicDataSectionProps) {
  if (Object.keys(data).length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Información adicional</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
            <p className="text-sm text-gray-800 font-medium">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, loading, error, retry } = useEvent(id ? Number(id) : undefined);
  const { user } = useAuthStore();
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'STUDENT' || !event) return;
    fetchMyRegistrations()
      .then((regs) => setIsRegistered(regs.some((r) => r.eventId === event.id && r.registrationStatus === 'REGISTERED')))
      .catch(() => setIsRegistered(false));
  }, [event, user]);

  async function handleRegister() {
    if (!event) return;
    setRegistering(true);
    setActionError(null);
    try {
      await registerForEvent(event.id);
      setIsRegistered(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al inscribirse.');
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancel() {
    if (!event) return;
    setCancelling(true);
    setActionError(null);
    try {
      await cancelRegistration(event.id);
      setIsRegistered(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al cancelar.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Cargando evento…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20 text-red-400">
        <p className="text-sm mb-3">{error ?? 'Evento no encontrado.'}</p>
        <button onClick={retry} className="text-indigo-600 text-sm underline mr-4">Reintentar</button>
        <button onClick={() => navigate(-1)} className="text-gray-500 text-sm underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full whitespace-nowrap">
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">{event.description}</p>

        <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {new Date(event.startDateTime).toLocaleString('es-CO')} —{' '}
            {new Date(event.endDateTime).toLocaleString('es-CO')}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {event.availableSlots} cupos disponibles de {event.maxCapacity}
          </span>
          {event.tags && event.tags.length > 0 && (
            <span className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4" />
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>

        {event.dynamicData && <DynamicDataSection data={event.dynamicData} />}

        {isRegistered === true && (
          <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Estás inscrito en este evento.
          </div>
        )}

        {actionError && (
          <div className="mt-6 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
            {actionError}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {user?.role === 'STUDENT' && isRegistered === false && (
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? 'Inscribiendo…' : 'Inscribirse al evento'}
            </Button>
          )}
          {user?.role === 'STUDENT' && isRegistered === true && (
            <Button variant="secondary" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando…' : 'Cancelar inscripción'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
