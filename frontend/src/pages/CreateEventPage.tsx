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

const input = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

interface DynamicFields {
  // TALK
  speaker?: string;
  affiliation?: string;
  streamingLinks?: string;
  // WORKSHOP
  minimumSemester?: string;
  requiredCourse?: string;
  requiredMaterials?: string;
  // SPORTS_TOURNAMENT
  sportType?: string;
  teamCount?: string;
  bracketType?: string;
  rules?: string;
  // VOLUNTEER
  beneficiaryCause?: string;
  requiredHours?: string;
  meetingPoints?: string;
}

function buildDynamicData(type: EventType, d: DynamicFields): Record<string, unknown> | undefined {
  switch (type) {
    case 'TALK':
      return {
        speaker: d.speaker ?? '',
        affiliation: d.affiliation ?? '',
        ...(d.streamingLinks ? { streamingLinks: d.streamingLinks.split(',').map((s) => s.trim()).filter(Boolean) } : {}),
      };
    case 'WORKSHOP':
      return {
        requiredMaterials: d.requiredMaterials ? d.requiredMaterials.split(',').map((s) => s.trim()).filter(Boolean) : [],
        minimumSemester: Number(d.minimumSemester ?? 1),
        ...(d.requiredCourse ? { requiredCourse: d.requiredCourse } : {}),
      };
    case 'SPORTS_TOURNAMENT':
      return {
        sportType: d.sportType ?? '',
        teamCount: Number(d.teamCount ?? 0),
        bracketType: d.bracketType ?? '',
        ...(d.rules ? { rules: d.rules } : {}),
      };
    case 'VOLUNTEER':
      return {
        beneficiaryCause: d.beneficiaryCause ?? '',
        requiredHours: Number(d.requiredHours ?? 0),
        ...(d.meetingPoints ? { meetingPoints: d.meetingPoints.split(',').map((s) => s.trim()).filter(Boolean) } : {}),
      };
    default:
      return undefined;
  }
}

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

  const [dynamic, setDynamic] = useState<DynamicFields>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name in dynamic || ['speaker','affiliation','streamingLinks','minimumSemester','requiredCourse',
      'requiredMaterials','sportType','teamCount','bracketType','rules','beneficiaryCause',
      'requiredHours','meetingPoints'].includes(name)) {
      setDynamic((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (name === 'eventType') {
      setForm((prev) => ({ ...prev, eventType: value as EventType | '' }));
      setDynamic({});
    }
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
        dynamicData: buildDynamicData(form.eventType as EventType, dynamic),
      });
      navigate('/manage-events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el evento.');
    } finally {
      setSubmitting(false);
    }
  }

  const type = form.eventType;

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
            <input name="title" required value={form.title} onChange={handleChange}
              placeholder="Nombre del evento" className={input} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Describe el evento…"
              className={`${input} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
            <select name="eventType" required value={form.eventType} onChange={handleChange}
              className={`${input} bg-white`}>
              <option value="">Selecciona un tipo…</option>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input type="datetime-local" name="startDateTime" required
                value={form.startDateTime} onChange={handleChange} className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
              <input type="datetime-local" name="endDateTime" required
                value={form.endDateTime} onChange={handleChange} className={input} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
            <input name="location" required value={form.location} onChange={handleChange}
              placeholder="Aula 301, Bloque B…" className={input} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad máxima</label>
            <input type="number" name="maxCapacity" required min={1}
              value={form.maxCapacity} onChange={handleChange} placeholder="50" className={input} />
          </div>

          {/* ── Campos dinámicos por tipo ──────────────────────────────────── */}

          {type === 'TALK' && (
            <fieldset className="border border-indigo-100 rounded-lg p-4 flex flex-col gap-4">
              <legend className="text-xs font-semibold text-indigo-600 px-1">Datos de la charla</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ponente <span className="text-red-500">*</span></label>
                <input name="speaker" required value={dynamic.speaker ?? ''} onChange={handleChange}
                  placeholder="Nombre del ponente" className={input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Afiliación <span className="text-red-500">*</span></label>
                <input name="affiliation" required value={dynamic.affiliation ?? ''} onChange={handleChange}
                  placeholder="Universidad / empresa" className={input} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Links de streaming <span className="text-gray-400 font-normal">(separados por coma)</span>
                </label>
                <input name="streamingLinks" value={dynamic.streamingLinks ?? ''} onChange={handleChange}
                  placeholder="https://meet.example.com/charla" className={input} />
              </div>
            </fieldset>
          )}

          {type === 'WORKSHOP' && (
            <fieldset className="border border-indigo-100 rounded-lg p-4 flex flex-col gap-4">
              <legend className="text-xs font-semibold text-indigo-600 px-1">Datos del taller</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materiales requeridos <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal"> (separados por coma)</span>
                </label>
                <input name="requiredMaterials" required value={dynamic.requiredMaterials ?? ''} onChange={handleChange}
                  placeholder="Cuaderno, esfero, ropa cómoda" className={input} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semestre mínimo <span className="text-red-500">*</span></label>
                  <input type="number" name="minimumSemester" required min={1} max={10}
                    value={dynamic.minimumSemester ?? ''} onChange={handleChange}
                    placeholder="1" className={input} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia requerida <span className="text-gray-400 font-normal">(código)</span>
                  </label>
                  <input name="requiredCourse" value={dynamic.requiredCourse ?? ''} onChange={handleChange}
                    placeholder="MAT101" className={input} />
                </div>
              </div>
            </fieldset>
          )}

          {type === 'SPORTS_TOURNAMENT' && (
            <fieldset className="border border-indigo-100 rounded-lg p-4 flex flex-col gap-4">
              <legend className="text-xs font-semibold text-indigo-600 px-1">Datos del torneo</legend>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deporte <span className="text-red-500">*</span></label>
                  <input name="sportType" required value={dynamic.sportType ?? ''} onChange={handleChange}
                    placeholder="Fútbol sala" className={input} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° de equipos <span className="text-red-500">*</span></label>
                  <input type="number" name="teamCount" required min={2}
                    value={dynamic.teamCount ?? ''} onChange={handleChange}
                    placeholder="8" className={input} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato <span className="text-red-500">*</span></label>
                <select name="bracketType" required value={dynamic.bracketType ?? ''} onChange={handleChange}
                  className={`${input} bg-white`}>
                  <option value="">Selecciona…</option>
                  <option value="Eliminación directa">Eliminación directa</option>
                  <option value="Round robin">Round robin</option>
                  <option value="Grupos + eliminación">Grupos + eliminación</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reglamento</label>
                <textarea name="rules" value={dynamic.rules ?? ''} onChange={handleChange}
                  rows={2} placeholder="Describe las reglas del torneo…"
                  className={`${input} resize-none`} />
              </div>
            </fieldset>
          )}

          {type === 'VOLUNTEER' && (
            <fieldset className="border border-indigo-100 rounded-lg p-4 flex flex-col gap-4">
              <legend className="text-xs font-semibold text-indigo-600 px-1">Datos del voluntariado</legend>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Causa beneficiaria <span className="text-red-500">*</span></label>
                <input name="beneficiaryCause" required value={dynamic.beneficiaryCause ?? ''} onChange={handleChange}
                  placeholder="Reforestación del campus universitario" className={input} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas requeridas <span className="text-red-500">*</span></label>
                  <input type="number" name="requiredHours" required min={0}
                    value={dynamic.requiredHours ?? ''} onChange={handleChange}
                    placeholder="0" className={input} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos de encuentro <span className="text-gray-400 font-normal">(coma)</span>
                  </label>
                  <input name="meetingPoints" value={dynamic.meetingPoints ?? ''} onChange={handleChange}
                    placeholder="Portería norte, Bloque A" className={input} />
                </div>
              </div>
            </fieldset>
          )}

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
