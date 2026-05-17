'use client';

import { Button } from '@/components/ui/button';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconActivity,
  IconPlus,
  IconCheck,
  IconTrendingUp,
  IconTarget,
} from '@/components/icons';

interface DashboardEmptyStateProps {
  firstName: string;
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  onCreateProject: () => void;
  onCreateTask: () => void;
  onInvite: () => void;
}

/* ── Setup checklist step ── */
function SetupStep({
  done,
  label,
  hint,
  action,
  actionLabel,
}: {
  done: boolean;
  label: string;
  hint: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-colors ${
        done
          ? 'border-neutral-100 bg-neutral-50'
          : 'border-neutral-200 bg-white shadow-xs hover:border-neutral-300'
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          done
            ? 'bg-success-100 text-success-600'
            : 'border-2 border-neutral-300 text-transparent'
        }`}
      >
        {done && <IconCheck className="h-3.5 w-3.5" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${done ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>
          {label}
        </p>
        <p className={`mt-0.5 text-xs ${done ? 'text-neutral-400' : 'text-neutral-500'}`}>{hint}</p>
      </div>

      {!done && action && actionLabel && (
        <Button type="button" size="xs" className="shrink-0" onClick={action}>
          {actionLabel}
        </Button>
      )}
      {done && (
        <span className="shrink-0 text-xs font-medium text-success-600">Done</span>
      )}
    </div>
  );
}

/* ── Preview KPI card — matches the real KPI card layout with accent bar ── */
function PreviewKpiCard({
  label,
  icon,
  accentColor,
  iconBg,
  iconColor,
}: {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="relative flex overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
      <div className={`w-1 shrink-0 ${accentColor}`} />
      <div className="flex flex-1 items-start justify-between gap-3 p-4 pl-4">
        <div>
          <p className="text-xs font-medium text-neutral-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-neutral-200">0</p>
          <p className="mt-1 text-xs text-neutral-300">Awaiting data</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg} opacity-60`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardEmptyState({
  firstName,
  totalProjects,
  totalTasks,
  totalMembers,
  onCreateProject,
  onCreateTask,
  onInvite,
}: DashboardEmptyStateProps) {
  const stepsCompleted = [totalProjects > 0, totalTasks > 0, totalMembers > 1].filter(Boolean).length;
  const allDone = stepsCompleted === 3;

  return (
    <div className="space-y-6">
      {/* ── Welcome header ── */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Complete a few steps to set up your organization. Your dashboard will populate as you add projects and tasks.
        </p>
      </header>

      {/* ── Preview KPI row ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PreviewKpiCard
          label="Projects"
          icon={<IconFolder className="h-5 w-5" />}
          accentColor="bg-primary-500"
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
        />
        <PreviewKpiCard
          label="Total tasks"
          icon={<IconCheckSquare className="h-5 w-5" />}
          accentColor="bg-info-500"
          iconBg="bg-info-50"
          iconColor="text-info-600"
        />
        <PreviewKpiCard
          label="In progress"
          icon={<IconTrendingUp className="h-5 w-5" />}
          accentColor="bg-warning-500"
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
        />
        <PreviewKpiCard
          label="Completion"
          icon={<IconTarget className="h-5 w-5" />}
          accentColor="bg-success-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* ── Left column: setup checklist ── */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Get started</h2>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">
                {stepsCompleted}/3
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-1.5 rounded-full bg-neutral-100">
              <div
                className="h-1.5 rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${(stepsCompleted / 3) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <SetupStep
                done={totalProjects > 0}
                label="Create your first project"
                hint="Projects group related tasks together."
                action={onCreateProject}
                actionLabel="Create"
              />
              <SetupStep
                done={totalTasks > 0}
                label="Add your first task"
                hint="Tasks track individual pieces of work with status and priority."
                action={onCreateTask}
                actionLabel="Add task"
              />
              <SetupStep
                done={totalMembers > 1}
                label="Invite a teammate"
                hint="Collaborate with your team in real time."
                action={onInvite}
                actionLabel="Invite"
              />
            </div>

            {allDone && (
              <p className="mt-4 text-center text-sm font-medium text-success-600">
                All set — your dashboard is ready to use.
              </p>
            )}
          </div>
        </div>

        {/* ── Right column: empty activity card ── */}
        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white shadow-xs">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
              <IconActivity className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-900">Recent activity</h2>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                <IconActivity className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-600">No activity yet</p>
              <p className="mt-1 max-w-[220px] text-xs text-neutral-400">
                Actions like creating projects, adding tasks, and inviting members will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
