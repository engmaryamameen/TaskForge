import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../shared/rbac';

export const PERMISSIONS_KEY = 'required_permissions';

export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
