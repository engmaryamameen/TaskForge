'use client';

import { useState } from 'react';
import {
  useCreateOrganization,
  useSwitchOrganization,
} from '@/features/organizations/hooks/useOrganizations';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrgModal({ isOpen, onClose }: CreateOrgModalProps) {
  const [name, setName] = useState('');
  const createOrg = useCreateOrganization();
  const switchOrg = useSwitchOrganization();

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Organization"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-org-form" loading={isPending} disabled={!name.trim()}>
            Create
          </Button>
        </>
      }
    >
      {createOrg.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
          Failed to create organization. Please try again.
        </div>
      )}

      <form id="create-org-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="org-name"
          label="Organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Inc"
          autoFocus
        />
      </form>
    </Modal>
  );
}
