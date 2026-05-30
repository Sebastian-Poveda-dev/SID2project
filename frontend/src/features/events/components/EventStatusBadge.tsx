import Badge, { type BadgeVariant } from '../../../components/ui/Badge';
import type { EventStatus } from '../../../types/event';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const STATUS_CONFIG: Record<EventStatus, StatusConfig> = {
  DRAFT:     { label: 'Borrador',    variant: 'default'  },
  PUBLISHED: { label: 'Próximo',     variant: 'primary'  },
  ONGOING:   { label: 'En curso',    variant: 'success'  },
  COMPLETED: { label: 'Finalizado',  variant: 'default'  },
  CANCELLED: { label: 'Cancelado',   variant: 'danger'   },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export default function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status] ?? STATUS_CONFIG.PUBLISHED;
  return (
    <Badge variant={variant} size="sm" className={className}>
      {label}
    </Badge>
  );
}
