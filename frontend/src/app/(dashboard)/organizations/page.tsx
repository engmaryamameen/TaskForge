'use client';

import { useState } from 'react';
import {
  useOrganizations,
  useCurrentOrganization,
  useSwitchOrganization,
  useCreateOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { formatRelative } from '@/lib/utils';

export default function OrganizationsPage() {
  const { data: orgs, isLoading } = useOrganizations();
  const { data: currentOrg } = useCurrentOrganization();
  const switchOrg = useSwitchOrganization();
  const createOrg = useCreateOrganization();

  const [newOrgName, setNewOrgName] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newOrgName.trim();
    if (!name) return;
    createOrg.mutate({ name }, {
      onSuccess: () => setNewOrgName(''),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Organizations</h1>

      {isLoading && (
        <p className="text-sm text-gray-500">Loading organizations...</p>
      )}

      {orgs && (
        <div className="space-y-3">
          {orgs.map((org) => {
            const isCurrent = org.id === currentOrg?.id;
            return (
              <div
                key={org.id}
                className={`flex items-center justify-between rounded-lg bg-white p-5 shadow-sm ${
                  isCurrent ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{org.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {org.slug} &middot; Created {formatRelative(org.createdAt)}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Current
                  </span>
                ) : (
                  <button
                    onClick={() => switchOrg.mutate(org.id)}
                    disabled={switchOrg.isPending}
                    className="rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Switch
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {orgs?.length === 0 && (
        <p className="text-sm text-gray-500">No organizations yet.</p>
      )}

      {/* Create organization */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Organization</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization name"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={createOrg.isPending || !newOrgName.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createOrg.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
