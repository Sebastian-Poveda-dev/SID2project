import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Users } from 'lucide-react';
import type { RegistrationDetail, RegistrationStatus } from '../types/event';
import {
  fetchEventRegistrants,
  downloadRegistrantsCsv,
} from '../features/registrations/services/registrationService';

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  REGISTERED: 'Inscrito',
  CANCELLED:  'Cancelado',
  ATTENDED:   'Asistió',
  NO_SHOW:    'No asistió',
};

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  REGISTERED: 'bg-blue-100 text-blue-700',
  CANCELLED:  'bg-gray-100 text-gray-500',
  ATTENDED:   'bg-green-100 text-green-700',
  NO_SHOW:    'bg-red-100 text-red-600',
};

export default function EventRegistrantsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const id = Number(eventId);

  const [registrants, setRegistrants] = useState<RegistrationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRegistrants(await fetchEventRegistrants(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inscritos.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadRegistrantsCsv(id, `evento-${id}`);
    } catch {
      alert('No se pudo exportar el CSV. Intenta de nuevo.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/manage-events"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Inscritos — Evento #{id}
            </h1>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || loading || registrants.length === 0}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm text-gray-400 py-10 text-center">Cargando inscritos…</p>
      )}

      {!loading && error && (
        <p className="text-sm text-red-500 py-10 text-center">
          {error}{' '}
          <button onClick={load} className="underline text-indigo-600">
            Reintentar
          </button>
        </p>
      )}

      {!loading && !error && registrants.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Este evento no tiene inscritos aún.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && registrants.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-3">
            {registrants.length} inscrito{registrants.length !== 1 ? 's' : ''}
          </p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre completo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Código estudiantil</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Correo institucional</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha inscripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrants.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {r.institutionalStudentId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.institutionalEmail ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[r.registrationStatus]}`}>
                        {STATUS_LABELS[r.registrationStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.registrationDate).toLocaleString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
