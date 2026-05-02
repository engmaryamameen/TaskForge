'use client';

import type { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { SettingsSection } from './settings-section';

interface SecuritySettingsCardProps {
  user: User;
}

export function SecuritySettingsCard({ user }: SecuritySettingsCardProps) {
  return (
    <SettingsSection
      title="Security"
      description="Protect your account and manage how you sign in."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">Email verification</p>
            <p className="text-[13px] text-neutral-500">
              Confirms you control this email address.
            </p>
          </div>
          <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
            {user.isEmailVerified ? 'Verified' : 'Not verified'}
          </Badge>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">Password</p>
            <p className="text-[13px] text-neutral-500">
              Sign in with email and password.
            </p>
          </div>
          <Badge variant="success">Enabled</Badge>
        </div>

        <div className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-4">
          <p className="text-sm font-medium text-neutral-900">Connected accounts</p>
          <p className="mt-1 text-[13px] text-neutral-500">
            Google and GitHub sign-in will appear here when enabled for your workspace.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
