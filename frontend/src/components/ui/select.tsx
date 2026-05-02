'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown } from '@/components/icons';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface SelectProps {
  id?: string;
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'sm';
  triggerClassName?: string;
}

export function Select({
  id: idProp,
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  className = '',
  size = 'md',
  triggerClassName = '',
}: SelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listboxId = `${id}-listbox`;

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabledIndices = useMemo(
    () =>
      options
        .map((o, i) => (!o.disabled ? i : -1))
        .filter((i): i is number => i >= 0),
    [options],
  );

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? (value ? value : placeholder);

  useEffect(() => setMounted(true), []);

  const positionMenu = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      left: r.left,
      top: r.bottom + 4,
      width: Math.max(r.width, size === 'sm' ? 140 : 168),
      zIndex: 100,
    });
  }, [size]);

  useLayoutEffect(() => {
    if (open) positionMenu();
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    function onScrollResize() {
      positionMenu();
    }
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open, positionMenu]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    let next = idx >= 0 && !options[idx]!.disabled ? idx : enabledIndices[0] ?? 0;
    if (options[next]?.disabled) next = enabledIndices[0] ?? 0;
    setHighlightedIndex(next);
  }, [open, value, options, enabledIndices]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, open]);

  function selectIndex(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveHighlight(delta: number) {
    if (enabledIndices.length === 0) return;
    let pos = enabledIndices.indexOf(highlightedIndex);
    if (pos < 0) pos = 0;
    pos = (pos + delta + enabledIndices.length) % enabledIndices.length;
    setHighlightedIndex(enabledIndices[pos]!);
  }

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveHighlight(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveHighlight(-1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      selectIndex(highlightedIndex);
    }
  }

  const menu =
    open &&
    mounted &&
    createPortal(
      <div
        ref={menuRef}
        id={listboxId}
        role="listbox"
        tabIndex={-1}
        style={menuStyle}
        onKeyDown={onMenuKeyDown}
        className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white py-1 shadow-overlay outline-none ring-1 ring-neutral-900/4"
      >
        <div className="max-h-[min(280px,calc(100vh-120px))] overflow-y-auto overscroll-contain px-1 py-0.5">
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <button
                key={`${opt.value}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                tabIndex={-1}
                className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isHighlighted || isSelected
                    ? 'font-semibold text-primary-700'
                    : 'font-normal text-neutral-600 hover:text-neutral-900'
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => selectIndex(index)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  const triggerMd = `relative flex w-full items-center gap-2 rounded-xl border bg-white py-2.5 pl-3 pr-10 text-left text-sm font-medium text-neutral-900 shadow-xs transition-all duration-150 ${
    error
      ? 'border-danger-300 focus-visible:border-danger-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-100'
      : 'border-neutral-200/90 hover:border-neutral-300 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100'
  }`;

  const triggerSm = `relative inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 pr-7 text-left text-[11px] font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${triggerClassName}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className={size === 'md' ? 'relative' : 'relative inline-block max-w-full'}>
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={`${size === 'md' ? triggerMd : triggerSm} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <IconChevronDown
            className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 shrink-0 text-neutral-400 transition-transform ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      {menu}
    </div>
  );
}
