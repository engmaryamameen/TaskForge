import { forwardRef } from 'react';
import { Spinner } from './spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary-600 text-white',
    'hover:bg-primary-500 active:bg-primary-700',
    'shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'hover:shadow-[0_2px_6px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'focus-visible:ring-primary-300',
  ].join(' '),

  secondary: [
    'bg-white text-neutral-700 border border-neutral-200',
    'hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100',
    'shadow-xs',
    'focus-visible:ring-neutral-300',
  ].join(' '),

  outline: [
    'bg-transparent text-primary-600 border border-primary-200',
    'hover:bg-primary-50 hover:border-primary-300 active:bg-primary-100',
    'focus-visible:ring-primary-200',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600',
    'hover:bg-neutral-100 hover:text-neutral-800 active:bg-neutral-150',
    'focus-visible:ring-neutral-200',
  ].join(' '),

  danger: [
    'bg-danger-600 text-white',
    'hover:bg-danger-500 active:bg-danger-700',
    'shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'focus-visible:ring-danger-300',
  ].join(' '),

  success: [
    'bg-success-600 text-white',
    'hover:bg-success-500 active:bg-success-700',
    'shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'focus-visible:ring-success-300',
  ].join(' '),

  link: [
    'bg-transparent text-primary-600 underline-offset-4',
    'hover:text-primary-500 hover:underline',
    'focus-visible:ring-primary-200',
  ].join(' '),
};

const sizes: Record<ButtonSize, string> = {
  xs:   'h-7 px-2.5 text-xs gap-1 rounded-lg',
  sm:   'h-8 px-3.5 text-xs gap-1.5 rounded-lg',
  md:   'h-9 px-4 text-sm gap-2 rounded-lg',
  lg:   'h-10 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-lg',
};

const spinnerSizes: Record<ButtonSize, string> = {
  xs:   'h-3 w-3',
  sm:   'h-3.5 w-3.5',
  md:   'h-4 w-4',
  lg:   'h-4 w-4',
  icon: 'h-4 w-4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      fullWidth,
      disabled,
      leftIcon,
      rightIcon,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-45',
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {loading ? (
          <Spinner className={`${spinnerSizes[size]} shrink-0`} />
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
