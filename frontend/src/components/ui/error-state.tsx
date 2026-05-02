import { IconAlertCircle } from '@/components/icons';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\u2019t load this data right now. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500">
        <IconAlertCircle className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{message}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry} className="mt-5">
          Try again
        </Button>
      )}
    </div>
  );
}
