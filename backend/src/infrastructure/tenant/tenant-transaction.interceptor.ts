import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Observable, from, switchMap } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { SKIP_TENANT_SCOPE_KEY } from './skip-tenant-scope.decorator';
import { withTenantContext } from './with-tenant-context';

/**
 * Interceptor that wraps org-scoped HTTP requests in a transactional
 * tenant context with SET LOCAL for PostgreSQL RLS enforcement.
 *
 * Execution order in the guard/interceptor pipeline:
 *   Guards (Throttle → JWT → OrgMembership → Roles)
 *     → TenantTransactionInterceptor (this)
 *       → Controller handler
 *         → Repository calls (use tenant-scoped EntityManager)
 *
 * By the time this interceptor runs, OrgMembershipGuard has already
 * validated the user's membership and attached organizationId to request.user.
 *
 * Skipped when:
 * - Route is @Public() (no user context)
 * - Route is @SkipTenantScope() (auth, health, webhooks)
 * - No organizationId on request.user (non-org routes)
 */
@Injectable()
export class TenantTransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantTransactionInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return next.handle();
    }

    // Skip if explicitly opted out
    const skipTenant = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipTenant) {
      return next.handle();
    }

    // Extract organizationId from the request (set by OrgMembershipGuard)
    const request = context.switchToHttp().getRequest();
    const organizationId = request.user?.organizationId;

    // If no org context (non-org-scoped route), skip
    if (!organizationId) {
      return next.handle();
    }

    // Wrap the handler execution in a tenant-scoped transaction
    return from(
      withTenantContext(this.dataSource, organizationId, () => {
        return new Promise<any>((resolve, reject) => {
          next.handle().subscribe({
            next: (value) => resolve(value),
            error: (err) => reject(err),
          });
        });
      }),
    );
  }
}
