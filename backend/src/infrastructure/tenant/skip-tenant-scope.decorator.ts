import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_SCOPE_KEY = 'SKIP_TENANT_SCOPE';

/**
 * Marks a route handler as not requiring tenant transaction scoping.
 * Use on routes that don't operate within a single tenant context:
 * - Auth routes (login, register, verify-email)
 * - Health checks
 * - Webhook endpoints (Stripe)
 * - Organization switching
 *
 * When applied, the TenantTransactionInterceptor will skip setting up
 * the transactional EntityManager and RLS context.
 */
export const SkipTenantScope = () => SetMetadata(SKIP_TENANT_SCOPE_KEY, true);
