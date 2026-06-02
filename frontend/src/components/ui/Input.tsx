import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftAddon, rightAddon, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-700"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3 text-zinc-400 flex items-center">
            {leftAddon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white text-sm text-zinc-900 placeholder:text-zinc-400',
            'h-10 px-3.5 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-400',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-zinc-200 hover:border-zinc-300',
            leftAddon && 'pl-9',
            rightAddon && 'pr-9',
            className
          )}
          {...props}
        />

        {rightAddon && (
          <span className="absolute right-3 text-zinc-400 flex items-center">
            {rightAddon}
          </span>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-zinc-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
