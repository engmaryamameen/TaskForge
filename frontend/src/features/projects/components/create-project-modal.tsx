'use client';

import { useState } from 'react';
import { useCreateProject } from '@/features/projects/hooks/useProjects';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = useCreateProject();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createProject.mutate(
      { name: trimmedName, description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
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
      </form>
    </Modal>
  );
}
