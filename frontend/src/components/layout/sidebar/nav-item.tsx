'use client';

import Link from 'next/link';

/** Shared sizing/spacing for all sidebar nav items */
const ITEM = {
  /** Outer wrapper: centered column with icon + label */
  base: 'flex flex-col items-center justify-center gap-1 rounded-xl w-full py-2.5 transition-colors duration-150',
  /** Icon sizing — 20px for all states */
  icon: 'h-5 w-5',
  /** Label typography */
  label: 'text-[10px] leading-tight tracking-wide',
} as const;

const STATE = {
  active: {
    wrapper: 'bg-primary-50 text-primary-700',
    icon: 'text-primary-600',
    label: 'font-semibold',
  },
  inactive: {
    wrapper: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
    icon: 'text-neutral-500',
    label: 'font-medium',
  },
} as const;

/* ── Types ── */

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}

/* ── Component ── */

export function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  const s = isActive ? STATE.active : STATE.inactive;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${ITEM.base} ${s.wrapper}`}
    >
      <Icon className={`${ITEM.icon} ${s.icon}`} />
      <span className={`${ITEM.label} ${s.label}`}>{label}</span>
    </Link>
  );
}

/* ── Action button variant (same visual rhythm as nav items) ── */

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
}

export function SidebarActionButton({ icon: Icon, onClick, className = '' }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150 ${className}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
