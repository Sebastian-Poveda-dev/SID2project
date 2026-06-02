import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Settings, CalendarDays, PlusCircle } from 'lucide-react';
import type { EventSummary, EventType, EventStatus } from '../types/event';
import { fetchMyEvents, fetchEvents, deleteEvent, publishEvent } from '../features/events/services/eventService';
import { useAuthStore } from '../store/authStore';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WORKSHOP: 'Taller',
  TALK: 'Charla',
  SPORTS_TOURNAMENT: 'Torneo deportivo',
  VOLUNTEER: 'Voluntariado',
  OTHER: 'Otro',
};

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ONGOING: 'En curso',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-500',
  PUBLISHED: 'bg-green-100 text-green-700',
  ONGOING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [publishing, setPublishing] = useState<number | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(isAdmin ? await fetchEvents() : await fetchMyEvents());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  async function handlePublish(event: EventSummary) {
    setPublishing(event.id);
    try {
      await publishEvent(event.id);
      setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, status: 'PUBLISHED' } : e));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al publicar el evento.');
    } finally {
      setPublishing(null);
    }
  }

  async function handleDelete(event: EventSummary) {
    if (!confirm(`¿Eliminar "${event.title}"? Esta acción cancelará todas las inscripciones y no se puede deshacer.`)) return;
    setDeleting(event.id);
    try {
      await deleteEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el evento.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">
            {isAdmin ? 'Todos los eventos' : 'Gestionar eventos'}
          </h1>
        </div>
        <Link
          to="/create-event"
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo evento
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-400 py-10 text-center">Cargando eventos…</p>}

      {!loading && error && (
        <div className="text-sm text-red-500 py-10 text-center">
          {error} <button onClick={load} className="underline ml-2 text-indigo-600">Reintentar</button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tienes eventos creados.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cupos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="px-4 py-3 text-gray-500">{EVENT_TYPE_LABELS[event.eventType]}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(event.startDateTime).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{event.availableSlots}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status]}`}>
                      {STATUS_LABELS[event.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/events/${event.id}`} className="text-indigo-600 hover:underline text-xs">
                        Ver
                      </Link>
                      <Link to={`/manage-events/${event.id}/registrants`} className="text-emerald-600 hover:underline text-xs">
                        Inscritos
                      </Link>
                      {event.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(event)}
                          disabled={publishing === event.id}
                          className="text-green-600 hover:text-green-800 text-xs disabled:opacity-50"
                        >
                          {publishing === event.id ? 'Publicando…' : 'Publicar'}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(event)}
                        disabled={deleting === event.id}
                        className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                      >
                        {deleting === event.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
