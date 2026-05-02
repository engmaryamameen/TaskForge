'use client';

import { useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';
import { toLocalISODateString } from '@/lib/utils/dates';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(monthStart: Date, delta: number): Date {
  return new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildWeekRows(monthStart: Date): Array<Array<{ date: Date; inMonth: boolean }>> {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const first = new Date(year, month, 1);
  const lead = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const flat: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = 0; i < lead; i++) {
    const d = new Date(year, month, 1 - (lead - i));
    flat.push({ date: d, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    flat.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (flat.length % 7 !== 0) {
    const last = flat[flat.length - 1].date;
    flat.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }

  const rows: Array<Array<{ date: Date; inMonth: boolean }>> = [];
  for (let i = 0; i < flat.length; i += 7) {
    rows.push(flat.slice(i, i + 7));
  }
  return rows;
}

export interface CalendarProps {
  /** First day of the visible month */
  month: Date;
  onMonthChange: (nextMonthStart: Date) => void;
  /** Selected day or null */
  selected: Date | null;
  onSelect: (day: Date) => void;
  onClear?: () => void;
}

export function Calendar({ month, onMonthChange, selected, onSelect, onClear }: CalendarProps) {
  const monthStart = startOfMonth(month);
  const rows = useMemo(() => buildWeekRows(monthStart), [monthStart]);

  const today = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const title = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function handleDayClick(cell: { date: Date; inMonth: boolean }) {
    if (!cell.inMonth) {
      onMonthChange(startOfMonth(cell.date));
    }
    onSelect(new Date(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate()));
  }

  function handleToday() {
    const n = new Date();
    const day = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    onMonthChange(startOfMonth(day));
    onSelect(day);
  }

  return (
    <div className="w-[min(100%,280px)] select-none">
      <div className="flex items-center justify-between gap-2 px-0.5 pb-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(monthStart, -1))}
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold tabular-nums text-neutral-900">{title}</span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(monthStart, 1))}
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div role="grid" aria-label="Calendar" className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((dayLabel) => (
          <div key={dayLabel} className="pb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            {dayLabel}
          </div>
        ))}
        {rows.flatMap((week, wi) =>
          week.map((cell, di) => {
            const key = `${wi}-${di}-${toLocalISODateString(cell.date)}`;
            const isSelected = selected && isSameDay(cell.date, selected);
            const isToday = isSameDay(cell.date, today);
            const muted = !cell.inMonth;

            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                tabIndex={-1}
                className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 ${
                  muted ? 'text-neutral-300' : 'text-neutral-800'
                } ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                    : isToday
                      ? 'ring-1 ring-primary-400 ring-offset-0 hover:bg-primary-50'
                      : 'hover:bg-neutral-100'
                }`}
                onClick={() => handleDayClick(cell)}
              >
                {cell.date.getDate()}
              </button>
            );
          }),
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
        {onClear ? (
          <button
            type="button"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            onClick={onClear}
          >
            Clear
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700"
          onClick={handleToday}
        >
          Today
        </button>
      </div>
    </div>
  );
}
