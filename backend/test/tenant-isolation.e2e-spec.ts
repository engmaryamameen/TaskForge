import { DataSource } from 'typeorm';
import {
  TestContext,
  TestHttpClient,
  createTestApp,
  cleanAll,
  destroyTestApp,
  authHeaders,
} from './helpers';
import {
  createVerifiedUser,
  createOrganization,
  addMember,
  createProject,
  createTask,
} from './factories';

/**
 * Tenant Isolation Integration Tests
 *
 * These tests prove that multi-tenant boundaries cannot be crossed.
 * Each test creates two completely separate organizations (tenants) and
 * verifies that data from one cannot be accessed by the other.
 */
describe('Tenant Isolation (E2E)', () => {
  let ctx: TestContext;
  let http: TestHttpClient;

  beforeAll(async () => {
    ctx = await createTestApp();
    http = new TestHttpClient(ctx.app);
  });

  afterAll(async () => {
    await destroyTestApp(ctx);
  });

  beforeEach(async () => {
    await cleanAll(ctx);
  });

  /**
   * Helper: sets up two isolated tenants, each with a user, org, project, and task.
   */
  async function setupTwoTenants() {
    // Tenant A
    const userA = await createVerifiedUser(ctx.dataSource, { email: 'a@tenant.local' });
    const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });

    const loginA = await http.post('/api/v1/auth/login', {
      email: 'a@tenant.local',
      password: userA.password,
    });
    const tokenA = loginA.body.data.accessToken;

    const projectA = await createProject(ctx.dataSource, {
      organizationId: orgA.organization.id,
      createdBy: userA.user.id,
      name: 'Tenant A Project',
    });
    const taskA = await createTask(ctx.dataSource, {
      projectId: projectA.id,
      organizationId: orgA.organization.id,
      createdBy: userA.user.id,
      title: 'Tenant A Secret Task',
    });

    // Tenant B
    const userB = await createVerifiedUser(ctx.dataSource, { email: 'b@tenant.local' });
    const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

    const loginB = await http.post('/api/v1/auth/login', {
      email: 'b@tenant.local',
      password: userB.password,
    });
    const tokenB = loginB.body.data.accessToken;

    const projectB = await createProject(ctx.dataSource, {
      organizationId: orgB.organization.id,
      createdBy: userB.user.id,
      name: 'Tenant B Project',
    });
    const taskB = await createTask(ctx.dataSource, {
      projectId: projectB.id,
      organizationId: orgB.organization.id,
      createdBy: userB.user.id,
      title: 'Tenant B Secret Task',
    });

    return {
      tenantA: { user: userA, org: orgA.organization, project: projectA, task: taskA, token: tokenA },
      tenantB: { user: userB, org: orgB.organization, project: projectB, task: taskB, token: tokenB },
    };
  }

  // ─── PROJECT ISOLATION ─────────────────────────────────────────

  describe('Project isolation', () => {
    it('should NOT allow Tenant B to list Tenant A projects', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Tenant B tries to list projects using Tenant A's org ID
      const res = await http.get(
        '/api/v1/projects',
        authHeaders(tenantB.token, tenantA.org.id),
      );

      // Should be rejected — user B is not a member of org A
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NOT_A_MEMBER');
    });

    it('should NOT allow Tenant B to access Tenant A project by ID', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Tenant B tries to access Tenant A's project directly
      const res = await http.get(
        `/api/v1/projects/${tenantA.project.id}`,
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);
    });

    it('should return 404 when accessing another tenant project with own org header', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Tenant B uses their own org header but Tenant A's project ID
      const res = await http.get(
        `/api/v1/projects/${tenantA.project.id}`,
        authHeaders(tenantB.token, tenantB.org.id),
      );

      // Project doesn't exist in org B — should be 404 not 200
      expect(res.status).toBe(404);
    });

    it('should NOT allow creating a project in another tenant org', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      const res = await http.post(
        '/api/v1/projects',
        { name: 'Injected Project' },
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);
    });
  });

  // ─── TASK ISOLATION ────────────────────────────────────────────

  describe('Task isolation', () => {
    it('should NOT allow cross-tenant task listing', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Tenant B tries to list tasks in Tenant A's org
      const res = await http.get(
        '/api/v1/tasks',
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);
    });

    it('should NOT allow cross-tenant task access by ID', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      const res = await http.get(
        `/api/v1/tasks/${tenantA.task.id}`,
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);
    });

    it('should return 404 when accessing cross-tenant task with own org header', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // User B uses their own org header, but tries Tenant A's task ID
      const res = await http.get(
        `/api/v1/tasks/${tenantA.task.id}`,
        authHeaders(tenantB.token, tenantB.org.id),
      );

      expect(res.status).toBe(404);
    });

    it('should NOT allow updating a task in another tenant', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      const res = await http.patch(
        `/api/v1/tasks/${tenantA.task.id}`,
        { title: 'Hacked Title' },
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);

      // Verify task was NOT modified
      const task = await ctx.dataSource.getRepository('Task').findOne({
        where: { id: tenantA.task.id },
      });
      expect(task).not.toBeNull();
      expect(task!.title).toBe('Tenant A Secret Task');
    });

    it('should NOT allow deleting a task in another tenant', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      const res = await http.delete(
        `/api/v1/tasks/${tenantA.task.id}`,
        authHeaders(tenantB.token, tenantA.org.id),
      );

      expect(res.status).toBe(403);

      // Verify task still exists
      const task = await ctx.dataSource.getRepository('Task').findOne({
        where: { id: tenantA.task.id },
      });
      expect(task).not.toBeNull();
      expect(task!.deletedAt).toBeNull();
    });
  });

  // ─── ORGANIZATION MEMBERSHIP GUARD ─────────────────────────────

  describe('OrgMembershipGuard enforcement', () => {
    it('should reject requests without x-organization-id header for org-scoped routes', async () => {
      const { user } = await createVerifiedUser(ctx.dataSource, {
        email: 'noheader@test.local',
      });

      // Remove user's currentOrganizationId so there's no fallback
      await ctx.dataSource.getRepository('User').update(user.id, {
        currentOrganizationId: null,
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'noheader@test.local',
        password: 'TestPassword123!',
      });

      const res = await http.get('/api/v1/projects', {
        Authorization: `Bearer ${loginRes.body.data.accessToken}`,
        // No x-organization-id header
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ORG_NOT_FOUND');
    });

    it('should reject request with fabricated organization ID', async () => {
      const { user } = await createVerifiedUser(ctx.dataSource, {
        email: 'fake-org@test.local',
      });
      await createOrganization(ctx.dataSource, { createdBy: user.id });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'fake-org@test.local',
        password: 'TestPassword123!',
      });

      const fakeOrgId = '00000000-0000-0000-0000-000000000000';
      const res = await http.get('/api/v1/projects', {
        Authorization: `Bearer ${loginRes.body.data.accessToken}`,
        'x-organization-id': fakeOrgId,
      });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NOT_A_MEMBER');
    });

    it('should prevent privilege escalation by spoofing org header after membership removal', async () => {
      const { tenantA } = await setupTwoTenants();

      // Create a third user, add to org A, then remove
      const userC = await createVerifiedUser(ctx.dataSource, { email: 'removed@test.local' });
      const membership = await addMember(ctx.dataSource, userC.user.id, tenantA.org.id);

      const loginC = await http.post('/api/v1/auth/login', {
        email: 'removed@test.local',
        password: userC.password,
      });
      const tokenC = loginC.body.data.accessToken;

      // Verify access works before removal
      const beforeRes = await http.get(
        '/api/v1/projects',
        authHeaders(tokenC, tenantA.org.id),
      );
      expect(beforeRes.status).toBe(200);

      // Remove membership
      await ctx.dataSource.getRepository('Membership').delete(membership.id);

      // Flush Redis cache so stale membership isn't served
      await ctx.redis.flushdb();

      // Should now be rejected
      const afterRes = await http.get(
        '/api/v1/projects',
        authHeaders(tokenC, tenantA.org.id),
      );
      expect(afterRes.status).toBe(403);
    });
  });

  // ─── ROLE-BASED ACCESS WITHIN TENANT ───────────────────────────

  describe('Role-based isolation within tenant', () => {
    it('should prevent members from deleting projects (admin-only)', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'admin@role.local' });
      const org = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });

      const project = await createProject(ctx.dataSource, {
        organizationId: org.organization.id,
        createdBy: userA.user.id,
      });

      // Add member (non-admin)
      const memberUser = await createVerifiedUser(ctx.dataSource, { email: 'member@role.local' });
      await addMember(ctx.dataSource, memberUser.user.id, org.organization.id, 'member');

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'member@role.local',
        password: memberUser.password,
      });

      const res = await http.delete(
        `/api/v1/projects/${project.id}`,
        authHeaders(loginRes.body.data.accessToken, org.organization.id),
      );

      // Members can't delete projects they didn't create
      expect(res.status).toBe(403);
    });

    it('should allow members to create tasks within their org', async () => {
      const admin = await createVerifiedUser(ctx.dataSource, { email: 'admin2@role.local' });
      const org = await createOrganization(ctx.dataSource, { createdBy: admin.user.id });

      const project = await createProject(ctx.dataSource, {
        organizationId: org.organization.id,
        createdBy: admin.user.id,
      });

      const member = await createVerifiedUser(ctx.dataSource, { email: 'member2@role.local' });
      await addMember(ctx.dataSource, member.user.id, org.organization.id, 'member');

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'member2@role.local',
        password: member.password,
      });

      const res = await http.post(
        `/api/v1/projects/${project.id}/tasks`,
        { title: 'Member Task', priority: 'high' },
        authHeaders(loginRes.body.data.accessToken, org.organization.id),
      );

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Member Task');
      expect(res.body.data.organizationId).toBe(org.organization.id);
    });
  });

  // ─── DATA LEAKAGE EDGE CASES ───────────────────────────────────

  describe('Data leakage edge cases', () => {
    it('should not include cross-tenant data in paginated task lists', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Create many tasks in tenant A
      for (let i = 0; i < 5; i++) {
        await createTask(ctx.dataSource, {
          projectId: tenantA.project.id,
          organizationId: tenantA.org.id,
          createdBy: tenantA.user.user.id,
          title: `A-Task-${i}`,
        });
      }

      // Tenant B lists their tasks — should only see their own
      const res = await http.get(
        '/api/v1/tasks',
        authHeaders(tenantB.token, tenantB.org.id),
      );

      expect(res.status).toBe(200);
      const tasks = res.body.data;
      for (const task of tasks) {
        expect(task.organizationId).toBe(tenantB.org.id);
      }
      // B has exactly 1 task from setup
      expect(tasks.length).toBe(1);
    });

    it('should not allow assigning a task to a user from another org', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Tenant A tries to assign their task to Tenant B's user
      const res = await http.patch(
        `/api/v1/tasks/${tenantA.task.id}`,
        { assignedTo: tenantB.user.user.id },
        authHeaders(tenantA.token, tenantA.org.id),
      );

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_ASSIGNEE');
    });

    it('should scope task search results to current tenant', async () => {
      const { tenantA, tenantB } = await setupTwoTenants();

      // Create task with a unique searchable title in tenant A
      await createTask(ctx.dataSource, {
        projectId: tenantA.project.id,
        organizationId: tenantA.org.id,
        createdBy: tenantA.user.user.id,
        title: 'UNICORN-NEEDLE-12345',
      });

      // Tenant B searches for it — should find nothing
      const res = await http.get(
        '/api/v1/tasks?search=UNICORN-NEEDLE',
        authHeaders(tenantB.token, tenantB.org.id),
      );

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });
});
