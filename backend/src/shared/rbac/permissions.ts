/**
 * Central permission definitions for TaskForge RBAC.
 *
 * Roles are hierarchical: owner > admin > manager > member > viewer.
 * Each role inherits all permissions of the roles below it.
 */

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

const VIEWER_PERMISSIONS: Permission[] = [
  Permission.PROJECT_VIEW,
  Permission.TASK_VIEW,
  Permission.MEMBER_VIEW,
];

const MEMBER_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  Permission.TASK_CREATE,
  Permission.TASK_UPDATE,
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  Permission.PROJECT_CREATE,
  Permission.PROJECT_UPDATE,
  Permission.PROJECT_DELETE,
  Permission.TASK_DELETE,
  Permission.TASK_ASSIGN,
  Permission.MEMBER_INVITE,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  Permission.MEMBER_UPDATE_ROLE,
  Permission.MEMBER_REMOVE,
  Permission.ORGANIZATION_UPDATE,
];

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  Permission.ORGANIZATION_DELETE,
  Permission.BILLING_MANAGE,
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.OWNER]: OWNER_PERMISSIONS,
  [Role.ADMIN]: ADMIN_PERMISSIONS,
  [Role.MANAGER]: MANAGER_PERMISSIONS,
  [Role.MEMBER]: MEMBER_PERMISSIONS,
  [Role.VIEWER]: VIEWER_PERMISSIONS,
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (targetRole === Role.OWNER) return false;
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

export function getAssignableRoles(actorRole: Role): Role[] {
  return Object.values(Role).filter((r) => canAssignRole(actorRole, r));
}

export const INVITABLE_ROLES = [Role.ADMIN, Role.MANAGER, Role.MEMBER, Role.VIEWER] as const;

/**
 * Project-level roles — scoped to a single project, separate from org roles.
 */
export enum ProjectMemberRole {
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export const PROJECT_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  [ProjectMemberRole.MANAGER]: 'Project Manager',
  [ProjectMemberRole.MEMBER]: 'Member',
  [ProjectMemberRole.VIEWER]: 'Viewer',
};

export const PROJECT_ROLE_HIERARCHY: Record<ProjectMemberRole, number> = {
  [ProjectMemberRole.MANAGER]: 30,
  [ProjectMemberRole.MEMBER]: 20,
  [ProjectMemberRole.VIEWER]: 10,
};

const PROJECT_VIEWER_PERMS: Permission[] = [
  Permission.PROJECT_VIEW,
  Permission.TASK_VIEW,
];

const PROJECT_MEMBER_PERMS: Permission[] = [
  ...PROJECT_VIEWER_PERMS,
  Permission.TASK_CREATE,
  Permission.TASK_UPDATE,
];

const PROJECT_MANAGER_PERMS: Permission[] = [
  ...PROJECT_MEMBER_PERMS,
  Permission.PROJECT_UPDATE,
  Permission.TASK_DELETE,
  Permission.TASK_ASSIGN,
];

export const PROJECT_ROLE_PERMISSIONS: Record<ProjectMemberRole, Permission[]> = {
  [ProjectMemberRole.MANAGER]: PROJECT_MANAGER_PERMS,
  [ProjectMemberRole.MEMBER]: PROJECT_MEMBER_PERMS,
  [ProjectMemberRole.VIEWER]: PROJECT_VIEWER_PERMS,
};

export function hasProjectPermission(role: ProjectMemberRole, permission: Permission): boolean {
  return PROJECT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
