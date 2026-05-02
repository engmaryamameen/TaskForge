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
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
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
      }, 200);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          animating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${sizeStyles[size]} rounded-2xl bg-white shadow-overlay transition-all duration-200 ease-out ${
          animating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors -mr-1 cursor-pointer"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
