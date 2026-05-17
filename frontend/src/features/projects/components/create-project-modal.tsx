'use client';

import { useState } from 'react';
import { useCreateProject } from '@/features/projects/hooks/useProjects';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { IconUsers, IconGlobe } from '@/components/icons';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const createProject = useCreateProject();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createProject.mutate(
      {
        name: trimmedName,
        description: description.trim() || undefined,
        visibility,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setVisibility('public');
          onClose();
        },
      },
    );
  }

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
          {(createProject.error as any)?.code === 'INSUFFICIENT_ROLE'
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
              onClick={() => setVisibility('public')}
              className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left text-sm transition-all ${
                visibility === 'public'
                  ? 'border-primary-300 bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <IconGlobe className="h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">All members</p>
                <p className="text-xs text-neutral-500">Visible to everyone in the organization</p>
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
                <p className="text-xs text-neutral-500">Only invited project members</p>
              </div>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
