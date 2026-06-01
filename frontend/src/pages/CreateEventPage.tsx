import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import type { EventType } from '../types/event';
import { createEvent } from '../features/events/services/eventService';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'TALK', label: 'Charla' },
  { value: 'WORKSHOP', label: 'Taller' },
  { value: 'SPORTS_TOURNAMENT', label: 'Torneo deportivo' },
  { value: 'VOLUNTEER', label: 'Voluntariado' },
  { value: 'OTHER', label: 'Otro' },
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventType: '' as EventType | '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    maxCapacity: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eventType) { setError('Selecciona un tipo de evento.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createEvent({
        title: form.title,
        description: form.description,
        eventType: form.eventType as EventType,
        startDateTime: form.startDateTime + ':00',
        endDateTime: form.endDateTime + ':00',
        location: form.location,
        maxCapacity: Number(form.maxCapacity),
      });
      navigate('/manage-events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">Crear nuevo evento</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              name="title" required value={form.title} onChange={handleChange}
              placeholder="Nombre del evento"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Describe el evento…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
            <select
              name="eventType" required value={form.eventType} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Selecciona un tipo…</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input
                type="datetime-local" name="startDateTime" required
                value={form.startDateTime} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
              <input
                type="datetime-local" name="endDateTime" required
                value={form.endDateTime} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input
              name="location" required value={form.location} onChange={handleChange}
              placeholder="Aula 301, Bloque B…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad máxima</label>
            <input
              type="number" name="maxCapacity" required min={1}
              value={form.maxCapacity} onChange={handleChange}
              placeholder="50"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-2" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear evento'}
          </Button>
        </form>
      </div>
    </div>
  );
}
