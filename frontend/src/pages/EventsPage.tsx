import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { EventSummary, EventType } from '../types/event';
import { useEvents } from '../features/events/hooks/useEvents';
import EventFilters, { type TypeFilter, type StatusFilter } from '../features/events/components/EventFilters';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WORKSHOP: 'Taller',
  TALK: 'Charla',
  SPORTS_TOURNAMENT: 'Torneo deportivo',
  VOLUNTEER: 'Voluntariado',
  OTHER: 'Otro',
};

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  WORKSHOP: 'bg-blue-100 text-blue-700',
  TALK: 'bg-purple-100 text-purple-700',
  SPORTS_TOURNAMENT: 'bg-green-100 text-green-700',
  VOLUNTEER: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

function EventCard({ event }: { event: EventSummary }) {
  const formattedDate = new Date(event.startDateTime).toLocaleDateString('es-CO', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-snug">{event.title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${EVENT_TYPE_COLORS[event.eventType]}`}>
          {EVENT_TYPE_LABELS[event.eventType]}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4" />{formattedDate}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />{event.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />{event.availableSlots} cupos disponibles
        </span>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [typeFilter, setTypeFilter]     = useState<TypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PUBLISHED');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');

  const { events, loading, error, retry } = useEvents({
    eventType:  typeFilter  !== 'ALL' ? typeFilter  : undefined,
    status:     statusFilter !== 'ALL' ? statusFilter : undefined,
    startDate:  startDate ? startDate + ':00' : undefined,
    endDate:    endDate   ? endDate   + ':00' : undefined,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos disponibles</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Explora los eventos universitarios y encuentra algo de tu interés.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <EventFilters
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          onTypeChange={setTypeFilter}
          onStatusChange={setStatusFilter}
          totalCount={events.length}
          filteredCount={events.length}
        />

        {/* Date range */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Desde
            </span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Hasta
            </span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline pb-1.5"
              >
                Limpiar fechas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">Cargando eventos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20 text-red-400">
          <p className="text-sm mb-3">{error}</p>
          <button onClick={retry} className="text-indigo-600 text-sm underline">Reintentar</button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay eventos que coincidan con los filtros seleccionados.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
