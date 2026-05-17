'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  useOrganizations,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { Tooltip } from '@/components/ui/tooltip';
import { IconPlus, IconLogOut } from '@/components/icons';
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

      <aside className="hidden md:flex w-18 shrink-0 flex-col items-center border-r border-neutral-200 bg-neutral-50/80 py-3">
        {/* ── Top: TaskForge brand icon ── */}
        <Tooltip label="TaskForge" side="right">
          <Link href="/" className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden">
            <img
              src="/brand/taskforge-app-icon-transparent.png"
              alt="TaskForge"
              className="h-11 w-11 object-contain"
            />
          </Link>
        </Tooltip>

        <div className="mx-auto mb-2 h-px w-9 bg-neutral-200/80" />

        {/* ── Middle: Organization icons ── */}
        <nav className="flex flex-1 flex-col items-center gap-3 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orgs?.map((org) => {
            const active = org.id === currentOrgId;
            return (
              <Tooltip key={org.id} label={org.name} side="right">
                <div className="relative flex items-center">
                  {/* Left pill indicator */}
                  <span
                    className={`absolute -left-3.75 w-1 rounded-r-full bg-primary-600 transition-all duration-200 ${
                      active ? 'h-5 opacity-100' : 'h-2 opacity-0 group-hover:opacity-60'
                    }`}
                  />
                  <button
                    onClick={() => handleSwitch(org)}
                    className={`group flex h-11 w-11 items-center justify-center text-[13px] font-bold tracking-tight transition-all duration-200 ${
                      active
                        ? `${orgColor(org.name)} rounded-xl text-white shadow-md`
                        : 'rounded-2xl bg-neutral-200/70 text-neutral-500 hover:rounded-xl hover:bg-neutral-300/80 hover:text-neutral-700 hover:shadow-xs'
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-dashed border-neutral-300 text-neutral-400 transition-all duration-200 hover:rounded-xl hover:border-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-600"
            >
              <IconPlus className="h-5 w-5" />
            </button>
          </Tooltip>
        </nav>

        {/* ── Bottom: Sign out ── */}
        <div className="mt-2 flex flex-col items-center gap-3">
          <div className="mx-auto h-px w-9 bg-neutral-200/80" />

          <Tooltip label="Sign out" side="right">
            <button
              onClick={() => logout.mutate()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-600"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
}
