import { cn } from '../../../utils/cn';
import type { EventType, EventStatus } from '../../../types/event';

/* ── Types ────────────────────────────────────────────────────────────── */

export type TypeFilter   = EventType   | 'ALL';
export type StatusFilter = EventStatus | 'ALL';

export interface EventFiltersProps {
  typeFilter:      TypeFilter;
  statusFilter:    StatusFilter;
  onTypeChange:    (value: TypeFilter)   => void;
  onStatusChange:  (value: StatusFilter) => void;
  totalCount:      number;
  filteredCount:   number;
}

/* ── Filter pill ──────────────────────────────────────────────────────── */

interface PillProps {
  label:   string;
  active:  boolean;
  onClick: () => void;
}

function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-primary-500 text-white shadow-sm'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
      )}
    >
      {label}
    </button>
  );
}

/* ── Data ─────────────────────────────────────────────────────────────── */

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'ALL',              label: 'Todos los tipos' },
  { value: 'WORKSHOP',         label: 'Taller'          },
  { value: 'TALK',             label: 'Charla'          },
  { value: 'SPORTS_TOURNAMENT',label: 'Torneo'          },
  { value: 'VOLUNTEER',        label: 'Voluntariado'    },
  { value: 'OTHER',            label: 'Otro'            },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL',       label: 'Todos'       },
  { value: 'PUBLISHED', label: 'Próximos'    },
  { value: 'ONGOING',   label: 'En curso'    },
  { value: 'COMPLETED', label: 'Finalizados' },
  { value: 'CANCELLED', label: 'Cancelados'  },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function EventFilters({
  typeFilter,
  statusFilter,
  onTypeChange,
  onStatusChange,
  totalCount,
  filteredCount,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Type filter */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Tipo de evento
        </span>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={typeFilter === opt.value}
              onClick={() => onTypeChange(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Estado
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <Pill
              key={opt.value}
              label={opt.label}
              active={statusFilter === opt.value}
              onClick={() => onStatusChange(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Result count */}
      {totalCount > 0 && (
        <p className="text-xs text-zinc-400">
          {filteredCount === totalCount
            ? `${totalCount} evento${totalCount !== 1 ? 's' : ''}`
            : `${filteredCount} de ${totalCount} evento${totalCount !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}
