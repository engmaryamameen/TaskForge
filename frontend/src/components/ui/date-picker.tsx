'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from '@/components/ui/calendar';
import { IconCalendar } from '@/components/icons';
import { formatLocaleShortDate, parseISODateLocal, toLocalISODateString } from '@/lib/utils/dates';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const POPOVER_WIDTH = 288;
/** Used only when popover ref has not laid out yet */
const ESTIMATED_POPOVER_HEIGHT = 360;

interface DatePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'mm/dd/yyyy',
  disabled,
  error,
  hint,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = value ? parseISODateLocal(value) : null;

  useEffect(() => {
    if (!open) return;
    const base = value ? parseISODateLocal(value) : new Date();
    setMonth(startOfMonth(base ?? new Date()));
  }, [open, value]);

  const updatePopoverPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const r = trigger.getBoundingClientRect();
    const gap = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = r.left;
    left = Math.max(8, Math.min(left, vw - POPOVER_WIDTH - 8));

    const measuredH = popoverRef.current?.getBoundingClientRect().height ?? 0;
    const popoverH = measuredH > 0 ? measuredH : ESTIMATED_POPOVER_HEIGHT;

    let top = r.bottom + gap;
    const spaceBelow = vh - r.bottom - gap;
    const spaceAbove = r.top - gap;

    if (spaceBelow < popoverH && spaceAbove > spaceBelow) {
      top = r.top - gap - popoverH;
    }
    top = Math.max(8, Math.min(top, vh - popoverH - 8));

    setPopoverStyle({
      position: 'fixed',
      top,
      left,
      width: POPOVER_WIDTH,
      zIndex: 200,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open || disabled) return;
    updatePopoverPosition();
    const id = requestAnimationFrame(() => updatePopoverPosition());
    return () => cancelAnimationFrame(id);
  }, [open, disabled, month, updatePopoverPosition]);

  useEffect(() => {
    if (!open || disabled) return;

    updatePopoverPosition();
    const ro = new ResizeObserver(() => updatePopoverPosition());
    if (triggerRef.current) ro.observe(triggerRef.current);
    if (popoverRef.current) ro.observe(popoverRef.current);

    window.addEventListener('scroll', updatePopoverPosition, true);
    window.addEventListener('resize', updatePopoverPosition);

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', updatePopoverPosition, true);
      window.removeEventListener('resize', updatePopoverPosition);
    };
  }, [open, disabled, updatePopoverPosition]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  /** Close picker first on Escape without dismissing the parent modal */
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [open]);

  const display = value ? formatLocaleShortDate(value) : '';

  const fieldRing = error
    ? 'border-2 border-danger-500 hover:border-danger-600 focus-visible:border-danger-600 focus-visible:ring-danger-200'
    : 'border border-neutral-200 hover:border-neutral-300 focus-visible:border-primary-500 focus-visible:ring-primary-100';

  const popover =
    open &&
    !disabled &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Choose date"
        style={popoverStyle}
        className="rounded-xl border border-neutral-200 bg-white p-3 shadow-xl ring-1 ring-black/5"
      >
        <Calendar
          month={month}
          onMonthChange={setMonth}
          selected={selected}
          onSelect={(d) => {
            onChange(toLocalISODateString(d));
            setOpen(false);
          }}
          onClear={() => {
            onChange('');
            setOpen(false);
          }}
        />
      </div>,
      document.body,
    );

  return (
    <div className="text-left">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${fieldRing}`}
      >
        <span className={`min-w-0 truncate ${display ? 'text-neutral-900' : 'text-neutral-400'}`}>
          {display || placeholder}
        </span>
        <IconCalendar className="h-5 w-5 shrink-0 text-neutral-400" />
      </button>

      {popover}

      <div className="mt-1.5 min-h-6">
        {error ? (
          <p className="text-xs leading-snug text-danger-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-neutral-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
