export interface Entitlements {
  planId: string;
  maxMembers: number;
  maxProjects: number;
  features: Record<string, boolean>;
  usage: {
    projects: number;
    members: number;
    tasks: number;
  };
  isActive: boolean;
}

/**
 * Structured deny response for frontend UX.
 * Guards attach this to AppError metadata on limit/feature violations.
 */
export interface DenyReason {
  feature?: string;
  metric?: string;
  limit?: number;
  current?: number;
  upgrade?: {
    recommendedPlan: string;
    checkoutUrl?: string;
  };
}
