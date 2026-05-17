'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  useOrganizations,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Tooltip } from '@/components/ui/tooltip';
import { IconBolt, IconPlus, IconLogOut } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';
import type { OrganizationWithRole } from '@/types';

/* ── Helpers ── */

const ORG_COLORS = [
  'bg-primary-600',
  'bg-purple-600',
  'bg-teal-600',
  'bg-orange-600',
  'bg-success-600',
  'bg-danger-600',
  'bg-info-600',
  'bg-warning-600',
] as const;

function orgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ORG_COLORS[Math.abs(hash) % ORG_COLORS.length];
}

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
  const logout = useLogout();
  const [showCreateModal, setShowCreateModal] = useState(false);

  function handleSwitch(org: OrganizationWithRole) {
    if (org.id === currentOrgId) return;
    switchOrg.mutate(org.id);
  }

  return (
    <>
      <CreateOrgModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <aside className="hidden md:flex w-[68px] shrink-0 flex-col items-center bg-neutral-900 py-4">
        {/* ── Top: TaskForge icon ── */}
        <Tooltip label="TaskForge">
          <button className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md transition hover:brightness-110">
            <IconBolt className="h-5 w-5" />
          </button>
        </Tooltip>

        <div className="mx-auto mb-3 h-px w-8 bg-white/10" />

        {/* ── Middle: Organization icons ── */}
        <nav className="flex flex-1 flex-col items-center gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orgs?.map((org) => {
            const active = org.id === currentOrgId;
            return (
              <Tooltip key={org.id} label={org.name}>
                <button
                  onClick={() => handleSwitch(org)}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? `${orgColor(org.name)} text-white shadow-lg ring-2 ring-white/90`
                      : `bg-neutral-700 text-neutral-300 hover:rounded-xl hover:bg-neutral-600 hover:text-white`
                  }`}
                >
                  {orgInitials(org.name)}
                </button>
              </Tooltip>
            );
          })}

          {/* Add organization */}
          <Tooltip label="Create organization">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-transparent text-neutral-500 transition-all hover:rounded-xl hover:bg-neutral-700 hover:text-white"
            >
              <IconPlus className="h-5 w-5" />
            </button>
          </Tooltip>
        </nav>

        {/* ── Bottom: User avatar + sign out ── */}
        <div className="mt-3 flex flex-col items-center gap-2">
          <div className="mx-auto mb-1 h-px w-8 bg-white/10" />

          <Tooltip label="Sign out">
            <button
              onClick={() => logout.mutate()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-700 hover:text-white"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          </Tooltip>

          {user && (
            <Tooltip label={`${user.firstName} ${user.lastName}`}>
              <div>
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="sm"
                  className="ring-2 ring-neutral-700 cursor-default"
                />
              </div>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
}
