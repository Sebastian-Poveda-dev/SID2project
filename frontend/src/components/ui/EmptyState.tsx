import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-20 text-center',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
        {icon ?? <Inbox className="w-7 h-7" />}
      </div>

      <div className="flex flex-col items-center gap-1 max-w-xs">
        <p className="text-sm font-medium text-zinc-700">{title}</p>
        {description && (
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
