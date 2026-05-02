import { forwardRef } from 'react';
import { IconChevronDown } from '@/components/icons';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className = '', children, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm transition-all duration-150 focus:outline-none focus:ring-2 ${
              error
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-100'
                : 'border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100'
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <IconChevronDown className="h-4 w-4 text-neutral-400" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
