'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ProjectFilters({ search, onSearchChange }: ProjectFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Sync external search changes (e.g. URL navigation)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search projects..."
        className="w-full max-w-sm rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
