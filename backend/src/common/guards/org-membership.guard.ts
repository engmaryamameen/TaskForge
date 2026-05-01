import { Injectable, Inject, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipsService } from '../../modules/organizations/services/memberships.service';
import { UsersService } from '../../modules/users/services/users.service';
import { ICacheService, CACHE_SERVICE } from '../../infrastructure/cache';
import { ORG_SCOPED_KEY } from '../decorators/org-scoped.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';

const MEMBERSHIP_CACHE_TTL = 300; // 5 minutes

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
    @Inject(CACHE_SERVICE) private readonly cacheService: ICacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isOrgScoped = this.reflector.getAllAndOverride<boolean>(
      ORG_SCOPED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!isOrgScoped) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    if (!userId) return false;

    // Resolve org ID: header takes precedence, fallback to user's active org
    let orgId = request.headers['x-organization-id'] as string | undefined;

    if (!orgId) {
      const user = await this.usersService.findById(userId);
      orgId = user?.currentOrganizationId ?? undefined;
    }

    if (!orgId) {
      throw new AppError(
        ErrorCodes.ORG_NOT_FOUND,
        'Organization context required. Provide x-organization-id header or set an active organization.',
        400,
      );
    }

    // Request-level cache → Redis cache → DB (layered lookup)
    const requestCacheKey = `_membership_${userId}_${orgId}`;
    let membership = request[requestCacheKey];

    if (!membership) {
      const redisCacheKey = `cache:membership:${userId}:${orgId}`;
      membership = await this.cacheService.get(redisCacheKey);

      if (!membership) {
        membership = await this.membershipsService.getMembership(userId, orgId);
        if (membership) {
          await this.cacheService.set(
            redisCacheKey,
            membership,
            MEMBERSHIP_CACHE_TTL,
          );
        }
      }

      request[requestCacheKey] = membership;
    }

    if (!membership) {
      throw new AppError(
        ErrorCodes.NOT_A_MEMBER,
        'Not a member of this organization',
        403,
      );
    }

    request.user.organizationId = orgId;
    request.user.role = membership.role;

    return true;
  }
}
