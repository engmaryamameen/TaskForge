import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft',
  secondary:
    'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 shadow-xs',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-soft',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800',
  success:
    'bg-success-600 text-white hover:bg-success-700 shadow-soft',
  outline:
    'border border-primary-200 bg-primary-50/50 text-primary-700 hover:bg-primary-100 hover:border-primary-300',
};

const sizeStyles = {
  xs: 'px-2 py-1 text-[11px] gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, leftIcon, rightIcon, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
