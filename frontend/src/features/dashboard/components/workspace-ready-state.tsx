'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  IconFolder,
  IconCheckSquare,
  IconUsers,
  IconPlus,
  IconUserPlus,
  IconArrowRight,
} from '@/components/icons';

interface WorkspaceReadyStateProps {
  projectCount: number;
  taskCount: number;
  /** Includes pending invites in “team” headcount for the subtitle when useful */
  teamHeadcount: number;
  onCreateFirstProject: () => void;
  onOpenTaskModal: () => void;
}

export function WorkspaceReadyState({
  projectCount,
  taskCount,
  teamHeadcount,
  onCreateFirstProject,
  onOpenTaskModal,
}: WorkspaceReadyStateProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50/90 via-white to-primary-50/30 px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-600">Your workspace</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.65rem]">
            Your workspace is ready
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-neutral-600">
            Start by creating your first project, then add tasks and invite your team — we’ll chart progress here as work
            picks up.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <div className="sm:flex-1 sm:max-w-xs">
              <Button
                type="button"
                className="w-full"
                size="lg"
                leftIcon={<IconPlus className="h-4 w-4" />}
                onClick={onCreateFirstProject}
              >
                Create first project
              </Button>
            </div>
            <Link href="/organizations" className="sm:flex-1 sm:max-w-xs">
              <Button variant="secondary" className="w-full" size="lg" leftIcon={<IconUserPlus className="h-4 w-4" />}>
                Invite teammates
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition hover:text-primary-700"
          >
            Create a task instead <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-px bg-neutral-100 sm:grid-cols-3">
        {[
          {
            label: 'Projects',
            value: projectCount,
            hint: 'Spaces for your work',
            icon: IconFolder,
            bg: 'bg-primary-50',
            fg: 'text-primary-600',
          },
          {
            label: 'Tasks',
            value: taskCount,
            hint: 'Tracked across the workspace',
            icon: IconCheckSquare,
            bg: 'bg-info-50',
            fg: 'text-info-600',
          },
          {
            label: 'Team',
            value: teamHeadcount,
            hint: 'Members & pending invites',
            icon: IconUsers,
            bg: 'bg-teal-50',
            fg: 'text-teal-600',
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white px-6 py-6 sm:py-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{k.label}</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-neutral-900">{k.value}</p>
                  <p className="mt-1 text-[13px] text-neutral-500">{k.hint}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${k.bg} ring-1 ring-neutral-100`}>
                  <Icon className={`h-5 w-5 ${k.fg}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
