import { PlusCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import type { EventType } from '../types/event';

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'WORKSHOP', label: 'Taller' },
  { value: 'TALK', label: 'Charla' },
  { value: 'SPORTS_TOURNAMENT', label: 'Torneo deportivo' },
  { value: 'VOLUNTEER', label: 'Voluntariado' },
  { value: 'OTHER', label: 'Otro' },
];

export default function CreateEventPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">Crear nuevo evento</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7">
        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              placeholder="Nombre del evento"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              placeholder="Describe el evento…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="">Selecciona un tipo…</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input
              type="text"
              placeholder="Aula 301, Bloque B…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad máxima
            </label>
            <input
              type="number"
              min={1}
              placeholder="50"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <p className="text-xs text-gray-400 italic">
            Los campos dinámicos por tipo de evento estarán disponibles próximamente.
          </p>

          <Button type="submit" className="mt-2">
            Crear evento
          </Button>
        </form>
      </div>
    </div>
  );
}
