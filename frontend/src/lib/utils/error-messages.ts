import { ApiError } from '@/types';

const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  REFRESH_TOKEN_INVALID: 'Your session has expired. Please sign in again.',

  // Organizations
  ORG_NOT_FOUND: 'Organization not found.',
  ORG_SLUG_TAKEN: 'This organization name is already taken.',
  ALREADY_MEMBER: 'This user is already a member.',
  NOT_A_MEMBER: 'You are not a member of this organization.',
  INSUFFICIENT_ROLE: 'You don\u2019t have permission for this action.',

  // Projects
  PROJECT_NOT_FOUND: 'This project no longer exists.',

  // Tasks
  TASK_NOT_FOUND: 'This task no longer exists.',
  INVALID_ASSIGNEE: 'The selected assignee is not a member of this organization.',

  // Invites
  INVITE_NOT_FOUND: 'This invite link is invalid or has expired.',
  INVITE_EXPIRED: 'This invite has expired. Ask the admin to send a new one.',
  INVITE_ALREADY_USED: 'This invite has already been used.',

  // Billing
  PLAN_LIMIT_EXCEEDED: 'You\u2019ve reached the limit for your current plan.',
  FEATURE_NOT_AVAILABLE: 'This feature is not available on your current plan.',
  SUBSCRIPTION_INACTIVE: 'Your subscription is inactive.',

  // Network
  TIMEOUT: 'The request timed out. Please try again.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',

  // General
  VALIDATION_ERROR: 'Please check your input and try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
};

export function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] || error.message || 'Something went wrong.';
  }
  return error.message || 'Something went wrong. Please try again.';
}
