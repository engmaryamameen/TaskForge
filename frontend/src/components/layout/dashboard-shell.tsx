'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from '@/features/command/command-palette';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { CreateProjectModal } from '@/features/projects/components/create-project-modal';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen: paletteOpen, close: closePalette } = useCommandPalette();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Context-aware: detect project ID from URL for quick create
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const contextProjectId = projectMatch ? projectMatch[1] : undefined;

  // Ctrl+N → quick create task
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowTaskModal(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openTaskModal = useCallback(() => setShowTaskModal(true), []);
  const openProjectModal = useCallback(() => setShowProjectModal(true), []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={closePalette}
        onOpenTaskModal={openTaskModal}
        onOpenProjectModal={openProjectModal}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        projectId={contextProjectId}
      />

      <CreateProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
    </div>
  );
}
