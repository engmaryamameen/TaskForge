'use client';

import { useState } from 'react';
import { useCreateProject } from '@/features/projects/hooks/useProjects';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useAuthStore } from '@/store/auth.store';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { IconUsers, IconGlobe, IconCheck } from '@/components/icons';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const createProject = useCreateProject();
  const { data: orgMembers } = useOrgMembers();
  const currentUserId = useAuthStore((s) => s.user?.id);

  function toggleMember(userId: string) {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createProject.mutate(
      {
        name: trimmedName,
        description: description.trim() || undefined,
        visibility,
        memberIds: visibility === 'private' ? selectedMembers : undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setVisibility('public');
          setSelectedMembers([]);
          onClose();
        },
      },
    );
  }

  const otherMembers = orgMembers?.filter((m) => m.userId !== currentUserId) ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Project"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-project-form" loading={createProject.isPending} disabled={!name.trim()}>
            Create
          </Button>
        </>
      }
    >
      {createProject.error && (
        <div className="mb-4 rounded-lg bg-danger-50 border border-danger-100 p-3 text-sm text-danger-700">
          {createProject.error instanceof Error && 'code' in createProject.error && (createProject.error as { code: string }).code === 'INSUFFICIENT_ROLE'
            ? 'You don\u2019t have permission to create projects. Contact your organization admin.'
            : 'Failed to create project. Please try again.'}
        </div>
      )}

      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
        />
        <Textarea
          id="project-desc"
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          rows={3}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Who can access this project?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setVisibility('public'); setSelectedMembers([]); }}
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left text-sm transition-all ${
                visibility === 'public'
                  ? 'border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <IconGlobe className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">All members</p>
                <p className="text-xs text-neutral-500">Everyone in the org</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVisibility('private')}
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left text-sm transition-all ${
                visibility === 'private'
                  ? 'border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <IconUsers className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Specific members</p>
                <p className="text-xs text-neutral-500">Only invited members</p>
              </div>
            </button>
          </div>
        </div>

        {visibility === 'private' && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">
              Select members
              {selectedMembers.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-neutral-400">
                  {selectedMembers.length} selected
                </span>
              )}
            </p>
            <p className="mb-3 text-xs text-neutral-500">You will be added automatically as project manager.</p>

            {otherMembers.length === 0 ? (
              <p className="text-sm text-neutral-400 py-3 text-center">No other members in this organization yet.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
                {otherMembers.map((member) => {
                  const selected = selectedMembers.includes(member.userId);
                  return (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => toggleMember(member.userId)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        selected ? 'bg-primary-50' : 'hover:bg-neutral-50'
                      } ${member.userId !== otherMembers[otherMembers.length - 1]?.userId ? 'border-b border-neutral-100' : ''}`}
                    >
                      <Avatar
                        firstName={member.user?.firstName}
                        lastName={member.user?.lastName}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{member.user?.email}</p>
                      </div>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        selected
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-neutral-300'
                      }`}>
                        {selected && <IconCheck className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
