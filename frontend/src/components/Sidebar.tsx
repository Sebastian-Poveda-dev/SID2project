import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';
import type { UserRole } from '../types/user';

export interface SidebarItem {
  to: string;
  label: string;
  icon?: ReactNode;
  roles?: UserRole[];
}

export interface SidebarProps {
  items: SidebarItem[];
  userRole?: UserRole;
  /** Reserved for future collapsible behaviour */
  collapsed?: boolean;
  className?: string;
}

export default function Sidebar({
  items,
  userRole,
  collapsed = false,
  className,
}: SidebarProps) {
  const visible = items.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <aside
      className={cn(
        'flex flex-shrink-0 flex-col border-r border-zinc-200 bg-white py-5 transition-all duration-200',
        collapsed ? 'w-14 px-1.5' : 'w-56 px-3',
        className
      )}
    >
      <nav className="flex flex-col gap-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl text-sm font-medium transition-colors duration-150',
                collapsed ? 'h-10 w-10 justify-center p-0' : 'gap-2.5 px-3 py-2.5',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )
            }
          >
            {item.icon && (
              <span className="shrink-0 w-4 h-4 flex items-center">{item.icon}</span>
            )}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
