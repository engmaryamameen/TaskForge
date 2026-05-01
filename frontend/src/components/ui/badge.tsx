const variantStyles = {
  // Status
  todo: 'bg-neutral-100 text-neutral-600',
  'in-progress': 'bg-primary-50 text-primary-700',
  done: 'bg-success-50 text-success-600',
  // Priority
  urgent: 'bg-danger-50 text-danger-600',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-warning-50 text-warning-600',
  low: 'bg-neutral-100 text-neutral-500',
  // Roles
  admin: 'bg-purple-50 text-purple-700',
  member: 'bg-neutral-100 text-neutral-500',
  // Generic
  info: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  neutral: 'bg-neutral-100 text-neutral-600',
} as const;

type BadgeVariant = keyof typeof variantStyles;

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
