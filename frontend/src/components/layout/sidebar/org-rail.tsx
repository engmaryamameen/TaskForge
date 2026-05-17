'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  useOrganizations,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { Tooltip } from '@/components/ui/tooltip';
import { IconPlus } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';
import type { OrganizationWithRole } from '@/types';

/* ── Helpers ── */

function orgInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* ── Component ── */

export function OrgRail() {
  const user = useAuthStore((s) => s.user);
  const currentOrgId = useAuthStore((s) => s.currentOrganizationId);
  const { data: orgs } = useOrganizations();
  const switchOrg = useSwitchOrganization();
  const [showCreateModal, setShowCreateModal] = useState(false);

  function handleSwitch(org: OrganizationWithRole) {
    if (org.id === currentOrgId) return;
    switchOrg.mutate(org.id);
  }

  return (
    <>
      <CreateOrgModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <aside className="hidden md:flex w-16 shrink-0 flex-col items-center border-r border-neutral-200 bg-neutral-50/80 py-3">
        {/* ── Top: TaskForge brand icon ── */}
        <Tooltip label="TaskForge" side="right">
          <Link href="/" className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden transition-opacity hover:opacity-90">
            <img
              src="/brand/taskforge-app-icon-transparent.png"
              alt="TaskForge"
              className="h-9 w-9 object-contain"
            />
          </Link>
        </Tooltip>

        <div className="mx-auto mb-2 h-px w-7 bg-neutral-200" />

        {/* ── Middle: Organization icons ── */}
        <nav className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orgs?.map((org) => {
            const active = org.id === currentOrgId;
            return (
              <Tooltip key={org.id} label={org.name} side="right">
                <div className="relative flex items-center">
                  {/* Left pill indicator */}
                  <span
                    className={`absolute -left-3 w-0.75 rounded-r-full transition-all duration-200 ${
                      active
                        ? 'h-5 bg-primary-600 opacity-100'
                        : 'h-2 bg-neutral-400 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  <button
                    onClick={() => handleSwitch(org)}
                    className={`group flex h-9 w-9 items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 rounded-xl ${
                      active
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-200/70 text-neutral-500 hover:bg-neutral-300/80 hover:text-neutral-700'
                    }`}
                  >
                    {orgInitials(org.name)}
                  </button>
                </div>
              </Tooltip>
            );
          })}

          {/* Add organization */}
          <Tooltip label="Create organization" side="right">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-neutral-400 transition-all duration-200 hover:rounded-xl hover:border-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-600"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </Tooltip>
        </nav>

        {/* ── Bottom: User avatar ── */}
        {user && (
          <div className="mt-2 flex flex-col items-center">
            <div className="mb-2 h-px w-7 bg-neutral-200" />
            <Tooltip label={`${user.firstName} ${user.lastName}`} side="right">
              <div>
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="sm"
                  className="ring-2 ring-neutral-200 cursor-default"
                />
              </div>
            </Tooltip>
          </div>
        )}
      </aside>
    </>
  );
}
