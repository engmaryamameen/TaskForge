import { IconAlertCircle } from '@/components/icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\u2019t load this data right now.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
      <div className="mb-4 flex justify-center text-neutral-300">
        <IconAlertCircle className="h-10 w-10" />
      </div>
      <p className="text-sm font-medium text-neutral-800">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
