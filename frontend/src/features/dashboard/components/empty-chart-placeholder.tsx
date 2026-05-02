'use client';

interface EmptyChartPlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  minHeight?: number;
  /** Tighter padding and default height for low-data / onboarding layouts */
  compact?: boolean;
}

export function EmptyChartPlaceholder({
  title,
  description,
  icon,
  minHeight,
  compact,
}: EmptyChartPlaceholderProps) {
  const resolvedMin = minHeight ?? (compact ? 160 : 220);
  const padding = compact ? 'py-6' : 'py-10';

  return (
    <div
      style={{ minHeight: resolvedMin }}
      className={`flex w-full flex-col items-center justify-center gap-2 px-4 text-center ${padding}`}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-primary-50 to-neutral-50 ring-1 ring-primary-100/80 text-primary-600">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="max-w-sm text-xs leading-relaxed text-neutral-500">{description}</p>
      </div>
    </div>
  );
}
