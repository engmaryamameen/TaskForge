'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconGlobe } from '@/components/icons';

/**
 * Shown when the user has organizations but the persisted current org id is stale or unset.
 */
export function WorkspaceSelectionPrompt() {
  return (
    <Card padding="lg" className="border-amber-200/90 bg-gradient-to-br from-amber-50/80 to-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/80">
            <IconGlobe className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">Choose an organization</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              Select which organization you want to use so your dashboard can load projects and tasks.
            </p>
          </div>
        </div>
        <Link href="/organizations">
          <Button size="md">Open organizations</Button>
        </Link>
      </div>
    </Card>
  );
}
