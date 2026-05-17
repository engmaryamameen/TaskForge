/**
 * In-memory mutable demo universe — portfolio preview only.
 * Not server state and not persisted Zustand — replaces API responses when demo mode is on.
 */
import type {
  Activity,
  ActivityListParams,
  ApiResponse,
  Membership,
  Organization,
  OrganizationWithRole,
  PendingInvite,
  Project,
  Task,
  TaskFilters,
  User,
} from '@/types';
import type { CreateProjectPayload, UpdateProjectPayload } from '@/lib/api/projects.api';
import type { CreateTaskPayload, UpdateTaskPayload } from '@/lib/api/tasks.api';
import type { CreateInvitePayload } from '@/lib/api/organizations.api';
import type { UpdateProfilePayload } from '@/lib/api/auth.api';
import type { Notification } from '@/lib/api/notifications.api';
import { EventType, Role, TaskPriority, TaskStatus } from '@/types';
import { buildDemoSeed, type DemoSeedState } from '@/lib/demo/demo-seed';
import { DEMO_IDS } from '@/lib/demo/demo-ids';

export type { DemoSeedState };

let state: DemoSeedState | null = null;

export function demoResetSession(loginEmail: string): void {
  state = buildDemoSeed(loginEmail);
}

export function demoEnsureSession(): DemoSeedState {
  if (!state) {
    state = buildDemoSeed('alex.chen@acme.demo');
  }
  return state;
}

export function demoGetSessionOrNull(): DemoSeedState | null {
  return state;
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function paginate<T>(items: T[], page = 1, limit = 50): { slice: T[]; total: number } {
  const total = items.length;
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return { slice, total };
}

function filterTasksByOrg(tasks: Task[], orgId: string): Task[] {
  return tasks.filter((t) => t.organizationId === orgId);
}

function applyTaskFilters(tasks: Task[], filters?: TaskFilters): Task[] {
  let list = tasks;
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (filters?.status) list = list.filter((t) => t.status === filters.status);
  if (filters?.priority) list = list.filter((t) => t.priority === filters.priority);
  if (filters?.assignedTo) list = list.filter((t) => t.assignedTo === filters.assignedTo);
  return list;
}

export function demoLogin(email: string, password: string): ApiResponse<{
  accessToken: string;
  refreshToken: string;
  user: User;
}> {
  const trimmed = email.trim();
  if (!trimmed || !password) {
    return {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
    };
  }
  demoResetSession(trimmed);
  const u = demoEnsureSession().user;
  return {
    success: true,
    data: {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
      user: { ...u },
    },
  };
}

/** Same tokens as login — demo adapter only; not real JWTs. */
export const DEMO_ACCESS_TOKEN = 'demo-access-token';
export const DEMO_REFRESH_TOKEN = 'demo-refresh-token';

export function demoRefresh(): ApiResponse<{ accessToken: string; refreshToken: string }> {
  demoEnsureSession();
  return {
    success: true,
    data: {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    },
  };
}

export function demoMe(): ApiResponse<{ user: User }> {
  const u = { ...demoEnsureSession().user };
  return { success: true, data: { user: u } };
}

export function demoUpdateProfile(payload: UpdateProfilePayload): ApiResponse<{ user: User }> {
  const s = demoEnsureSession();
  if (payload.firstName !== undefined) s.user.firstName = payload.firstName;
  if (payload.lastName !== undefined) s.user.lastName = payload.lastName;
  s.user = { ...s.user };
  return { success: true, data: { user: { ...s.user } } };
}

export function demoLogout(): ApiResponse<{ message: string }> {
  return { success: true, data: { message: 'OK' } };
}

export function demoListOrganizations(): ApiResponse<OrganizationWithRole[]> {
  return { success: true, data: [...demoEnsureSession().organizations] };
}

export function demoCreateOrganization(payload: { name: string }): ApiResponse<Organization> {
  const s = demoEnsureSession();
  const id = nextId('demo-org');
  const slug = `${payload.name.toLowerCase().replace(/\s+/g, '-')}-demo`;
  const org: OrganizationWithRole = {
    id,
    name: payload.name,
    slug,
    createdBy: s.user.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    role: Role.ADMIN,
  };
  s.organizations.push(org);
  return {
    success: true,
    data: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdBy: org.createdBy,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    },
  };
}

