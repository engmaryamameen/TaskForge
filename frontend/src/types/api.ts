import { AxiosError } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const ErrorCodes = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  ORG_NOT_FOUND: 'ORG_NOT_FOUND',
  ORG_SLUG_TAKEN: 'ORG_SLUG_TAKEN',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  NOT_A_MEMBER: 'NOT_A_MEMBER',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INVALID_ASSIGNEE: 'INVALID_ASSIGNEE',
  INVITE_NOT_FOUND: 'INVITE_NOT_FOUND',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INVITE_ALREADY_USED: 'INVITE_ALREADY_USED',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_ALREADY_PROCESSED: 'WEBHOOK_ALREADY_PROCESSED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorType = 'AUTH' | 'CLIENT' | 'SERVER' | 'NETWORK' | 'UNKNOWN';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly type: ApiErrorType;

  constructor(code: string, message: string, status: number, type: ApiErrorType) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.type = type;
  }

  private static classifyStatus(status: number): ApiErrorType {
    if (status === 401 || status === 403) return 'AUTH';
    if (status >= 400 && status < 500) return 'CLIENT';
    if (status >= 500) return 'SERVER';
    return 'NETWORK';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof AxiosError) {
      const resp = error.response;
      if (resp?.data?.error) {
        const { code, message } = resp.data.error;
        return new ApiError(code, message, resp.status ?? 500, this.classifyStatus(resp.status ?? 500));
      }
      if (error.code === 'ECONNABORTED') {
        return new ApiError('TIMEOUT', 'Request timed out', 0, 'NETWORK');
      }
      if (error.code === 'ERR_NETWORK') {
        return new ApiError('NETWORK_ERROR', 'Network error', 0, 'NETWORK');
      }
      const status = resp?.status ?? 0;
      return new ApiError(
        'UNKNOWN_ERROR',
        error.message || 'An unexpected error occurred',
        status,
        status ? this.classifyStatus(status) : 'UNKNOWN',
      );
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new ApiError('UNKNOWN_ERROR', message, 0, 'UNKNOWN');
  }
}
