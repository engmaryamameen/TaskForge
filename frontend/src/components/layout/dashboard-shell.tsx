'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from '@/features/command/command-palette';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { TaskModal } from '@/features/tasks/components/task-modal';
import { CreateProjectModal } from '@/features/projects/components/create-project-modal';
import { InviteMemberModal } from '@/features/organizations/components/invite-member-modal';
import { DashboardModalsContext } from '@/components/layout/dashboard-modals-context';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen: paletteOpen, close: closePalette } = useCommandPalette();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
  const contextProjectId = projectMatch ? projectMatch[1] : undefined;

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
  const openInviteModal = useCallback(() => setShowInviteModal(true), []);

  return (
    <DashboardModalsContext.Provider value={{ openTaskModal, openProjectModal, openInviteModal }}>
      <>
        <div className="flex h-screen bg-surface">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-auto">
              <div className="mx-auto px-4 py-6 md:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
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

        <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
      </>
    </DashboardModalsContext.Provider>
  );
}