export function demoSwitchOrg(organizationId: string): ApiResponse<void> {
  const s = demoEnsureSession();
  if (!s.organizations.some((o) => o.id === organizationId)) {
    return {
      success: false,
      error: { code: 'ORG_NOT_FOUND', message: 'Organization not found.' },
    };
  }
  s.user.currentOrganizationId = organizationId;
  return { success: true, data: undefined };
}

export function demoGetCurrentOrg(): ApiResponse<Organization> {
  const s = demoEnsureSession();
  const id = s.user.currentOrganizationId;
  const org = s.organizations.find((o) => o.id === id);
  if (!org) {
    return { success: false, error: { code: 'ORG_NOT_FOUND', message: 'No workspace selected.' } };
  }
  return {
    success: true,
    data: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      createdBy: org.createdBy,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    },
  };
}

export function demoGetMembers(): ApiResponse<Membership[]> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId;
  if (!orgId) return { success: true, data: [] };
  return {
    success: true,
    data: s.memberships.filter((m) => m.organizationId === orgId).map((m) => ({ ...m })),
  };
}

export function demoListInvites(): ApiResponse<PendingInvite[]> {
  return { success: true, data: [...demoEnsureSession().invites] };
}

export function demoCreateInvite(payload: CreateInvitePayload): ApiResponse<{ emailSent: boolean }> {
  const s = demoEnsureSession();
  const inv: PendingInvite = {
    id: nextId('demo-inv'),
    email: payload.email,
    role: payload.role ?? Role.MEMBER,
    expiresAt: new Date(Date.now() + 7 * 864e5).toISOString(),
    createdAt: nowIso(),
  };
  s.invites.unshift(inv);

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: s.user.currentOrganizationId ?? DEMO_IDS.org,
    eventType: EventType.INVITE_CREATED,
    entityType: 'invite',
    entityId: inv.id,
    payload: { email: payload.email },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: { emailSent: false } };
}

export function demoResendInvite(inviteId: string): ApiResponse<{ emailSent: boolean }> {
  if (!demoEnsureSession().invites.some((i) => i.id === inviteId)) {
    return { success: false, error: { code: 'INVITE_NOT_FOUND', message: 'Invite not found.' } };
  }
  return { success: true, data: { emailSent: false } };
}

export function demoListProjects(params?: { page?: number; limit?: number; search?: string }): ApiResponse<Project[]> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId!;
  let list = s.projects.filter((p) => p.organizationId === orgId);
  if (params?.search) {
    const q = params.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
  }
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const { slice, total } = paginate(list, page, limit);
  return {
    success: true,
    data: slice.map((p) => ({ ...p })),
    meta: { page, total },
  };
}

export function demoGetProject(id: string): ApiResponse<Project> {
  const p = demoEnsureSession().projects.find((x) => x.id === id);
  if (!p) return { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } };
  return { success: true, data: { ...p } };
}

export function demoCreateProject(payload: CreateProjectPayload): ApiResponse<Project> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId!;
  const id = nextId('demo-proj');
  const row: Project = {
    id,
    organizationId: orgId,
    name: payload.name,
    description: payload.description ?? null,
    createdBy: s.user.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  s.projects.push(row);

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: orgId,
    eventType: EventType.PROJECT_CREATED,
    entityType: 'project',
    entityId: id,
    payload: { snapshot: { name: row.name } },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: { ...row } };
}

