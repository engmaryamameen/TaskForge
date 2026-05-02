import { AlertCircle, AlertTriangle } from 'lucide-react';

type FormErrorAlertProps = {
  variant?: 'error' | 'warning';
  children: React.ReactNode;
  className?: string;
};

export function FormErrorAlert({
  variant = 'error',
  children,
  className = '',
}: FormErrorAlertProps) {
  const isWarning = variant === 'warning';
  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed transition-colors ${
        isWarning
          ? 'border-amber-200/90 bg-amber-50/90 text-amber-900'
          : 'border-danger-200 bg-danger-50 text-danger-800'
      } ${className}`}
    >
      <div className="mt-0.5 shrink-0">
        {isWarning ? (
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
        ) : (
          <AlertCircle className="h-5 w-5 text-danger-600" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">{children}</div>
    </div>
  );
}
