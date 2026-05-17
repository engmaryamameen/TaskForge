'use client';

interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { label: string; positive?: boolean };
  loading?: boolean;
  onClick?: () => void;
}

function TrendBadge({ label, positive }: { label: string; positive?: boolean }) {
  const color = positive === undefined
    ? 'bg-neutral-100 text-neutral-500'
    : positive
      ? 'bg-success-50 text-success-700'
      : 'bg-danger-50 text-danger-700';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${color}`}>
      {positive !== undefined && (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={positive ? 'M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25' : 'M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25'}
          />
        </svg>
      )}
      {label}
    </span>
  );
}

export function DashboardKpiCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  trend,
  loading,
  onClick,
}: DashboardKpiCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 w-20 animate-shimmer rounded" />
            <div className="h-8 w-16 animate-shimmer rounded" />
            <div className="h-3 w-28 animate-shimmer rounded" />
          </div>
          <div className="h-11 w-11 animate-shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`group rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-medium ${
        onClick ? 'text-left w-full' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-xs text-neutral-400">{subtitle}</p>
            {trend && <TrendBadge label={trend.label} positive={trend.positive} />}
          </div>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </Wrapper>
  );
}
