const variantStyles = {
  // Status
  todo: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/60',
  'in-progress': 'bg-primary-50 text-primary-700 ring-1 ring-primary-200/60',
  done: 'bg-success-50 text-success-600 ring-1 ring-success-500/20',
  // Priority
  urgent: 'bg-danger-50 text-danger-600 ring-1 ring-danger-500/20',
  high: 'bg-orange-50 text-orange-700 ring-1 ring-orange-500/20',
  medium: 'bg-warning-50 text-warning-600 ring-1 ring-warning-500/20',
  low: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200/60',
  // Roles
  admin: 'bg-purple-50 text-purple-700 ring-1 ring-purple-500/20',
  member: 'bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200/60',
  // Generic
  info: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200/60',
  success: 'bg-success-50 text-success-600 ring-1 ring-success-500/20',
  warning: 'bg-warning-50 text-warning-600 ring-1 ring-warning-500/20',
  danger: 'bg-danger-50 text-danger-600 ring-1 ring-danger-500/20',
  neutral: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/60',
} as const;

type BadgeVariant = keyof typeof variantStyles;

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'neutral', children, className = '', dot }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}
