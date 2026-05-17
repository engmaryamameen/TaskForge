'use client';

import { FilterChips } from '@/components/ui/filter-chips';
import type { ActivityTabFilter } from '@/types';

const TABS: { id: ActivityTabFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My activity' },
  { id: 'assigned', label: 'Assigned to me' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
];

interface ActivityFiltersProps {
  active: ActivityTabFilter;
  onChange: (tab: ActivityTabFilter) => void;
}

export function ActivityFilters({ active, onChange }: ActivityFiltersProps) {
  return <FilterChips chips={TABS} active={active} onChange={onChange} />;
}
