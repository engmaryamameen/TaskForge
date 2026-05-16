'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconActivity } from '@/components/icons';

export function ActivityEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-200 bg-linear-to-b from-white to-neutral-50/50 px-6 py-16 text-center shadow-xs">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 ring-1 ring-primary-100/80">
        <IconActivity className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-neutral-800">No activity yet</p>
      <p className="mt-1.5 max-w-md text-sm text-neutral-500">
        Activity will appear here as your team creates projects, updates tasks, and invites members.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={() => router.push('/tasks')}>
          Create task
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
          Create project
        </Button>
      </div>
    </div>
  );
}
