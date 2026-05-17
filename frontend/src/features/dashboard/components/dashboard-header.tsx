'use client';

import { Button } from '@/components/ui/button';
import { IconPlus, IconUserPlus } from '@/components/icons';
import { useAuthStore } from '@/store/auth.store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface DashboardHeaderProps {
  actionsDisabled?: boolean;
  onNewProject: () => void;
  onNewTask: () => void;
  onInvite: () => void;
}

export function DashboardHeader({ actionsDisabled, onNewProject, onNewTask, onInvite }: DashboardHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || 'there';
  const greeting = getGreeting();

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">
          {greeting}, <span className="font-medium text-neutral-700">{firstName}</span>
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<IconUserPlus className="h-3.5 w-3.5" />}
          disabled={actionsDisabled}
          onClick={onInvite}
        >
          Invite
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<IconPlus className="h-3.5 w-3.5" />}
          disabled={actionsDisabled}
          onClick={onNewProject}
        >
          New project
        </Button>
        <Button
          type="button"
          size="sm"
          leftIcon={<IconPlus className="h-3.5 w-3.5" />}
          disabled={actionsDisabled}
          onClick={onNewTask}
        >
          New task
        </Button>
      </div>
    </header>
  );
}
