import { ApiError } from '@/types';

/**
 * Prefer server field error, then client-side validation message.
 */
export function mergeFieldError(
  apiError: ApiError | undefined,
  field: string,
  clientError?: string,
): string | undefined {
  const fromServer = apiError?.fieldErrors?.[field];
  if (fromServer) return fromServer;
  return clientError;
}
