'use client';

import { useRef, useState, useCallback } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDashboardModals } from '@/components/layout/dashboard-modals-context';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/lib/rbac';
import { IconPlus, IconCheckSquare, IconFolder, IconUserPlus } from '@/components/icons';

interface CreateAction {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  action: () => void;
  adminOnly?: boolean;
}

function MenuItem({ item, onClose }: { item: CreateAction; onClose: () => void }) {
  return (
    <button
      onClick={() => { item.action(); onClose(); }}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-50 transition-colors"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconColor}`}>
        <item.icon className="h-4.5 w-4.5" />
      </div>
      <div className="text-left min-w-0">
        <p className="text-[13px] font-medium text-neutral-900">{item.label}</p>
        <p className="text-[11px] text-neutral-500 leading-snug">{item.description}</p>
      </div>
    </button>
  );
}

export function CreateMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const { openTaskModal, openProjectModal, openInviteModal } = useDashboardModals();
  const { can } = usePermission();

  const actions: CreateAction[] = [
    {
      key: 'task',
      label: 'Task',
      description: 'Create and assign a new task',
      icon: IconCheckSquare,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      action: openTaskModal,
    },
    {
      key: 'project',
      label: 'Project',
      description: 'Start a new project workspace',
      icon: IconFolder,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      action: openProjectModal,
    },
    {
      key: 'invite',
      label: 'Invite people',
      description: 'Add teammates to this organization',
      icon: IconUserPlus,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      action: openInviteModal,
      adminOnly: true,
    },
  ];

  const visibleActions = actions.filter((a) => !a.adminOnly || can(Permission.MEMBER_INVITE));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          open
            ? 'bg-primary-600 text-white shadow-md rotate-45'
            : 'bg-neutral-100 text-neutral-500 hover:bg-primary-100 hover:text-primary-600'
        }`}
      >
        <IconPlus className="h-5 w-5 transition-transform duration-300" />
      </button>

      <div
        className={`absolute bottom-0 left-full ml-3 w-80 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-overlay transition-all duration-200 origin-bottom-left z-9999 ${
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-3 pt-2 pb-1.5">
          <p className="text-sm font-bold text-neutral-900">Create</p>
          <p className="text-[11px] text-neutral-500 leading-snug">Start something new in your workspace</p>
        </div>

        <div className="py-1">
          {visibleActions.map((item) => (
            <MenuItem key={item.key} item={item} onClose={close} />
          ))}
        </div>
      </div>
    </div>
  );
}
