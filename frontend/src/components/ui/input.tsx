import { forwardRef } from 'react';

/**
 * Shared field styles — single source of truth for Input, Textarea, Select.
 * Uses theme tokens so light/dark mode works automatically.
 */
export const FIELD_BASE = [
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-900',
  'placeholder:text-neutral-400',
  'transition-all duration-150',
  'focus:outline-none',
].join(' ');

export const FIELD_DEFAULT = [
  'border-neutral-200',
  'hover:border-neutral-300',
  'focus:border-neutral-400',
].join(' ');

export const FIELD_ERROR = [
  'border-danger-400',
  'hover:border-danger-500',
  'focus:border-danger-500',
].join(' ');

export const FIELD_DISABLED = 'opacity-50 pointer-events-none bg-neutral-50';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, id, disabled, className = '', 'aria-invalid': ariaInvalidProp, ...props }, ref) => {
    const fieldStyle = [
      FIELD_BASE,
      error ? FIELD_ERROR : FIELD_DEFAULT,
      disabled ? FIELD_DISABLED : '',
      leftIcon ? 'pl-9' : '',
      rightIcon ? 'pr-9' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="text-left">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={error ? true : ariaInvalidProp}
            className={fieldStyle}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        <div className="mt-1.5 min-h-5">
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

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, disabled, className = '', 'aria-invalid': ariaInvalidProp, ...props }, ref) => {
    const fieldStyle = [
      FIELD_BASE,
      error ? FIELD_ERROR : FIELD_DEFAULT,
      disabled ? FIELD_DISABLED : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="text-left">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : ariaInvalidProp}
          className={fieldStyle}
          {...props}
        />
        <div className="mt-1.5 min-h-5">
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

Textarea.displayName = 'Textarea';
