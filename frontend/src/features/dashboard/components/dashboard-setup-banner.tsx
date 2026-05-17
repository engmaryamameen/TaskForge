'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight, IconPlus, IconUserPlus } from '@/components/icons';

export type DashboardSetupBannerVariant = 'no_projects' | 'projects_no_tasks';

interface DashboardSetupBannerProps {
  variant: DashboardSetupBannerVariant;
  onPrimary: () => void;
}

export function DashboardSetupBanner({ variant, onPrimary }: DashboardSetupBannerProps) {
  if (variant === 'no_projects') {
    return (
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50/80 via-white to-neutral-50/90 px-5 py-4 shadow-xs sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">Next step</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">Your organization is ready</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Create your first project to start planning and tracking work.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" size="md" leftIcon={<IconPlus className="h-4 w-4" />} onClick={onPrimary}>
              Create first project
            </Button>
            <Link href="/organizations">
              <Button type="button" variant="secondary" size="md" leftIcon={<IconUserPlus className="h-4 w-4" />}>
                Invite teammates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-white to-neutral-50/90 px-5 py-4 shadow-xs sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">Momentum</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">Good start — your organization is active</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Add your first task to start tracking progress, priorities, and deadlines.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" size="md" leftIcon={<IconPlus className="h-4 w-4" />} onClick={onPrimary}>
            Create task
          </Button>
          <Link href="/tasks">
            <Button type="button" variant="secondary" size="md" rightIcon={<IconArrowRight className="h-4 w-4" />}>
              Open board
            </Button>
          </Link>
          <Link href="/organizations" className="hidden lg:block">
            <Button type="button" variant="ghost" size="md" leftIcon={<IconUserPlus className="h-4 w-4" />}>
              Invite teammate
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
