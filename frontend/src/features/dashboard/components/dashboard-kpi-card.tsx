'use client';

interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  accentColor?: string;
  iconBgClass?: string;
  iconColorClass?: string;
}

export function DashboardKpiCard({
  label,
  value,
  hint,
  icon,
  accentColor = 'bg-primary-500',
  iconBgClass = 'bg-primary-50',
  iconColorClass = 'text-primary-600',
}: DashboardKpiCardProps) {
  return (
    <div className="group relative flex h-full min-h-[120px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs transition-all hover:shadow-soft">
      {/* Colored left accent bar */}
      <div className={`w-1 shrink-0 ${accentColor}`} />
      <div className="flex flex-1 items-start justify-between gap-3 p-4 pl-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-neutral-900">{value}</p>
          <p className="mt-1 text-xs leading-snug text-neutral-400">{hint}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}
        >
          <span className={iconColorClass}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
