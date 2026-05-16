'use client';

import { useEffect, useState, useCallback } from 'react';
import { IconX } from '@/components/icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'md:max-w-md',
  md: 'md:max-w-2xl',
  lg: 'md:max-w-3xl',
  xl: 'md:max-w-5xl',
};

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = 'hidden';
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, handleEsc]);

  if (!visible) return null;

  const panelMotion = animating
    ? 'max-md:translate-y-0 md:translate-y-0 md:scale-100 opacity-100'
    : 'max-md:translate-y-full max-md:opacity-100 md:translate-y-2 md:scale-95 md:opacity-0';

  return (
    <div className="fixed inset-0 z-50 flex max-md:items-end md:items-center md:justify-center max-md:justify-center md:p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-200 ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel — bottom sheet on mobile, centered card on md+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-overlay transition-[transform,opacity] duration-[280ms] max-md:max-h-[min(92dvh,100%)] max-md:rounded-b-none max-md:rounded-t-2xl md:max-h-[min(90vh,100%)] md:rounded-2xl ${sizeStyles[size]} ${panelMotion}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-neutral-100 px-6 py-4 max-md:pt-5">
          <div className="pr-2">
            <h2 id="modal-title" className="text-base font-semibold text-neutral-900">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors -mr-1 cursor-pointer hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrolls when content is tall */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 ${
            !footer ? 'max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]' : ''
          }`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] md:rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