export function demoUpdateProject(id: string, payload: UpdateProjectPayload): ApiResponse<Project> {
  const s = demoEnsureSession();
  const idx = s.projects.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } };
  const cur = s.projects[idx];
  const next = {
    ...cur,
    ...payload,
    description: payload.description !== undefined ? payload.description : cur.description,
    updatedAt: nowIso(),
  };
  s.projects[idx] = next;

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: cur.organizationId,
    eventType: EventType.PROJECT_UPDATED,
    entityType: 'project',
    entityId: id,
    payload: { snapshot: { name: next.name } },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: { ...next } };
}

export function demoDeleteProject(id: string): ApiResponse<void> {
  const s = demoEnsureSession();
  const idx = s.projects.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } };
  const proj = s.projects[idx];
  s.projects.splice(idx, 1);
  s.tasks = s.tasks.filter((t) => t.projectId !== id);

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: proj.organizationId,
    eventType: EventType.PROJECT_DELETED,
    entityType: 'project',
    entityId: id,
    payload: { snapshot: { name: proj.name } },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: undefined };
}

export function demoListTasksForProject(projectId: string, filters?: TaskFilters): ApiResponse<Task[]> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId!;
  let list = s.tasks.filter((t) => t.projectId === projectId && t.organizationId === orgId);
  list = applyTaskFilters(list, filters);
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 100;
  const { slice, total } = paginate(list, page, limit);
  return {
    success: true,
    data: slice.map((t) => ({ ...t })),
    meta: { page, total },
  };
}

export function demoListAllTasks(filters?: TaskFilters): ApiResponse<Task[]> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId!;
  let list = filterTasksByOrg(s.tasks, orgId);
  list = applyTaskFilters(list, filters);
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 100;
  const { slice, total } = paginate(list, page, limit);
  return {
    success: true,
    data: slice.map((t) => ({ ...t })),
    meta: { page, total },
  };
}

export function demoGetTask(id: string): ApiResponse<Task> {
  const t = demoEnsureSession().tasks.find((x) => x.id === id);
  if (!t) return { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } };
  return { success: true, data: { ...t } };
}

export function demoCreateTask(projectId: string, payload: CreateTaskPayload): ApiResponse<Task> {
  const s = demoEnsureSession();
  const proj = s.projects.find((p) => p.id === projectId);
  if (!proj) return { success: false, error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } };

  const assignee = payload.assignedTo;
  if (assignee && !s.memberships.some((m) => m.userId === assignee && m.organizationId === proj.organizationId)) {
    return { success: false, error: { code: 'INVALID_ASSIGNEE', message: 'Invalid assignee.' } };
  }

  const id = nextId('demo-task');
  const row: Task = {
    id,
    projectId,
    organizationId: proj.organizationId,
    title: payload.title,
    description: payload.description ?? null,
    status: payload.status ?? TaskStatus.TODO,
    priority: payload.priority ?? TaskPriority.MEDIUM,
    assignedTo: payload.assignedTo ?? null,
    dueDate: payload.dueDate ?? null,
    createdBy: s.user.id,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  s.tasks.push(row);

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: proj.organizationId,
    eventType: EventType.TASK_CREATED,
    entityType: 'task',
    entityId: id,
    payload: {
      snapshot: {
        title: row.title,
        status: row.status,
        assignedTo: row.assignedTo ?? undefined,
      },
    },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: { ...row } };
}

