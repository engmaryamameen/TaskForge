import { Repository, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';
import { getTenantContext } from './tenant-context';

/**
 * Base class for tenant-aware repositories.
 *
 * Provides a `repo` getter that returns:
 * - The tenant-scoped transactional repository (when within withTenantContext)
 * - The default injected repository (when outside tenant context — migrations, tests, system operations)
 *
 * This ensures RLS is enforced via the correct EntityManager while maintaining
 * backward compatibility for code that runs outside the HTTP request lifecycle.
 */
export abstract class TenantAwareRepository<T extends ObjectLiteral> {
  constructor(
    private readonly defaultRepo: Repository<T>,
    private readonly entity: EntityTarget<T>,
  ) {}

  /**
   * Returns the appropriate Repository instance:
   * - Tenant-scoped (transactional with SET LOCAL) when in tenant context
   * - Default (standard connection pool) otherwise
   */
  protected get repo(): Repository<T> {
    const ctx = getTenantContext();
    if (ctx) {
      return ctx.entityManager.getRepository(this.entity);
    }
    return this.defaultRepo;
  }
}
