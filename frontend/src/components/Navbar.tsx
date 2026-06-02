import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { cn } from '../utils/cn';

export interface NavbarProps {
  /** Right-side slot: navigation links, auth buttons, user info */
  children?: ReactNode;
  className?: string;
}

export default function Navbar({ children, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 border-b border-zinc-200 bg-white/90 backdrop-blur-sm',
        'flex items-center shadow-nav',
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/events"
          className="flex items-center gap-2 font-semibold text-zinc-900 text-lg select-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
            <CalendarDays className="w-4 h-4" />
          </span>
          <span>UniPlan</span>
        </Link>

        {/* Right slot */}
        {children && (
          <nav className="flex items-center gap-2">{children}</nav>
        )}
      </div>
    </header>
  );
}
