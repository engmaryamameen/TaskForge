'use client';

import { useRef, useCallback, type KeyboardEvent } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        onChange(tabs[nextIndex].id);
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [tabs, activeTab, onChange],
  );

  return (
    <div
      className="flex gap-1 border-b border-neutral-200"
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-primary-700'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
