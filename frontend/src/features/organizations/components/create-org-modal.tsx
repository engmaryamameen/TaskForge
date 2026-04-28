'use client';

import { useState } from 'react';
import {
  useCreateOrganization,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
  const [name, setName] = useState('');
  const createOrg = useCreateOrganization();
  const switchOrg = useSwitchOrganization();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data } = await createOrg.mutateAsync({ name: trimmed });
    const newOrg = data.data!;
    await switchOrg.mutateAsync(newOrg.id);
    setName('');
    onClose();
  }

  const isPending = createOrg.isPending || switchOrg.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Organization</h2>

        {createOrg.error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
            Failed to create organization. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="org-name" className="mb-1 block text-sm font-medium text-gray-700">
              Organization name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc"
              autoFocus
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
