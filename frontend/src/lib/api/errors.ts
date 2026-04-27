import { ApiError } from '@/types';

export function normalizeError(error: unknown): never {
  throw ApiError.from(error);
}
