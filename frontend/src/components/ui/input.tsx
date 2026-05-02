import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, id, className = '', ...props }, ref) => {
    return (
      <div>
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
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
              leftIcon ? 'pl-9' : ''
            } ${
              error
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-100'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
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
  ({ label, error, hint, id, className = '', ...props }, ref) => {
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
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-150 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
            error
              ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-100'
              : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
