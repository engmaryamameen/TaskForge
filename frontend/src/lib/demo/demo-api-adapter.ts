/**
 * Axios adapter that serves the demo universe — portfolio preview only.
 * Keeps real `apiClient` call sites unchanged when NEXT_PUBLIC_DEMO_MODE=true.
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';
import { Role, TaskPriority, TaskStatus } from '@/types';
import type { UpdateTaskPayload } from '@/lib/api/tasks.api';
import { useAuthStore } from '@/store/auth.store';
import {
  DEMO_ACCESS_TOKEN,
  demoAcceptInvite,
  demoCreateInvite,
  demoCreateOrganization,
  demoCreateProject,
  demoCreateTask,
  demoDeleteProject,
  demoDeleteTask,
  demoGetCurrentOrg,
  demoGetMembers,
  demoGetProject,
  demoGetSessionOrNull,
  demoGetTask,
  demoListActivity,
  demoListAllTasks,
  demoListInvites,
  demoListNotifications,
  demoListOrganizations,
  demoListProjects,
  demoListTasksForProject,
  demoLogin,
  demoLogout,
  demoMarkAllNotificationsRead,
  demoMarkNotificationRead,
  demoMe,
  demoRefresh,
  demoResendInvite,
  demoResetSession,
  demoSwitchOrg,
  demoUnreadCount,
  demoUpdateProfile,
  demoUpdateProject,
  demoUpdateTask,
  demoValidateInvite,
} from '@/lib/demo/demo-store';

async function demoDelay(): Promise<void> {
  const ms = 90 + Math.floor(Math.random() * 110);
  await new Promise((r) => setTimeout(r, ms));
}

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  const d = config.data;
  if (d == null || d === '') return {};
  if (typeof d === 'string') {
    try {
      return JSON.parse(d) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof d === 'object') return d as Record<string, unknown>;
  return {};
}

function getPathname(config: InternalAxiosRequestConfig): string {
  const raw = config.url || '';
  const base = config.baseURL || '';
  try {
    const full = raw.startsWith('http') ? raw : `${base.replace(/\/$/, '')}/${raw.replace(/^\//, '')}`;
    let path = new URL(full).pathname;
    if (path.startsWith('/api/v1')) path = path.slice('/api/v1'.length) || '/';
    return path.replace(/\/$/, '') || '/';
  } catch {
    return raw.split('?')[0] ?? '/';
  }
}

function rejectDemo(config: InternalAxiosRequestConfig, status: number, body: unknown): Promise<never> {
  const err = new AxiosError(
    'Demo request failed',
    AxiosError.ERR_BAD_REQUEST,
    config,
    undefined,
    {
      status,
      statusText: 'Error',
      data: body,
      headers: {},
      config,
    } as AxiosResponse,
  );
  return Promise.reject(err);
}

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  };
}

async function unwrapApi<T>(
  config: InternalAxiosRequestConfig,
  result: ApiResponse<T>,
): Promise<AxiosResponse<ApiResponse<T>>> {
  if (result.success) {
    return ok(config, result);
  }
  const code = result.error?.code;
  const status =
    code === 'PROJECT_NOT_FOUND' ||
    code === 'TASK_NOT_FOUND' ||
    code === 'ORG_NOT_FOUND' ||
    code === 'INVITE_NOT_FOUND' ||
    code === 'NOT_FOUND'
      ? 404
      : 400;
  return rejectDemo(config, status, {
    success: false,
    error: result.error ?? { code: 'UNKNOWN', message: 'Request failed' },
  });
}

function ensureHydrated(config: InternalAxiosRequestConfig, pathname: string) {
  if (demoGetSessionOrNull()) return;
  if (pathname === '/auth/login' || pathname === '/auth/register') return;

  const { accessToken, user } = useAuthStore.getState();
  if (accessToken !== DEMO_ACCESS_TOKEN) return;

  demoResetSession(user?.email?.trim() || 'alex.chen@acme.demo');
}

export async function demoApiAdapter(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  await demoDelay();

  const method = (config.method || 'get').toUpperCase();
  const pathname = getPathname(config);
  const params = (config.params || {}) as Record<string, unknown>;
  const body = parseBody(config);

  ensureHydrated(config, pathname);

  // --- Auth ---
  if (method === 'POST' && pathname === '/auth/login') {
    const email = String(body.email ?? '');
    const password = String(body.password ?? '');
    const result = demoLogin(email, password);
    if (!result.success || !result.data) {
      const status = result.error?.code === 'VALIDATION_ERROR' ? 400 : 401;
      return rejectDemo(config, status, {
        success: false,
        error: result.error ?? { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }
    return ok(config, {
      success: true,
      data: result.data,
    });
  }

  if (method === 'POST' && pathname === '/auth/refresh') {
    return ok(config, demoRefresh());
  }

  if (method === 'GET' && pathname === '/auth/me') {
    return ok(config, demoMe());
  }

  if (method === 'PATCH' && pathname === '/auth/me') {
    const result = demoUpdateProfile({
      firstName: typeof body.firstName === 'string' ? body.firstName : undefined,
      lastName: typeof body.lastName === 'string' ? body.lastName : undefined,
    });
    return unwrapApi(config, result);
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    return ok(config, demoLogout());
  }

  if (method === 'POST' && pathname === '/auth/forgot-password') {
    return ok(config, {
      success: true,
      data: { message: 'Demo mode: use sign-in with any email and password. Full backend supports password reset.' },
    });
  }

  if (method === 'POST' && pathname === '/auth/resend-verification-email') {
    return ok(config, { success: true, data: { message: 'OK' } });
  }

  if (method === 'POST' && pathname === '/auth/verify-email') {
    return rejectDemo(config, 400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email verification is not available in demo mode. Sign in from the login page.',
      },
    });
  }

  if (method === 'POST' && pathname === '/auth/reset-password') {
    return rejectDemo(config, 400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Password reset is not available in demo mode.',
      },
    });
  }

  if (method === 'POST' && pathname === '/auth/register') {
    return rejectDemo(config, 400, {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Registration is disabled in demo mode. Sign in with any email and password to explore.',
      },
    });
  }

  // --- Organizations ---
  if (method === 'GET' && pathname === '/organizations') {
    return ok(config, demoListOrganizations());
  }

  if (method === 'POST' && pathname === '/organizations') {
    const name = String(body.name ?? '').trim();
    if (!name) {
      return rejectDemo(config, 400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
    }
    return unwrapApi(config, demoCreateOrganization({ name }));
  }

  if (method === 'POST' && pathname === '/organizations/switch') {
    const orgId = String(body.organizationId ?? '');
    return unwrapApi(config, demoSwitchOrg(orgId));
  }

  if (method === 'GET' && pathname === '/organizations/current') {
    return unwrapApi(config, demoGetCurrentOrg());
  }

  if (method === 'GET' && pathname === '/organizations/members') {
    return ok(config, demoGetMembers());
  }

  if (method === 'GET' && pathname === '/organizations/invites') {
    return ok(config, demoListInvites());
  }

  if (method === 'POST' && pathname === '/organizations/invites') {
    return unwrapApi(
      config,
      demoCreateInvite({
        email: String(body.email ?? ''),
        role: body.role as Role | undefined,
      }),
    );
  }

  const resendMatch = pathname.match(/^\/organizations\/invites\/([^/]+)\/resend$/);
  if (method === 'POST' && resendMatch) {
    return unwrapApi(config, demoResendInvite(resendMatch[1]));
  }

  if (method === 'GET' && pathname === '/invitations/validate') {
    return unwrapApi(config, demoValidateInvite());
  }

  if (method === 'POST' && pathname === '/invitations/accept') {
    return unwrapApi(config, demoAcceptInvite());
  }

  // --- Projects ---
  if (method === 'GET' && pathname === '/projects') {
    return ok(
      config,
      demoListProjects({
        page: params.page ? Number(params.page) : undefined,
        limit: params.limit ? Number(params.limit) : undefined,
        search: params.search ? String(params.search) : undefined,
      }),
    );
  }

  if (method === 'POST' && pathname === '/projects') {
    return unwrapApi(
      config,
      demoCreateProject({
        name: String(body.name ?? ''),
        description: typeof body.description === 'string' ? body.description : undefined,
      }),
    );
  }

  const projectOne = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectOne) {
    const id = projectOne[1];
    if (method === 'GET') return unwrapApi(config, demoGetProject(id));
    if (method === 'PATCH') {
    return unwrapApi(
      config,
      demoUpdateProject(id, {
        name: typeof body.name === 'string' ? body.name : undefined,
        description:
          body.description === undefined
            ? undefined
            : body.description === null
              ? undefined
              : String(body.description),
      }),
    );
    }
    if (method === 'DELETE') return unwrapApi(config, demoDeleteProject(id));
  }

  const projectTasks = pathname.match(/^\/projects\/([^/]+)\/tasks$/);
  if (projectTasks && method === 'GET') {
    const projectId = projectTasks[1];
    return ok(
      config,
      demoListTasksForProject(projectId, {
        search: params.search ? String(params.search) : undefined,
        status: params.status as TaskStatus | undefined,
        priority: params.priority as TaskPriority | undefined,
        assignedTo: params.assignedTo ? String(params.assignedTo) : undefined,
        page: params.page ? Number(params.page) : undefined,
        limit: params.limit ? Number(params.limit) : undefined,
      }),
    );
  }

  if (projectTasks && method === 'POST') {
    const projectId = projectTasks[1];
    return unwrapApi(
      config,
      demoCreateTask(projectId, {
        title: String(body.title ?? ''),
        description: typeof body.description === 'string' ? body.description : undefined,
        status: body.status as TaskStatus | undefined,
        priority: body.priority as TaskPriority | undefined,
        assignedTo: typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
        dueDate: typeof body.dueDate === 'string' ? body.dueDate : undefined,
      }),
    );
  }

  // --- Tasks ---
  if (method === 'GET' && pathname === '/tasks') {
    return ok(
      config,
      demoListAllTasks({
        search: params.search ? String(params.search) : undefined,
        status: params.status as TaskStatus | undefined,
        priority: params.priority as TaskPriority | undefined,
        assignedTo: params.assignedTo ? String(params.assignedTo) : undefined,
        page: params.page ? Number(params.page) : undefined,
        limit: params.limit ? Number(params.limit) : undefined,
      }),
    );
  }

  const taskOne = pathname.match(/^\/tasks\/([^/]+)$/);
  if (taskOne) {
    const id = taskOne[1];
    if (method === 'GET') return unwrapApi(config, demoGetTask(id));
    if (method === 'PATCH') {
      return unwrapApi(
        config,
        demoUpdateTask(id, {
          title: typeof body.title === 'string' ? body.title : undefined,
          description:
            body.description === undefined
              ? undefined
              : body.description === null
                ? undefined
                : String(body.description),
          status: body.status as TaskStatus | undefined,
          priority: body.priority as TaskPriority | undefined,
          assignedTo:
            body.assignedTo === null
              ? null
              : typeof body.assignedTo === 'string'
                ? body.assignedTo
                : undefined,
          dueDate:
            body.dueDate === undefined
              ? undefined
              : body.dueDate === null
                ? null
                : String(body.dueDate),
        } as UpdateTaskPayload),
      );
    }
    if (method === 'DELETE') return unwrapApi(config, demoDeleteTask(id));
  }

  // --- Activity ---
  if (method === 'GET' && pathname === '/activity') {
    return ok(
      config,
      demoListActivity({
        page: params.page ? Number(params.page) : undefined,
        limit: params.limit ? Number(params.limit) : undefined,
        entityType: params.entityType ? String(params.entityType) : undefined,
        entityId: params.entityId ? String(params.entityId) : undefined,
        triggeredBy: params.triggeredBy ? String(params.triggeredBy) : undefined,
      }),
    );
  }

  // --- Notifications (raw shape, not ApiResponse) ---
  if (method === 'GET' && pathname === '/notifications') {
    const page = params.page ? Number(params.page) : 1;
    const limit = params.limit ? Number(params.limit) : 20;
    const out = demoListNotifications(page, limit);
    return ok(config, out);
  }

  if (method === 'GET' && pathname === '/notifications/unread-count') {
    return ok(config, demoUnreadCount());
  }

  const notifRead = pathname.match(/^\/notifications\/([^/]+)\/read$/);
  if (method === 'POST' && notifRead) {
    return unwrapApi(config, demoMarkNotificationRead(notifRead[1]));
  }

  if (method === 'POST' && pathname === '/notifications/read-all') {
    return unwrapApi(config, demoMarkAllNotificationsRead());
  }

  return rejectDemo(config, 501, {
    success: false,
    error: {
      code: 'DEMO_ROUTE_MISSING',
      message: `Demo adapter: unhandled ${method} ${pathname}`,
    },
  });
}
