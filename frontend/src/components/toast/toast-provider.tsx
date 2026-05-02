'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ToastGlyphErrorMini,
  ToastGlyphInfoMini,
  ToastGlyphSuccessMini,
  ToastGlyphWarningMini,
} from './toast-svgs';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  title: string;
  description?: string;
  /** ms; set `0` to disable auto-dismiss */
  duration?: number;
};

type ToastRecord = ToastOptions & { id: string; variant: ToastVariant };

type ToastContextValue = {
  push: (opts: ToastOptions & { variant: ToastVariant }) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** White shell, neutral border, icon badge + subtle bottom progress only. */
const VARIANT_CONFIG = {
  success: {
    Glyph: ToastGlyphSuccessMini,
    badgeBg: 'bg-emerald-100',
    progressFill: 'bg-emerald-500/65',
  },
  error: {
    Glyph: ToastGlyphErrorMini,
    badgeBg: 'bg-[#fee2e2]',
    progressFill: 'bg-red-500/55',
  },
  warning: {
    Glyph: ToastGlyphWarningMini,
    badgeBg: 'bg-amber-100',
    progressFill: 'bg-amber-500/65',
  },
  info: {
    Glyph: ToastGlyphInfoMini,
    badgeBg: 'bg-blue-100',
    progressFill: 'bg-blue-500/55',
  },
} as const;

const TOAST_EXIT_MS = 380;

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: () => void;
}) {
  const cfg = VARIANT_CONFIG[toast.variant];
  const Glyph = cfg.Glyph;
  const durationMs = toast.duration ?? 6000;
  const titleId = useId();
  const descId = useId();
  const [exiting, setExiting] = useState(false);
  const dismissedRef = useRef(false);

  const completeDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  }, [onDismiss]);

  const requestExit = useCallback(() => setExiting(true), []);

  useEffect(() => {
    if (durationMs <= 0) return;
    const id = window.setTimeout(requestExit, durationMs);
    return () => clearTimeout(id);
  }, [durationMs, requestExit]);

  /** Fallback if exit animationend doesn’t fire */
  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(completeDismiss, TOAST_EXIT_MS + 80);
    return () => clearTimeout(id);
  }, [exiting, completeDismiss]);

  function handleShellAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (!String(e.animationName).includes('toast-exit')) return;
    completeDismiss();
  }

  const describedBy = toast.description ? descId : undefined;

  return (
    <div
      role={toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' || toast.variant === 'warning' ? 'assertive' : 'polite'}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      className={`pointer-events-auto relative w-[calc(100vw-32px)] min-w-0 max-w-[420px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#ffffff] shadow-[0_10px_30px_rgba(15,23,42,0.10)] sm:w-full sm:min-w-[360px] sm:max-w-[420px] ${exiting ? 'animate-toast-exit' : 'animate-toast-enter'}`}
      onAnimationEnd={handleShellAnimationEnd}
    >
      <div className="flex items-center gap-3 px-4 py-[14px]">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.badgeBg}`}
          aria-hidden
        >
          <Glyph className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p
            id={titleId}
            className="text-[15px] font-semibold leading-[1.4] text-[#0f172a]"
          >
            {toast.title}
          </p>
          {toast.description ? (
            <p
              id={descId}
              className="truncate text-[13px] font-normal leading-[1.45] text-neutral-600"
              title={toast.description}
            >
              {toast.description}
            </p>
          ) : null}
        </div>
      </div>

      {durationMs > 0 ? (
        <div className="h-1 w-full bg-neutral-900/6" aria-hidden>
          <div
            className={`h-full ${cfg.progressFill}`}
            style={{
              transformOrigin: 'left center',
              animation: `toast-progress-fill ${durationMs}ms linear both`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((opts: ToastOptions & { variant: ToastVariant }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const record: ToastRecord = { ...opts, id, variant: opts.variant };
    setToasts((prev) => [...prev, record]);
    return id;
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  const portal =
    mounted &&
    createPortal(
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-200 flex flex-col items-center gap-2 px-4 pt-4 sm:gap-2.5 sm:pt-5"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>,
      document.body,
    );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    /** Generic toast with explicit variant */
    show: (opts: ToastOptions & { variant: ToastVariant }) => ctx.push(opts),
    success: (opts: ToastOptions) => ctx.push({ ...opts, variant: 'success' }),
    error: (opts: ToastOptions) => ctx.push({ ...opts, variant: 'error' }),
    warning: (opts: ToastOptions) => ctx.push({ ...opts, variant: 'warning' }),
    info: (opts: ToastOptions) => ctx.push({ ...opts, variant: 'info' }),
    dismiss: ctx.dismiss,
  };
}
