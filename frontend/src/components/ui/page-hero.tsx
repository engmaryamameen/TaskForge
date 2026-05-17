'use client';

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  actions?: React.ReactNode;
}

export function PageHero({
  badge,
  title,
  subtitle,
  count,
  countLabel,
  actions,
}: PageHeroProps) {
  return (
    <header className="relative overflow-hidden bg-white px-3 py-7 shadow-soft sm:px-3 sm:py-6">
      <div className="absolute inset-0 bg-linear-to-br from-primary-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl space-y-2.5">
          {(badge || count !== undefined) && (
            <div className="flex flex-wrap items-center gap-2">
              {badge && (
                <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-primary-100">
                  {badge}
                </span>
              )}
              {count !== undefined && count > 0 && (
                <span className="text-[13px] font-medium tabular-nums text-neutral-500">
                  {count} {countLabel ?? 'items'}
                </span>
              )}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
