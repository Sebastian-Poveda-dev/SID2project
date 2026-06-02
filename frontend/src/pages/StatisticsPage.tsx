import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  Users,
  CalendarDays,
  Activity,
  Award,
  LayoutDashboard,
} from 'lucide-react';
import type { EventStatistics, StatisticsSummary, EventTypeStatistics, OrganizerPerformance } from '../types/statistics';
import type { EventSummary, EventType, EventStatus } from '../types/event';
import {
  fetchStatsByEvent,
  fetchPopularEvents,
  fetchOccupancyReport,
  fetchSummary,
  fetchByEventType,
  fetchOrganizerPerformance,
} from '../features/statistics/services/statisticsService';
import { fetchMyEvents, fetchEvents } from '../features/events/services/eventService';
import { useAuthStore } from '../store/authStore';

type Tab = 'summary' | 'byEvent' | 'byType' | 'organizers' | 'popular' | 'occupancy';

// ─── Labels ──────────────────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-500',
  PUBLISHED: 'bg-green-100 text-green-700',
  ONGOING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const ORGANIZER_TYPE_LABELS: Record<string, string> = {
  FACULTY_MEMBER: 'Docente',
  INSTRUCTOR: 'Instructor',
  STUDENT_LEADER: 'Lider estudiantil',
  WELLNESS_STAFF: 'Bienestar',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function occupancyBarColor(pct: number) {
  if (pct >= 80) return 'bg-red-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-emerald-500';
}

function occupancyTextColor(pct: number) {
  if (pct >= 80) return 'text-red-600';
  if (pct >= 50) return 'text-amber-600';
  return 'text-emerald-600';
}

function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

function OccupancyBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${occupancyBarColor(clamped)}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-12 text-right tabular-nums ${occupancyTextColor(clamped)}`}>
        {pct(clamped)}
      </span>
    </div>
  );
}

function RateBar({ value, colorClass }: { value: number; colorClass: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-semibold w-12 text-right tabular-nums text-gray-600">
        {pct(clamped)}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function LoadingState() {
  return <p className="text-sm text-gray-400 py-12 text-center">Cargando…</p>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <p className="text-sm text-red-500 py-12 text-center">
      {message}{' '}
      <button onClick={onRetry} className="underline text-indigo-600 ml-1">
        Reintentar
      </button>
    </p>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <span className="flex justify-center mb-2 opacity-40">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ─── Tab: Resumen global ──────────────────────────────────────────────────────

function SummaryTab() {
  const [data, setData] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchSummary());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resumen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const topEventTypeLabel = EVENT_TYPE_LABELS[data.topEventType as EventType] ?? data.topEventType;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total de eventos" value={data.totalEvents} />
        <StatCard
          label="Total inscripciones"
          value={data.totalRegistrations.toLocaleString('es-CO')}
        />
        <StatCard
          label="Tasa de asistencia"
          value={pct(data.globalAttendanceRate)}
          accent={data.globalAttendanceRate >= 60 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <StatCard
          label="Tasa de cancelación"
          value={pct(data.globalCancellationRate)}
          accent={data.globalCancellationRate >= 30 ? 'text-red-600' : 'text-gray-900'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Asistencias confirmadas" value={data.totalAttendances.toLocaleString('es-CO')} />
        <StatCard label="Ocupación promedio" value={pct(data.avgOccupancyPercentage)} />
        <StatCard label="Tipo más activo" value={topEventTypeLabel} sub="por inscripciones" />
      </div>

      {/* Events by status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-4">
          Eventos por estado
        </p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.eventsByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[status as EventStatus] ?? status}
              </span>
              <span className="text-sm font-bold text-gray-700">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Por evento ──────────────────────────────────────────────────────────

function ByEventTab({ isAdmin }: { isAdmin: boolean }) {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (isAdmin ? fetchEvents() : fetchMyEvents())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, [isAdmin]);

  const loadStats = useCallback(async (eventId: number) => {
    setStatsLoading(true);
    setError(null);
    setStats(null);
    try {
      setStats(await fetchStatsByEvent(eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setSelectedId(id || '');
    if (id) loadStats(id);
    else { setStats(null); setError(null); }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Selecciona un evento
        </label>
        <select
          value={selectedId}
          onChange={handleSelect}
          disabled={eventsLoading}
          className="block w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">— Elige un evento —</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} ({STATUS_LABELS[ev.status]})
            </option>
          ))}
        </select>
      </div>

      {statsLoading && <LoadingState />}
      {!statsLoading && error && <p className="text-sm text-red-500">{error}</p>}

      {stats && !statsLoading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Inscritos" value={stats.totalRegistered} />
            <StatCard label="Cancelaciones" value={stats.totalCancelled} />
            <StatCard label="Asistentes" value={stats.totalAttended} />
            <StatCard label="Ocupación" value={pct(stats.occupancyPercentage)} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              Ocupación visual
            </p>
            <OccupancyBar value={stats.occupancyPercentage} />
          </div>
          <p className="text-xs text-gray-400">
            Actualizado:{' '}
            {new Date(stats.lastUpdated).toLocaleString('es-CO', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Tab: Por tipo de evento ──────────────────────────────────────────────────

function ByTypeTab() {
  const [rows, setRows] = useState<EventTypeStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRows(await fetchByEventType()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (rows.length === 0) return <EmptyState icon={<Activity className="w-8 h-8" />} text="Sin datos por tipo aún." />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Tasas calculadas sobre eventos con inscripciones. Asistencia = asistentes / inscritos. Cancelación = cancelados / (inscritos + cancelados).
      </p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Eventos</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Inscritos</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[160px]">
                Tasa asistencia
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[160px]">
                Tasa cancelación
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.eventType} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {EVENT_TYPE_LABELS[row.eventType]}
                </td>
                <td className="px-4 py-3 text-gray-500">{row.totalEvents}</td>
                <td className="px-4 py-3 text-gray-700">{row.totalRegistered}</td>
                <td className="px-4 py-3 min-w-[160px]">
                  <RateBar value={row.attendanceRate} colorClass="bg-emerald-500" />
                </td>
                <td className="px-4 py-3 min-w-[160px]">
                  <RateBar value={row.cancellationRate} colorClass="bg-red-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Rendimiento de organizadores ───────────────────────────────────────

function OrganizersTab() {
  const [rows, setRows] = useState<OrganizerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRows(await fetchOrganizerPerformance()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (rows.length === 0) return <EmptyState icon={<Award className="w-8 h-8" />} text="Sin organizadores con actividad registrada." />;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        Ordenados por ocupación promedio descendente. Solo aparecen organizadores con al menos una inscripción en sus eventos.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Organizador</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Eventos</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Inscritos</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[160px]">
                Ocupación prom.
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[160px]">
                Asistencia prom.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={row.organizerId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{row.displayName}</td>
                <td className="px-4 py-3 text-gray-500">
                  {ORGANIZER_TYPE_LABELS[row.organizerType] ?? row.organizerType}
                </td>
                <td className="px-4 py-3 text-gray-500">{row.totalEvents}</td>
                <td className="px-4 py-3 text-gray-700">{row.totalRegistered}</td>
                <td className="px-4 py-3 min-w-[160px]">
                  <OccupancyBar value={row.avgOccupancyPercentage} />
                </td>
                <td className="px-4 py-3 min-w-[160px]">
                  <RateBar value={row.avgAttendanceRate} colorClass="bg-emerald-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Eventos populares ───────────────────────────────────────────────────

function PopularEventsTab() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setEvents(await fetchPopularEvents()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (events.length === 0) return <EmptyState icon={<TrendingUp className="w-8 h-8" />} text="Sin datos de popularidad aún." />;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Cupos</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {events.map((ev, idx) => (
            <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{ev.title}</td>
              <td className="px-4 py-3 text-gray-500">{EVENT_TYPE_LABELS[ev.eventType]}</td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(ev.startDateTime).toLocaleDateString('es-CO')}
              </td>
              <td className="px-4 py-3 text-gray-500">{ev.availableSlots}</td>
              <td className="px-4 py-3 text-right">
                <Link to={`/events/${ev.id}`} className="text-indigo-600 hover:underline text-xs">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Reporte de ocupación ────────────────────────────────────────────────

function OccupancyTab() {
  const [rows, setRows] = useState<EventStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRows(await fetchOccupancyReport()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (rows.length === 0) return <EmptyState icon={<Users className="w-8 h-8" />} text="Sin eventos registrados aún." />;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Inscritos</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Cancelados</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Asistentes</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[180px]">Ocupación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.eventId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/events/${row.eventId}`} className="text-indigo-600 hover:underline font-medium">
                  #{row.eventId}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-700">{row.totalRegistered}</td>
              <td className="px-4 py-3 text-gray-500">{row.totalCancelled}</td>
              <td className="px-4 py-3 text-gray-700">{row.totalAttended}</td>
              <td className="px-4 py-3 min-w-[180px]">
                <OccupancyBar value={row.occupancyPercentage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const tabs: { id: Tab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'summary',    label: 'Resumen',              icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'byEvent',    label: 'Por evento',            icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'byType',     label: 'Por tipo',              icon: <Activity className="w-4 h-4" /> },
    { id: 'organizers', label: 'Organizadores',         icon: <Award className="w-4 h-4" />, adminOnly: true },
    { id: 'popular',    label: 'Populares',             icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'occupancy',  label: 'Ocupación',             icon: <Users className="w-4 h-4" /> },
  ].filter((t) => !t.adminOnly || isAdmin);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">Estadísticas e informes</h1>
      </div>

      {/* Tab bar — scrollable on small screens */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 border-b border-gray-200 mb-6 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300',
              ].join(' ')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'summary'    && <SummaryTab />}
      {activeTab === 'byEvent'    && <ByEventTab isAdmin={isAdmin} />}
      {activeTab === 'byType'     && <ByTypeTab />}
      {activeTab === 'organizers' && <OrganizersTab />}
      {activeTab === 'popular'    && <PopularEventsTab />}
      {activeTab === 'occupancy'  && <OccupancyTab />}
    </div>
  );
}
