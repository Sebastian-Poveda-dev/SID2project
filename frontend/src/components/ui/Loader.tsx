import { cn } from '../../utils/cn';

export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
  size?: LoaderSize;
  label?: string;
  fullPage?: boolean;
  centered?: boolean;
  className?: string;
}

const spinnerSize: Record<LoaderSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-11 h-11 border-[3px]',
};

function Spinner({ size = 'md', className }: { size?: LoaderSize; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-primary-200 border-t-primary-500 animate-spin',
        spinnerSize[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

export default function Loader({
  size = 'md',
  label,
  fullPage = false,
  centered = false,
  className,
}: LoaderProps) {
  const inner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Spinner size={size} />
      {label && <p className="text-sm text-zinc-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {inner}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center py-16">
        {inner}
      </div>
    );
  }

  return inner;
}
