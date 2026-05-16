'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { IconSearch } from '@/components/icons';

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export function ProjectFilters({ search, onSearchChange, className = '' }: ProjectFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className={`w-full md:max-w-md lg:max-w-lg ${className}`}>
      <Input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search by name or description..."
        leftIcon={<IconSearch className="h-4 w-4" />}
        className="h-10 rounded-xl border-neutral-200 bg-neutral-50/50 shadow-xs placeholder:text-neutral-400 focus:bg-white"
      />
    </div>
  );
}
