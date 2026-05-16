'use client';

interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  accentClass?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export function DashboardKpiCard({
  label,
  value,
  hint,
  icon,
  accentClass = 'ring-primary-100',
  iconBgClass = 'bg-primary-50',
  iconColorClass = 'text-primary-600',
}: DashboardKpiCardProps) {
  return (
    <div className="flex h-full min-h-[124px] flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">{value}</p>
          <p className="mt-1 text-sm leading-snug text-neutral-500">{hint}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ring-1 ${accentClass}`}
        >
          <span className={iconColorClass}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
