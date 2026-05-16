import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, id, className = '', 'aria-invalid': ariaInvalidProp, ...props }, ref) => {
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
            {...props}
            aria-invalid={error ? true : ariaInvalidProp}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
              leftIcon ? 'pl-9' : ''
            } ${
              error
                ? 'border-2 border-danger-500 hover:border-danger-600 focus:border-danger-600 focus:ring-danger-300 focus-visible:border-danger-600 focus-visible:ring-danger-300'
                : 'border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
            } ${className}`}
          />
        </div>
        {/* Fixed slot height avoids layout jump when errors appear */}
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

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = '', 'aria-invalid': ariaInvalidProp, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          {...props}
          aria-invalid={error ? true : ariaInvalidProp}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
            error
              ? 'border-2 border-danger-500 hover:border-danger-600 focus:border-danger-600 focus:ring-danger-300 focus-visible:border-danger-600 focus-visible:ring-danger-300'
              : 'border border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
          } ${className}`}
        />
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

Textarea.displayName = 'Textarea';
