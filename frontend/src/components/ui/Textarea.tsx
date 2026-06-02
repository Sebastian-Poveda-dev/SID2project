import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, rows = 4, ...props },
  ref
) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-zinc-700"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-xl border bg-white text-sm text-zinc-900 placeholder:text-zinc-400',
          'px-3.5 py-2.5 resize-y transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-400',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-zinc-200 hover:border-zinc-300',
          className
        )}
        {...props}
      />

      {hint && !error && (
        <p className="text-xs text-zinc-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Textarea;
