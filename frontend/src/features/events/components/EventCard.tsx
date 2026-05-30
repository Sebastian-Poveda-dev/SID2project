import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, ChevronRight } from 'lucide-react';
import EventStatusBadge from './EventStatusBadge';
import { cn } from '../../../utils/cn';
import type { EventSummary, EventType } from '../../../types/event';

/* ── Event type config ────────────────────────────────────────────────── */

interface TypeConfig {
  label: string;
  colorClass: string;
}

const TYPE_CONFIG: Record<EventType, TypeConfig> = {
  WORKSHOP:          { label: 'Taller',            colorClass: 'bg-sky-100    text-sky-700'    },
  TALK:              { label: 'Charla',             colorClass: 'bg-violet-100 text-violet-700' },
  SPORTS_TOURNAMENT: { label: 'Torneo deportivo',   colorClass: 'bg-emerald-100 text-emerald-700' },
  VOLUNTEER:         { label: 'Voluntariado',        colorClass: 'bg-amber-100  text-amber-700'  },
  OTHER:             { label: 'Otro',               colorClass: 'bg-zinc-100   text-zinc-600'   },
};

/* ── Date/time formatting ─────────────────────────────────────────────── */

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} · ${time}`;
}

/* ── Slots display ────────────────────────────────────────────────────── */

function SlotsDisplay({ slots }: { slots: number }) {
  if (slots === 0) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
        <Users className="w-4 h-4 shrink-0" />
        Sin cupos disponibles
      </span>
    );
  }
  const colorClass = slots <= 5 ? 'text-amber-600' : 'text-zinc-500';
  return (
    <span className={cn('flex items-center gap-1.5 text-sm', colorClass)}>
      <Users className="w-4 h-4 shrink-0" />
      {slots} cupo{slots !== 1 ? 's' : ''} disponible{slots !== 1 ? 's' : ''}
    </span>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */

interface EventCardProps {
  event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
  const typeConfig = TYPE_CONFIG[event.eventType] ?? TYPE_CONFIG.OTHER;
  const isCancelled = event.status === 'CANCELLED';

  return (
    <Link
      to={`/events/${event.id}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-card',
        'transition-all duration-200 hover:border-primary-300 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        isCancelled && 'opacity-60'
      )}
    >
      {/* Top: type + status */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <span
          className={cn(
            'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium',
            typeConfig.colorClass
          )}
        >
          {typeConfig.label}
        </span>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Title */}
      <div className="px-5 pt-3 pb-4">
        <h3 className="text-base font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors duration-150">
          {event.title}
        </h3>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-zinc-100" />

      {/* Meta */}
      <div className="px-5 py-4 flex flex-col gap-2.5 flex-1">
        <span className="flex items-start gap-1.5 text-sm text-zinc-500">
          <CalendarDays className="w-4 h-4 mt-0.5 shrink-0" />
          {formatDateTime(event.startDateTime)}
        </span>

        <span className="flex items-start gap-1.5 text-sm text-zinc-500">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </span>

        <SlotsDisplay slots={event.availableSlots} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-1 px-5 pb-4 text-xs font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
        Ver detalles
        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
