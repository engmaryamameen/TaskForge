'use client';

interface DashboardWidgetCardHeaderProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Shared header row for bottom dashboard widgets (priority, workspace, deadlines, my work). */
export function DashboardWidgetCardHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  action,
}: DashboardWidgetCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200/80">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{eyebrow}</p>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-snug text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0 pt-0.5">{action}</div> : null}
    </div>
  );
}
