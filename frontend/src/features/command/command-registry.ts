import type { ComponentType } from 'react';

export interface CommandContext {
  navigate: (path: string) => void;
  openTaskModal: () => void;
  openProjectModal: () => void;
}

export interface Command {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  group: 'navigation' | 'action';
  shortcut?: string;
  run: (ctx: CommandContext) => void;
}

export function getNavigationCommands(): Command[] {
  return [
    { id: 'nav-dashboard', label: 'Go to Dashboard', group: 'navigation', run: (ctx) => ctx.navigate('/') },
    { id: 'nav-projects', label: 'Go to Projects', group: 'navigation', run: (ctx) => ctx.navigate('/projects') },
    { id: 'nav-tasks', label: 'Go to Tasks', group: 'navigation', run: (ctx) => ctx.navigate('/tasks') },
    { id: 'nav-organizations', label: 'Go to Organizations', group: 'navigation', run: (ctx) => ctx.navigate('/organizations') },
    { id: 'nav-activity', label: 'Go to Activity', group: 'navigation', run: (ctx) => ctx.navigate('/activity') },
    { id: 'nav-settings', label: 'Go to Settings', group: 'navigation', run: (ctx) => ctx.navigate('/settings') },
  ];
}

export function getActionCommands(): Command[] {
  return [
    { id: 'action-create-task', label: 'Create Task', group: 'action', shortcut: 'Ctrl+N', run: (ctx) => ctx.openTaskModal() },
    { id: 'action-create-project', label: 'Create Project', group: 'action', run: (ctx) => ctx.openProjectModal() },
  ];
}

export function filterCommands(commands: Command[], search: string): Command[] {
  if (!search.trim()) return commands;
  const lower = search.toLowerCase();
  return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
}
