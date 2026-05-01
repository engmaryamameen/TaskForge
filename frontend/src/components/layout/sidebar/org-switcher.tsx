'use client';

import { useRef, useState, useCallback } from 'react';
import {
  useOrganizations,
  useCurrentOrganization,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { useClickOutside } from '@/hooks/useClickOutside';
import { IconChevronDown } from '@/components/icons';

export function OrgSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close);

  const { data: currentOrg, isLoading: currentLoading } = useCurrentOrganization();
  const { data: orgs, isLoading: orgsLoading } = useOrganizations();
  const switchOrg = useSwitchOrganization();

  function handleSwitch(orgId: string) {
    switchOrg.mutate(orgId);
    setIsOpen(false);
  }

  if (currentLoading) {
    return (
      <div className="h-9 animate-pulse rounded-md bg-white/10" />
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
      >
        <span className="truncate">{currentOrg?.name ?? 'Select organization'}</span>
        <IconChevronDown
          className={`h-4 w-4 text-blue-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {orgsLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : (
            orgs?.map((org) => {
              const isCurrent = org.id === currentOrg?.id;
              return (
                <button
                  key={org.id}
                  onClick={() => !isCurrent && handleSwitch(org.id)}
                  disabled={isCurrent}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {isCurrent && (
                    <span className="text-xs text-blue-500">Current</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
