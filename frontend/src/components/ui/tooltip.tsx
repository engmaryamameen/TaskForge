'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  label: string;
  side?: 'right' | 'top' | 'bottom';
  children: React.ReactElement<{ onMouseEnter?: React.MouseEventHandler; onMouseLeave?: React.MouseEventHandler; onFocus?: React.FocusEventHandler; onBlur?: React.FocusEventHandler }>;
}

export function Tooltip({ label, side = 'right', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => setVisible(true), 400);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(delayRef.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(delayRef.current), []);

  useEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (side === 'right') {
      setCoords({ x: rect.right + 10, y: rect.top + rect.height / 2 });
    } else if (side === 'top') {
      setCoords({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    } else {
      setCoords({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
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
      {/* Clone child element and attach event handlers + ref */}
      <span
        ref={triggerRef as React.RefObject<HTMLSpanElement>}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="contents"
      >
        {children}
      </span>

      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            style={positionStyle}
            className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}
