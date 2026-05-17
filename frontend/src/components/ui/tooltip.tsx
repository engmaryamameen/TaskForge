'use client';

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  side?: 'right' | 'top' | 'bottom';
  children: React.ReactNode;
}

export function Tooltip({ label, side = 'right', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => setVisible(true), 300);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(delayRef.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(delayRef.current), []);

  // Recalculate position when tooltip becomes visible
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) return;

    const el = triggerRef.current;
    // Find the first real child element for precise positioning
    const target = el.firstElementChild instanceof HTMLElement ? el.firstElementChild : el;
    const rect = target.getBoundingClientRect();

    if (side === 'right') {
      setCoords({
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });
    } else if (side === 'top') {
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    } else {
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
    }
  }, [visible, side]);

  const positionStyle: React.CSSProperties =
    side === 'right'
      ? { left: coords.x, top: coords.y, transform: 'translateY(-50%)' }
      : side === 'top'
        ? { left: coords.x, top: coords.y, transform: 'translate(-50%, -100%)' }
        : { left: coords.x, top: coords.y, transform: 'translateX(-50%)' };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
      >
        {children}
      </div>

      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            style={positionStyle}
            className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
