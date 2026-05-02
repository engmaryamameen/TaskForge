import { ApiError } from '@/types';

/**
 * When the API returns only field-scoped validation messages, avoid repeating the same text in a top banner.
 */
export function shouldShowFormLevelBanner(err: ApiError | undefined): boolean {
  if (!err) return false;
  if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0 && err.code === 'VALIDATION_ERROR') {
    return false;
  }
  return true;
}
