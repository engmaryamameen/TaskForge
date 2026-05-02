import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-5"
          leftIcon={
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
