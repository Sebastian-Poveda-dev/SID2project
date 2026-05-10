import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-zinc-100  text-zinc-600',
  primary:  'bg-primary-100 text-primary-700',
  success:  'bg-green-100  text-green-700',
  warning:  'bg-amber-100  text-amber-700',
  danger:   'bg-red-100    text-red-600',
  info:     'bg-sky-100    text-sky-700',
};

const sizeClasses = {
  sm: 'text-xs px-2   py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export default function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
