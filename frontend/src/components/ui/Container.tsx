import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm:   'max-w-xl',
  md:   'max-w-3xl',
  lg:   'max-w-5xl',
  xl:   'max-w-screen-xl',
  full: 'max-w-full',
};

export default function Container({
  size = 'xl',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
