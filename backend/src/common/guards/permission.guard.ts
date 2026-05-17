import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, hasPermission, Role } from '../../shared/rbac';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'Permission context not available. Ensure this route is @OrgScoped().',
        403,
      );
    }

    const userRole = user.role as Role;
    const hasAll = requiredPermissions.every((p) => hasPermission(userRole, p));

    if (!hasAll) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'You do not have permission to perform this action.',
        403,
      );
    }

    return true;
  }
}
