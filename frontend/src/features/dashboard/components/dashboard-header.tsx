'use client';

import { Button } from '@/components/ui/button';
import { IconPlus, IconUserPlus } from '@/components/icons';

const SUBTITLE =
  'Track project health, task progress, and team activity from one place.';

interface DashboardHeaderProps {
  actionsDisabled?: boolean;
  onNewProject: () => void;
  onNewTask: () => void;
  onInvite: () => void;
}

export function DashboardHeader({ actionsDisabled, onNewProject, onNewTask, onInvite }: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-neutral-200/90 bg-white px-5 py-5 shadow-xs sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{SUBTITLE}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<IconPlus className="h-4 w-4" />}
            disabled={actionsDisabled}
            onClick={onNewProject}
          >
            New project
          </Button>
          <Button
            type="button"
            size="md"
            leftIcon={<IconPlus className="h-4 w-4" />}
            disabled={actionsDisabled}
            onClick={onNewTask}
          >
            New task
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            leftIcon={<IconUserPlus className="h-4 w-4" />}
            disabled={actionsDisabled}
            onClick={onInvite}
          >
            Invite
          </Button>
        </div>
      </div>
    </header>
  );
}
