import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Tag, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import type { EventDetail, EventType } from '../types/event';

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

  const event = null as EventDetail | null;

  if (!event) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Cargando evento #{id}…</p>
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

        <div className="mt-8 flex gap-3">
          <Button>Inscribirse al evento</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
