'use client';

import { Button } from '@/components/ui/button';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconActivity,
  IconCheck,
  IconPlus,
  IconUserPlus,
  IconTrendingUp,
  IconTarget,
} from '@/components/icons';

/* ── Types ── */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  completed: boolean;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

interface DashboardEmptyStateProps {
  firstName: string;
  totalProjects: number;
  totalTasks: number;
  totalMembers: number;
  onCreateProject: () => void;
  onCreateTask: () => void;
  onInvite: () => void;
}

/* ── Checklist step ── */

function ChecklistItem({ step }: { step: OnboardingStep }) {
  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all ${
        step.completed
          ? 'border-neutral-100 bg-neutral-50'
          : 'border-neutral-200 bg-white shadow-xs hover:border-primary-200 hover:shadow-soft'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
          step.completed
            ? 'bg-success-100 text-success-600'
            : `${step.iconBg} ${step.iconColor}`
        }`}
      >
        {step.completed ? <IconCheck className="h-4 w-4" /> : step.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${step.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
          {step.title}
        </p>
        <p className={`mt-0.5 text-xs ${step.completed ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {step.description}
        </p>
      </div>

      {step.completed ? (
        <span className="shrink-0 rounded-full bg-success-100 px-2.5 py-1 text-[11px] font-semibold text-success-700">
          Completed
        </span>
      ) : step.onAction ? (
        <Button size="md" onClick={step.onAction} className="shrink-0" leftIcon={step.actionIcon}>
          {step.actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

/* ── Progress ring (reuses the completion circle SVG style) ── */

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? completed / total : 0;
  const r = 18;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-neutral-100" />
        <circle
          cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-500 transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-bold text-neutral-900">{completed}/{total}</span>
    </div>
  );
}

/* ── Preview KPI card ── */

function PreviewKpiCard({
  label, icon, iconBg, iconColor, accent,
}: {
  label: string; icon: React.ReactNode; iconBg: string; iconColor: string; accent: string;
}) {
  return (
    <div className="flex overflow-hidden bg-white shadow-soft">
      <div className={`w-1 shrink-0 ${accent}`} />
      <div className="flex flex-1 items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-neutral-200">0</p>
          <p className="mt-2 text-xs text-neutral-400">Awaiting data</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} opacity-50`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export function DashboardEmptyState({
  firstName,
  totalProjects,
  totalTasks,
  totalMembers,
  onCreateProject,
  onCreateTask,
  onInvite,
}: DashboardEmptyStateProps) {
  const steps: OnboardingStep[] = [
    {
      id: 'project',
      title: 'Create your first project',
      description: 'Group related tasks and organize your work.',
      icon: <IconFolder className="h-4 w-4" />,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
      completed: totalProjects > 0,
      actionLabel: 'Create project',
      actionIcon: <IconPlus className="h-3.5 w-3.5" />,
      onAction: onCreateProject,
    },
    {
      id: 'task',
      title: 'Add your first task',
      description: 'Create and track work with status and priority.',
      icon: <IconCheckSquare className="h-4 w-4" />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500',
      completed: totalTasks > 0,
      actionLabel: 'Add task',
      actionIcon: <IconPlus className="h-3.5 w-3.5" />,
      onAction: onCreateTask,
    },
    {
      id: 'invite',
      title: 'Invite a teammate',
      description: 'Collaborate with your team in this organization.',
      icon: <IconUsers className="h-4 w-4" />,
      iconBg: 'bg-info-100',
      iconColor: 'text-info-500',
      completed: totalMembers > 1,
      actionLabel: 'Invite',
      actionIcon: <IconUserPlus className="h-3.5 w-3.5" />,
      onAction: onInvite,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const allDone = completedCount === steps.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Complete a few steps to set up your organization. Your dashboard will populate as you add projects and tasks.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PreviewKpiCard label="Projects" icon={<IconFolder className="h-5 w-5" />} iconBg="bg-primary-100" iconColor="text-primary-500" accent="bg-primary-500" />
        <PreviewKpiCard label="Total tasks" icon={<IconCheckSquare className="h-5 w-5" />} iconBg="bg-purple-100" iconColor="text-purple-500" accent="bg-purple-500" />
        <PreviewKpiCard label="In progress" icon={<IconTrendingUp className="h-5 w-5" />} iconBg="bg-orange-100" iconColor="text-orange-500" accent="bg-orange-500" />
        <PreviewKpiCard label="Completion" icon={<IconTarget className="h-5 w-5" />} iconBg="bg-success-100" iconColor="text-success-500" accent="bg-success-500" />
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-white shadow-soft p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Get started</h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {allDone ? 'All steps completed' : `${completedCount} of ${steps.length} completed`}
                </p>
              </div>
              <ProgressRing completed={completedCount} total={steps.length} />
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <ChecklistItem key={step.id} step={step} />
              ))}
            </div>

            {allDone && (
              <div className="mt-5 rounded-xl bg-success-50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-success-700">
                  All set — your dashboard is ready to use.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex h-full flex-col rounded-2xl bg-white shadow-soft">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
              <IconActivity className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900">Recent activity</h2>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <IconActivity className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-900">No activity yet</p>
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
