'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { TaskStatus, TaskPriority } from '@/types';
import { formatTaskStatus, formatTaskPriority } from '@/lib/utils';

interface TaskFiltersProps {
  search: string;
  status: string;
  priority: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  showSearch?: boolean;
}

export function TaskFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  showSearch = true,
}: TaskFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  const stableOnSearchChange = useCallback(onSearchChange, [onSearchChange]);

  useEffect(() => {
    stableOnSearchChange(debouncedSearch);
  }, [debouncedSearch, stableOnSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="flex flex-wrap gap-3">
      {showSearch && (
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        {Object.values(TaskStatus).map((s) => (
          <option key={s} value={s}>{formatTaskStatus(s)}</option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All priorities</option>
        {Object.values(TaskPriority).map((p) => (
          <option key={p} value={p}>{formatTaskPriority(p)}</option>
        ))}
      </select>
    </div>
  );
}
