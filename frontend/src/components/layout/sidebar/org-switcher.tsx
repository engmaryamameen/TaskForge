'use client';

import { useRef, useState, useCallback } from 'react';
import {
  useOrganizations,
  useCurrentOrganization,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { useClickOutside } from '@/hooks/useClickOutside';
import { IconChevronDown, IconCheck } from '@/components/icons';

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
      <div className="h-8 animate-pulse rounded-md bg-neutral-100" />
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-700">
            {currentOrg?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <span className="truncate">{currentOrg?.name ?? 'Select organization'}</span>
        </div>
        <IconChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-neutral-200 bg-white py-1 shadow-overlay">
          {orgsLoading ? (
            <div className="px-3 py-2 text-xs text-neutral-500">Loading...</div>
          ) : (
            orgs?.map((org) => {
              const isCurrent = org.id === currentOrg?.id;
              return (
                <button
                  key={org.id}
                  onClick={() => !isCurrent && handleSwitch(org.id)}
                  disabled={isCurrent}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors ${
                    isCurrent
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      isCurrent ? 'bg-primary-200 text-primary-800' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{org.name}</span>
                  </div>
                  {isCurrent && (
                    <IconCheck className="h-4 w-4 text-primary-600" />
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
