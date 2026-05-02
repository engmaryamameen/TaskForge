interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-medium">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-neutral-900">{value}</p>
        {change && (
          <p className={`mt-1 text-xs font-medium ${change.positive ? 'text-success-600' : 'text-danger-600'}`}>
            <span>{change.positive ? '\u2191' : '\u2193'}</span> {change.value}
          </p>
        )}
      </div>
    </div>
  );
}
