'use client';

import { useState } from 'react';
import type { Organization } from '@/types';
import { Role } from '@/types';
import { formatDate } from '@/lib/utils/dates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconGlobe, IconUsers, IconCopy, IconCheck } from '@/components/icons';
import { SettingsSection } from './settings-section';

interface WorkspaceSettingsCardProps {
  organization: Organization;
  currentRole: Role | null;
  isActiveWorkspace: boolean;
}

export function WorkspaceSettingsCard({
  organization,
  currentRole,
  isActiveWorkspace,
}: WorkspaceSettingsCardProps) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    void navigator.clipboard.writeText(organization.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SettingsSection
      title="Workspace"
      description="The organization you’re working in and its identifiers."
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-600 to-primary-700 text-lg font-bold text-white shadow-md">
          {organization.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900">{organization.name}</h3>
            {isActiveWorkspace && (
              <Badge variant="success" className="text-[10px] uppercase tracking-wide">
                Active workspace
              </Badge>
            )}
          </div>

          <div className="grid gap-4 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                <IconGlobe className="h-4 w-4 text-neutral-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Slug
                </p>
                <p className="mt-0.5 truncate font-mono text-sm text-neutral-900">{organization.slug}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                <IconUsers className="h-4 w-4 text-neutral-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  Your role
                </p>
                <p className="mt-0.5 text-sm font-medium capitalize text-neutral-900">
                  {currentRole ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Organization ID
              </p>
              <p className="mt-0.5 font-mono text-xs text-neutral-600 break-all">{organization.id}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              leftIcon={
                copied ? (
                  <IconCheck className="h-4 w-4 text-success-600" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )
              }
              onClick={copyId}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <p className="text-[13px] text-neutral-500">
            Created {formatDate(organization.createdAt)}
            {organization.updatedAt !== organization.createdAt && (
              <> · Last updated {formatDate(organization.updatedAt)}</>
            )}
          </p>

          <p className="text-[13px] text-neutral-400">
            Workspace name and URL slug are managed by administrators when renaming is supported.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
