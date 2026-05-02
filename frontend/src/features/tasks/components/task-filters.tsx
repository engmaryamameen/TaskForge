'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
    <div className="flex flex-wrap items-end gap-3">
      {showSearch && (
        <div className="w-full max-w-xs">
          <Input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search tasks..."
          />
        </div>
      )}

      <div className="w-40">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="">All statuses</option>
          {Object.values(TaskStatus).map((s) => (
            <option key={s} value={s}>{formatTaskStatus(s)}</option>
          ))}
        </Select>
      </div>

      <div className="w-40">
        <Select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="">All priorities</option>
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>{formatTaskPriority(p)}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}
