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

      <aside className="hidden md:flex w-[68px] shrink-0 flex-col items-center bg-[#1e2330] py-4">
        {/* ── Top: TaskForge brand icon ── */}
        <Tooltip label="TaskForge" side="right">
          <Link href="/" className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden">
            <img
              src="/brand/taskforge-app-icon-transparent.png"
              alt="TaskForge"
              className="h-10 w-10 object-contain"
            />
          </Link>
        </Tooltip>

        <div className="mx-auto mb-3 h-px w-8 bg-white/8" />

        {/* ── Middle: Organization icons ── */}
        <nav className="flex flex-1 flex-col items-center gap-2.5 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {orgs?.map((org) => {
            const active = org.id === currentOrgId;
            return (
              <Tooltip key={org.id} label={org.name} side="right">
                <div className="relative flex items-center">
                  {/* Left pill indicator for active org */}
                  <span
                    className={`absolute -left-[13px] h-5 w-1 rounded-r-full bg-white transition-all duration-200 ${
                      active ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                    }`}
                  />
                  <button
                    onClick={() => handleSwitch(org)}
                    className={`flex h-10 w-10 items-center justify-center text-[13px] font-bold transition-all duration-200 ${
                      active
                        ? `${orgColor(org.name)} rounded-xl text-white shadow-md`
                        : 'rounded-2xl bg-[#2a3040] text-[#8b95a9] hover:rounded-xl hover:bg-[#353d50] hover:text-white'
                    }`}
                  >
                    {orgInitials(org.name)}
                  </button>
                </div>
              </Tooltip>
            );
          })}

          {/* Add organization — same shape as org icons */}
          <Tooltip label="Create organization" side="right">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-dashed border-[#3d4556] text-[#5c6677] transition-all duration-200 hover:rounded-xl hover:border-[#5c6677] hover:bg-[#2a3040] hover:text-white"
            >
              <IconPlus className="h-4.5 w-4.5" />
            </button>
          </Tooltip>
        </nav>

        {/* ── Bottom: Sign out + User avatar ── */}
        <div className="mt-3 flex flex-col items-center gap-2.5">
          <div className="mx-auto h-px w-8 bg-white/8" />

          <Tooltip label="Sign out" side="right">
            <button
              onClick={() => logout.mutate()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5c6677] transition-colors hover:bg-[#2a3040] hover:text-white"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          </Tooltip>

          {user && (
            <Tooltip label={`${user.firstName} ${user.lastName}`} side="right">
              <div>
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="sm"
                  className="ring-2 ring-[#2a3040] cursor-default"
                />
              </div>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  );
}
