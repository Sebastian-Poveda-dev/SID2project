import { AlertCircle, RefreshCw } from 'lucide-react';
import { Loader, EmptyState } from '../../../components/ui';
import EventCard from './EventCard';
import type { EventSummary } from '../../../types/event';

/* ── Error state ──────────────────────────────────────────────────────── */

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-400" />
      </div>
      <div className="flex flex-col gap-1 max-w-xs">
        <p className="text-sm font-medium text-zinc-700">No se pudo cargar el catálogo</p>
        <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Intentar de nuevo
      </button>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────────── */

interface EventListProps {
  events:   EventSummary[];
  loading:  boolean;
  error:    string | null;
  onRetry:  () => void;
}

export default function EventList({ events, loading, error, onRetry }: EventListProps) {
  if (loading) {
    return <Loader centered size="lg" label="Cargando eventos…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No hay eventos disponibles"
        description="No encontramos eventos que coincidan con los filtros seleccionados. Intenta con otros criterios."
        action={null}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
