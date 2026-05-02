'use client';

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
  return (
    <div className="flex flex-wrap gap-2 border-b border-neutral-100 pb-4">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
            active === t.id
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/90 hover:text-neutral-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
