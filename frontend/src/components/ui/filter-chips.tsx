'use client';

interface FilterChip<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  chips: FilterChip<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function FilterChips<T extends string>({ chips, active, onChange }: FilterChipsProps<T>) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => {
        const isActive = chip.id === active;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
            }`}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span className={`ml-1.5 ${isActive ? 'text-white/70' : 'text-neutral-400'}`}>
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
