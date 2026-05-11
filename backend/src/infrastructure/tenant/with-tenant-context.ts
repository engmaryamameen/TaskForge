import { DataSource } from 'typeorm';
import { tenantStorage, TenantContext } from './tenant-context';

/**
 * Executes a function within a tenant-scoped transactional context.
 *
 * This is the unifying primitive for RLS enforcement across all execution
 * contexts: HTTP requests (via interceptor), BullMQ workers, event handlers,
 * and WebSocket handlers all ultimately use this function.
 *
 * It:
 * 1. Starts a transaction
 * 2. Runs SET LOCAL app.current_org_id = organizationId
 * 3. Stores the transactional EntityManager in AsyncLocalStorage
 * 4. Executes the provided function
 * 5. Commits on success, rolls back on error
 * 6. Releases the connection back to the pool
 *
 * @param dataSource - TypeORM DataSource for acquiring connections
 * @param organizationId - The tenant org ID to scope this context to
 * @param fn - The function to execute within the tenant context
 * @returns The return value of fn
 */
export async function withTenantContext<T>(
  dataSource: DataSource,
  organizationId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Set the tenant context at the PostgreSQL session level.
    // SET LOCAL scopes it to this transaction only — safe with connection pooling.
    // Note: SET doesn't support parameterized queries, but organizationId is
    // always a validated UUID from the guard chain (never user-supplied raw input).
    await queryRunner.query(
      `SET LOCAL app.current_org_id = '${organizationId}'`,
    );

    const ctx: TenantContext = {
      organizationId,
      entityManager: queryRunner.manager,
    };

    // Run the function within AsyncLocalStorage so all downstream code
    // can access the tenant-scoped EntityManager via getTenantEntityManager()
    const result = await tenantStorage.run(ctx, fn);

    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
