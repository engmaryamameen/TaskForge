export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.OWNER]: 50,
  [Role.ADMIN]: 40,
  [Role.MANAGER]: 30,
  [Role.MEMBER]: 20,
  [Role.VIEWER]: 10,
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.OWNER]: 'Owner',
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Project Manager',
  [Role.MEMBER]: 'Member',
  [Role.VIEWER]: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.OWNER]: 'Full access including billing, org deletion, and role management.',
  [Role.ADMIN]: 'Manage organization, members, projects, tasks, and settings.',
  [Role.MANAGER]: 'Create and manage projects and tasks. Assign members.',
  [Role.MEMBER]: 'View projects, create and edit assigned tasks.',
  [Role.VIEWER]: 'Read-only access to projects and tasks.',
};

export enum Permission {
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  TASK_VIEW = 'task:view',
  TASK_CREATE = 'task:create',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  MEMBER_VIEW = 'member:view',
  MEMBER_INVITE = 'member:invite',
  MEMBER_UPDATE_ROLE = 'member:updateRole',
  MEMBER_REMOVE = 'member:remove',
  ORGANIZATION_UPDATE = 'organization:update',
  ORGANIZATION_DELETE = 'organization:delete',
  BILLING_MANAGE = 'billing:manage',
}

const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.PROJECT_VIEW]: 'View projects',
  [Permission.PROJECT_CREATE]: 'Create projects',
  [Permission.PROJECT_UPDATE]: 'Edit projects',
  [Permission.PROJECT_DELETE]: 'Delete projects',
  [Permission.TASK_VIEW]: 'View tasks',
  [Permission.TASK_CREATE]: 'Create tasks',
  [Permission.TASK_UPDATE]: 'Edit tasks',
  [Permission.TASK_DELETE]: 'Delete tasks',
  [Permission.TASK_ASSIGN]: 'Assign tasks',
  [Permission.MEMBER_VIEW]: 'View members',
  [Permission.MEMBER_INVITE]: 'Invite members',
  [Permission.MEMBER_UPDATE_ROLE]: 'Change member roles',
  [Permission.MEMBER_REMOVE]: 'Remove members',
  [Permission.ORGANIZATION_UPDATE]: 'Update organization settings',
  [Permission.ORGANIZATION_DELETE]: 'Delete organization',
  [Permission.BILLING_MANAGE]: 'Manage billing',
};

const VIEWER_PERMISSIONS: Permission[] = [
  Permission.PROJECT_VIEW, Permission.TASK_VIEW, Permission.MEMBER_VIEW,
];
const MEMBER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS, Permission.TASK_CREATE, Permission.TASK_UPDATE,
];
const MANAGER_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS, Permission.PROJECT_CREATE, Permission.PROJECT_UPDATE,
  Permission.PROJECT_DELETE, Permission.TASK_DELETE, Permission.TASK_ASSIGN,
  Permission.MEMBER_INVITE,
];
const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS, Permission.MEMBER_UPDATE_ROLE, Permission.MEMBER_REMOVE,
  Permission.ORGANIZATION_UPDATE,
];
const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS, Permission.ORGANIZATION_DELETE, Permission.BILLING_MANAGE,
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: OWNER_PERMISSIONS,
  [Role.ADMIN]: ADMIN_PERMISSIONS,
  [Role.MANAGER]: MANAGER_PERMISSIONS,
  [Role.MEMBER]: MEMBER_PERMISSIONS,
  [Role.VIEWER]: VIEWER_PERMISSIONS,
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role as Role]?.includes(permission) ?? false;
}

export function canAssignRole(actorRole: string, targetRole: Role): boolean {
  if (targetRole === Role.OWNER) return false;
  return (ROLE_HIERARCHY[actorRole as Role] ?? 0) > (ROLE_HIERARCHY[targetRole] ?? 0);
}

export function getAssignableRoles(actorRole: string): Role[] {
  return Object.values(Role).filter((r) => canAssignRole(actorRole, r));
}

export function getPermissionLabel(p: Permission): string {
  return PERMISSION_LABELS[p] ?? p;
}

export const INVITABLE_ROLES = [Role.ADMIN, Role.MANAGER, Role.MEMBER, Role.VIEWER] as const;

export interface PermissionGroupDef {
  label: string;
  permissions: { key: Permission; label: string; dangerous?: boolean }[];
}

export const PERMISSION_GROUPS: PermissionGroupDef[] = [
  {
    label: 'Projects',
    permissions: [
      { key: Permission.PROJECT_VIEW, label: 'View projects' },
      { key: Permission.PROJECT_CREATE, label: 'Create projects' },
      { key: Permission.PROJECT_UPDATE, label: 'Edit projects' },
      { key: Permission.PROJECT_DELETE, label: 'Delete projects' },
    ],
  },
  {
    label: 'Tasks',
    permissions: [
      { key: Permission.TASK_VIEW, label: 'View tasks' },
      { key: Permission.TASK_CREATE, label: 'Create tasks' },
      { key: Permission.TASK_UPDATE, label: 'Edit tasks' },
      { key: Permission.TASK_DELETE, label: 'Delete tasks' },
      { key: Permission.TASK_ASSIGN, label: 'Assign tasks' },
    ],
  },
  {
    label: 'Members',
    permissions: [
      { key: Permission.MEMBER_VIEW, label: 'View members' },
      { key: Permission.MEMBER_INVITE, label: 'Invite members' },
      { key: Permission.MEMBER_REMOVE, label: 'Remove members', dangerous: true },
      { key: Permission.MEMBER_UPDATE_ROLE, label: 'Change member roles', dangerous: true },
    ],
  },
  {
    label: 'Organization',
    permissions: [
      { key: Permission.ORGANIZATION_UPDATE, label: 'Update settings' },
      { key: Permission.ORGANIZATION_DELETE, label: 'Delete organization', dangerous: true },
      { key: Permission.BILLING_MANAGE, label: 'Manage billing', dangerous: true },
    ],
  },
];
