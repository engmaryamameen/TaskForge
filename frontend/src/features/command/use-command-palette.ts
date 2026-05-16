'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const open = useCallback((query?: string) => {
    setInitialQuery(query ?? '');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInitialQuery('');
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (!((e.metaKey || e.ctrlKey) && e.key === 'k')) return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return { isOpen, initialQuery, open, close };
}
