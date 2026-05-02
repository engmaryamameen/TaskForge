'use client';

import { useEffect, useState, useCallback } from 'react';
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations';
import { useProjects } from '@/features/projects/hooks/useProjects';
import type { Task, Membership, Project } from '@/types';
import { TaskStatus } from '@/types';
import { getTaskDueLabel } from '@/features/tasks/lib/due-date-label';
import { formatTaskPriority, formatTaskStatus } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import {
  IconX,
  IconEdit,
  IconCalendar,
  IconFolder,
  IconUserCircle,
} from '@/components/icons';

const DRAWER_MS = 320;

interface TaskDetailsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

function DetailRow({
  icon,
  iconClass,
  label,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-3.5 shadow-xs ring-1 ring-neutral-100/80">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export function TaskDetailsDrawer({
  task,
  isOpen,
  onClose,
  onEdit,
}: TaskDetailsDrawerProps) {
  const { data: members } = useOrgMembers();
  const { data: projectsData } = useProjects();
  const projects = projectsData?.data;

  /** Keeps content mounted while exit animation runs after parent clears `task`. */
  const [panelTask, setPanelTask] = useState<Task | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setPanelTask(task);
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = 'hidden';
      return undefined;
    }
    if (!visible) return undefined;
    setAnimating(false);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setPanelTask(null);
      document.body.style.overflow = '';
    }, DRAWER_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, task, visible]);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!visible) return;
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [visible, handleEsc]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible || !panelTask) return null;

  const assignee = panelTask.assignedTo
    ? members?.find((m: Membership) => m.userId === panelTask.assignedTo)
    : null;
  const project = projects?.find((p: Project) => p.id === panelTask.projectId);
  const dueLabel = getTaskDueLabel(panelTask.dueDate, panelTask.status);
  const isDueUrgent =
    dueLabel === 'Overdue' ||
    dueLabel === 'Due today' ||
    dueLabel === 'Due tomorrow';

  const backdropClass = animating ? 'opacity-100' : 'opacity-0';
  const panelClass = animating ? 'translate-x-0' : 'translate-x-full';

  const statusVariant =
    panelTask.status === TaskStatus.TODO
      ? 'todo'
      : panelTask.status === TaskStatus.IN_PROGRESS
        ? 'in-progress'
        : 'done';

  const priorityVariant =
    panelTask.priority === 'urgent'
      ? 'urgent'
      : panelTask.priority === 'high'
        ? 'high'
        : panelTask.priority === 'medium'
          ? 'medium'
          : 'low';

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <button
        type="button"
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${backdropClass}`}
        style={{ transitionDuration: `${DRAWER_MS}ms` }}
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={`relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-neutral-200/90 bg-white shadow-[-12px_0_48px_-8px_rgba(15,23,42,0.15)] transition-transform ease-[cubic-bezier(0.16,1,0.3,1)] ${panelClass}`}
        style={{ transitionDuration: `${DRAWER_MS}ms` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
      >
        {/* Accent rail */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-primary-500 via-primary-600 to-primary-700"
          aria-hidden
        />

        {/* Header */}
        <header className="relative border-b border-neutral-100 bg-linear-to-br from-white via-white to-primary-50/35 px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-600/90">
                Task details
              </p>
              <h2
                id="task-details-title"
                className="mt-2 text-xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-[1.35rem]"
              >
                {panelTask.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant={statusVariant}>{formatTaskStatus(panelTask.status)}</Badge>
                <Badge variant={priorityVariant}>
                  {formatTaskPriority(panelTask.priority)} priority
                </Badge>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-neutral-400 transition-colors hover:border-neutral-200 hover:bg-white hover:text-neutral-800"
              aria-label="Close"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Description */}
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Description
              </h3>
              {panelTask.description ? (
                <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50/70 px-4 py-3.5">
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-700">
                    {panelTask.description}
                  </p>
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/40 px-4 py-6 text-center text-sm text-neutral-400">
                  No description added yet.
                </p>
              )}
            </section>

            {/* Metadata */}
            <section>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Details
              </h3>
              <div className="mt-3 flex flex-col gap-3">
                {project && (
                  <DetailRow
                    icon={<IconFolder className="h-5 w-5" />}
                    iconClass="bg-primary-50 text-primary-700 ring-1 ring-primary-100/80"
                    label="Project"
                  >
                    <p className="truncate text-sm font-semibold text-neutral-900">{project.name}</p>
                  </DetailRow>
                )}

                <DetailRow
                  icon={<IconCalendar className="h-5 w-5" />}
                  iconClass={
                    dueLabel === 'Overdue'
                      ? 'bg-danger-50 text-danger-600 ring-1 ring-danger-100/80'
                      : isDueUrgent
                        ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100/80'
                        : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/60'
                  }
                  label="Due date"
                >
                  <p
                    className={`text-sm font-semibold ${
                      dueLabel === 'Overdue' ? 'text-danger-600' : 'text-neutral-900'
                    }`}
                  >
                    {dueLabel ?? 'No due date'}
                  </p>
                </DetailRow>

                <DetailRow
                  icon={<IconUserCircle className="h-5 w-5" />}
                  iconClass="bg-violet-50 text-violet-700 ring-1 ring-violet-100/80"
                  label="Assignee"
                >
                  {assignee?.user ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        firstName={assignee.user.firstName}
                        lastName={assignee.user.lastName}
                        size="sm"
                      />
                      <span className="text-sm font-semibold text-neutral-900">
                        {assignee.user.firstName} {assignee.user.lastName}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-neutral-500">Unassigned</p>
                  )}
                </DetailRow>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-neutral-200/90 bg-linear-to-t from-neutral-50/95 to-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.08)]">
          <Button
            className="w-full shadow-md shadow-primary-600/15"
            size="lg"
            leftIcon={<IconEdit className="h-4 w-4" />}
            onClick={() => {
              onEdit(panelTask);
              onClose();
            }}
          >
            Edit task
          </Button>
        </footer>
      </aside>
    </div>
  );
}
