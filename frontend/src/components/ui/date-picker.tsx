'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { IconCalendar } from '@/components/icons';
import { formatLocaleShortDate, parseISODateLocal, toLocalISODateString } from '@/lib/utils/dates';

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

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
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = value ? parseISODateLocal(value) : null;

  useEffect(() => {
    if (!open) return;
    const base = value ? parseISODateLocal(value) : new Date();
    setMonth(startOfMonth(base ?? new Date()));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const display = value ? formatLocaleShortDate(value) : '';

  const fieldRing = error
    ? 'border-2 border-danger-500 hover:border-danger-600 focus-visible:border-danger-600 focus-visible:ring-danger-200'
    : 'border border-neutral-200 hover:border-neutral-300 focus-visible:border-primary-500 focus-visible:ring-primary-100';

  return (
    <div ref={rootRef} className="relative text-left">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <button
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

      {open && !disabled && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-full z-[60] mt-1.5 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg ring-1 ring-black/5"
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
        </div>
      )}

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
