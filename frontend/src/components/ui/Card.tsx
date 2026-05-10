import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

/* ── Card root ─────────────────────────────────────────────────────────── */

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  flat?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export default function Card({
  padding = 'md',
  flat = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white',
        !flat && 'shadow-card',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Card.Header ───────────────────────────────────────────────────────── */

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

Card.Header = function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div
      className={cn('border-b border-zinc-100 px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/* ── Card.Body ─────────────────────────────────────────────────────────── */

Card.Body = function CardBody({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
};

/* ── Card.Footer ───────────────────────────────────────────────────────── */

Card.Footer = function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        'border-t border-zinc-100 px-6 py-4 flex items-center justify-end gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
