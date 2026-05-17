import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';

/**
 * Tenant context stored in AsyncLocalStorage.
 * Available throughout the async call chain of a single request/job.
 */
export interface TenantContext {
  /** The organization ID for the current execution context */
  organizationId: string;
  /** The transactional EntityManager with SET LOCAL applied */
  entityManager: EntityManager;
}

/**
 * AsyncLocalStorage instance for propagating tenant context across
 * the async call chain without explicit parameter passing.
 *
 * This is the foundation for RLS enforcement:
 * - HTTP interceptor sets it per-request
 * - withTenantContext() sets it for workers/events
 * - Repositories read from it to get the correct EntityManager
 */
export const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Gets the current tenant context from AsyncLocalStorage.
 * Returns undefined if called outside a tenant-scoped context.
 */
export function getTenantContext(): TenantContext | undefined {
  return tenantStorage.getStore();
}

/**
 * Gets the tenant-scoped EntityManager from the current context.
 * This EntityManager is bound to a transaction with SET LOCAL applied.
 *
 * @throws Error if called outside a tenant context (programming error)
 */
export function getTenantEntityManager(): EntityManager {
  const ctx = tenantStorage.getStore();
  if (!ctx) {
    throw new Error(
      'getTenantEntityManager() called outside tenant context. ' +
      'Ensure this code runs within a TenantTransactionInterceptor or withTenantContext().',
    );
  }
  return ctx.entityManager;
}

/**
 * Gets the current organization ID from the tenant context.
 * Returns undefined if not in a tenant-scoped context.
 */
export function getCurrentOrgId(): string | undefined {
  return tenantStorage.getStore()?.organizationId;
}
