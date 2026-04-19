import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../shared/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppError } from '../../shared/errors/app-error';
import { ErrorCodes } from '../../shared/errors/error-codes';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Safety: if @Roles() is used but role is not set, prevent misconfigured routes
    if (!user?.role) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'Role context not available. Ensure this route is also marked @OrgScoped().',
        403,
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw new AppError(
        ErrorCodes.INSUFFICIENT_ROLE,
        'Insufficient role for this action',
        403,
      );
    }

    return true;
  }
}
