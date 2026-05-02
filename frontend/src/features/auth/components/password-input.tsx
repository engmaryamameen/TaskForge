'use client';

import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> & {
  label?: string;
  error?: string;
  hint?: string;
  /** Shown on the toggle control for assistive tech */
  toggleSrLabel?: string;
  /** Sign-in vs sign-up vs reset — drives sensible defaults */
  autoCompleteMode?: 'current-password' | 'new-password';
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      hint,
      id,
      className = '',
      'aria-invalid': ariaInvalidProp,
      toggleSrLabel = 'Show password',
      autoCompleteMode,
      autoComplete,
      disabled,
      ...props
    },
    ref,
  ) => {
    const genId = useId();
    const inputId = id ?? genId;
    const [visible, setVisible] = useState(false);
    const resolvedAuto =
      autoComplete ?? (autoCompleteMode === 'current-password' ? 'current-password' : 'new-password');

    return (
      <div className="text-left">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-left text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            disabled={disabled}
            autoComplete={resolvedAuto}
            {...props}
            aria-invalid={error ? true : ariaInvalidProp}
            className={`min-h-[48px] w-full rounded-xl border bg-white px-4 py-3 pr-12 text-base leading-normal transition-all duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-50 sm:text-[15px] ${
              error
                ? 'border-2 border-danger-500 hover:border-danger-600 focus:border-danger-600 focus:ring-danger-200 focus-visible:border-danger-600 focus-visible:ring-danger-200'
                : 'border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
            } ${className}`}
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-neutral-500 transition hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : toggleSrLabel}
          >
            {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </div>
        <div className="mt-1.5 min-h-6">
          {error ? (
            <p className="text-xs leading-snug text-danger-600">{error}</p>
          ) : hint ? (
            <p className="text-xs text-neutral-500">{hint}</p>
          ) : null}
        </div>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
