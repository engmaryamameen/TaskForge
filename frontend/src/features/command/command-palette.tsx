'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command as Cmdk } from 'cmdk';
import { useDebounce } from '@/hooks/useDebounce';
import { apiClient } from '@/lib/api/client';
import {
  getNavigationCommands,
  getActionCommands,
  filterCommands,
  type CommandContext,
} from './command-registry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskModal: () => void;
  onOpenProjectModal: () => void;
}

interface SearchResult {
  id: string;
  type: 'project' | 'task';
  title: string;
  path: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenTaskModal,
  onOpenProjectModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const ctx: CommandContext = useMemo(() => ({
    navigate: (path: string) => { router.push(path); onClose(); },
    openTaskModal: () => { onOpenTaskModal(); onClose(); },
    openProjectModal: () => { onOpenProjectModal(); onClose(); },
  }), [router, onClose, onOpenTaskModal, onOpenProjectModal]);

  const navCommands = useMemo(() => getNavigationCommands(), []);
  const actionCommands = useMemo(() => getActionCommands(), []);
  const allCommands = useMemo(() => [...navCommands, ...actionCommands], [navCommands, actionCommands]);
  const filtered = useMemo(() => filterCommands(allCommands, search), [allCommands, search]);

  // Dedicated search queries (not page hooks)
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    Promise.all([
      apiClient.get('/projects', { params: { search: debouncedSearch, limit: 5 } }).catch(() => ({ data: { data: [] } })),
      apiClient.get('/tasks', { params: { search: debouncedSearch, limit: 5 } }).catch(() => ({ data: { data: [] } })),
    ]).then(([projectsRes, tasksRes]) => {
      const results: SearchResult[] = [];
      const projects = projectsRes.data?.data || [];
      const tasks = tasksRes.data?.data || [];

      for (const p of projects) {
        results.push({ id: p.id, type: 'project', title: p.name, path: `/projects/${p.id}` });
      }
      for (const t of tasks) {
        results.push({ id: t.id, type: 'task', title: t.title, path: `/tasks` });
      }

      setSearchResults(results);
      setSearching(false);
    });
  }, [debouncedSearch]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/4 z-10 w-full max-w-lg -translate-x-1/2">
        <Cmdk
          className="rounded-lg border border-gray-200 bg-white shadow-2xl"
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
          <Cmdk.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full border-b border-gray-200 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
          />
          <Cmdk.List className="max-h-80 overflow-y-auto p-2">
            <Cmdk.Empty className="px-4 py-6 text-center text-sm text-gray-500">
              {searching ? 'Searching...' : 'No results found.'}
            </Cmdk.Empty>

            {filtered.filter((c) => c.group === 'navigation').length > 0 && (
              <Cmdk.Group heading="Navigation" className="text-xs font-medium text-gray-400 px-2 py-1.5">
                {filtered.filter((c) => c.group === 'navigation').map((cmd) => (
                  <Cmdk.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => cmd.run(ctx)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 aria-selected:bg-blue-50 aria-selected:text-blue-700"
                  >
                    <span>{cmd.label}</span>
                  </Cmdk.Item>
                ))}
              </Cmdk.Group>
            )}

            {filtered.filter((c) => c.group === 'action').length > 0 && (
              <Cmdk.Group heading="Actions" className="text-xs font-medium text-gray-400 px-2 py-1.5">
                {filtered.filter((c) => c.group === 'action').map((cmd) => (
                  <Cmdk.Item
                    key={cmd.id}
                    value={cmd.label}
                    onSelect={() => cmd.run(ctx)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-gray-700 aria-selected:bg-blue-50 aria-selected:text-blue-700"
                  >
                    <span>{cmd.label}</span>
                    {cmd.shortcut && (
                      <span className="text-xs text-gray-400">{cmd.shortcut}</span>
                    )}
                  </Cmdk.Item>
                ))}
              </Cmdk.Group>
            )}

            {searchResults.length > 0 && (
              <Cmdk.Group heading="Search Results" className="text-xs font-medium text-gray-400 px-2 py-1.5">
                {searchResults.map((result) => (
                  <Cmdk.Item
                    key={`${result.type}-${result.id}`}
                    value={`${result.type} ${result.title}`}
                    onSelect={() => { router.push(result.path); onClose(); }}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 aria-selected:bg-blue-50 aria-selected:text-blue-700"
                  >
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {result.type}
                    </span>
                    <span>{result.title}</span>
                  </Cmdk.Item>
                ))}
              </Cmdk.Group>
            )}
          </Cmdk.List>
        </Cmdk>
      </div>
    </div>
  );
}
