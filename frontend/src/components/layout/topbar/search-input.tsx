'use client';

import { useCommandPalette } from '@/features/command/use-command-palette';
import { SearchIcon } from '@/assets/svg';

export function SearchInput() {
  const { open: openPalette } = useCommandPalette();

  return (
    <button
      onClick={() => openPalette()}
      className="flex w-full items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-400 transition-all hover:border-neutral-300 hover:bg-white hover:text-neutral-500"
    >
      <SearchIcon className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">Search or jump to...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400">
        &#8984;K
      </kbd>
    </button>
  );
}

export function MobileSearchButton() {
  const { open: openPalette } = useCommandPalette();

  return (
    <button
      onClick={() => openPalette()}
      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors md:hidden"
      aria-label="Search"
    >
      <SearchIcon className="h-5 w-5" />
    </button>
  );
}