export function demoUpdateTask(id: string, payload: UpdateTaskPayload): ApiResponse<Task> {
  const s = demoEnsureSession();
  const idx = s.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } };

  const cur = s.tasks[idx];
  const assignee = payload.assignedTo;
  if (assignee && !s.memberships.some((m) => m.userId === assignee && m.organizationId === cur.organizationId)) {
    return { success: false, error: { code: 'INVALID_ASSIGNEE', message: 'Invalid assignee.' } };
  }

  const prevStatus = cur.status;
  const next: Task = {
    ...cur,
    title: payload.title ?? cur.title,
    description: payload.description !== undefined ? payload.description : cur.description,
    status: payload.status ?? cur.status,
    priority: payload.priority ?? cur.priority,
    assignedTo: payload.assignedTo !== undefined ? payload.assignedTo : cur.assignedTo,
    dueDate: payload.dueDate !== undefined ? payload.dueDate : cur.dueDate,
    updatedAt: nowIso(),
  };
  s.tasks[idx] = next;

  const statusChanged = payload.status !== undefined && payload.status !== prevStatus;

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: cur.organizationId,
    eventType: EventType.TASK_UPDATED,
    entityType: 'task',
    entityId: id,
    payload: statusChanged
      ? {
          snapshot: {
            title: next.title,
            statusBefore: prevStatus,
            status: next.status,
          },
          changes: { status: next.status },
        }
      : {
          snapshot: { title: next.title },
          changes: {
            ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
            ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
            ...(payload.assignedTo !== undefined ? { assignedTo: payload.assignedTo } : {}),
          },
        },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: { ...next } };
}

export function demoDeleteTask(id: string): ApiResponse<void> {
  const s = demoEnsureSession();
  const idx = s.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return { success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } };
  const cur = s.tasks[idx];
  s.tasks.splice(idx, 1);

  s.activities.unshift({
    id: nextId('demo-act'),
    organizationId: cur.organizationId,
    eventType: EventType.TASK_DELETED,
    entityType: 'task',
    entityId: id,
    payload: { snapshot: { title: cur.title } },
    triggeredBy: s.user.id,
    createdAt: nowIso(),
  });

  return { success: true, data: undefined };
}

export function demoListActivity(params?: ActivityListParams): ApiResponse<Activity[]> {
  const s = demoEnsureSession();
  const orgId = s.user.currentOrganizationId!;
  let list = s.activities.filter((a) => a.organizationId === orgId);

  if (params?.entityType) list = list.filter((a) => a.entityType === params.entityType);
  if (params?.entityId) list = list.filter((a) => a.entityId === params.entityId);
  if (params?.triggeredBy) list = list.filter((a) => a.triggeredBy === params.triggeredBy);

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const { slice, total } = paginate(list, page, limit);
  return {
    success: true,
    data: slice.map((a) => ({ ...a })),
    meta: { page, total },
  };
}

export function demoListNotifications(page = 1, limit = 20): { data: Notification[]; meta: { page: number; total: number } } {
  const s = demoEnsureSession();
  const uid = s.user.id;
  const list = s.notifications.filter((n) => n.userId === uid);
  const { slice, total } = paginate(list, page, limit);
  return { data: slice.map((n) => ({ ...n })), meta: { page, total } };
}

export function demoUnreadCount(): { count: number } {
  const s = demoEnsureSession();
  const uid = s.user.id;
  const count = s.notifications.filter((n) => n.userId === uid && !n.read).length;
  return { count };
}

export function demoMarkNotificationRead(id: string): ApiResponse<{ message: string }> {
  const s = demoEnsureSession();
  const n = s.notifications.find((x) => x.id === id);
  if (!n) return { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found.' } };
  n.read = true;
  return { success: true, data: { message: 'OK' } };
}

export function demoMarkAllNotificationsRead(): ApiResponse<{ message: string }> {
  const s = demoEnsureSession();
  const uid = s.user.id;
  for (const n of s.notifications) {
    if (n.userId === uid) n.read = true;
  }
  return { success: true, data: { message: 'OK' } };
}

export function demoValidateInvite(): ApiResponse<{
  organizationName: string;
  email: string | null;
  role: string;
}> {
  return {
    success: true,
    data: {
      organizationName: 'Acme Product Team',
      email: 'guest@demo.local',
      role: 'member',
    },
  };
}

export function demoAcceptInvite(): ApiResponse<Membership> {
  const s = demoEnsureSession();
  const mem = s.memberships[0];
  return { success: true, data: { ...mem } };
}
