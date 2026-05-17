'use client';

import { useState, useRef } from 'react';
import { useCommandPalette } from '@/features/command/use-command-palette';
import { SearchIcon } from '@/assets/svg';

export function SearchInput() {
  const { open: openPalette } = useCommandPalette();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      openPalette(val);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  function handleFocus() {
    if (query.length > 0) {
      openPalette(query);
      setQuery('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      openPalette(query);
      setQuery('');
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-14 text-sm text-neutral-900 placeholder:text-neutral-400 transition-all hover:border-neutral-300 hover:bg-white focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400 pointer-events-none">
        &#8984;K
      </kbd>
    </div>
  );
}
