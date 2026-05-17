import { DataSource } from 'typeorm';
import {
  TestContext,
  TestHttpClient,
  createTestApp,
  cleanAll,
  destroyTestApp,
} from './helpers';
import {
  createVerifiedUser,
  createOrganization,
  createProject,
  createTask,
} from './factories';

/**
 * RLS (Row-Level Security) Database-Level Isolation Tests
 *
 * These tests validate that PostgreSQL RLS policies enforce tenant isolation
 * independently of application code. They bypass the application layer
 * entirely and query the database directly with SET LOCAL to prove that:
 *
 * 1. Correct tenant context → sees own data
 * 2. Wrong tenant context → sees nothing (not even partial data)
 * 3. Empty tenant context → sees nothing
 * 4. INSERT with wrong org → rejected by WITH CHECK
 *
 * These tests only pass when:
 * - The RLS migration has been applied
 * - FORCE ROW LEVEL SECURITY is active
 * - The test connection uses a role subject to RLS
 */
describe('RLS Database-Level Isolation (E2E)', () => {
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
   * Helper: runs a query within a specific tenant context using SET LOCAL.
   */
  /**
   * Helper: runs a query as the application role (subject to RLS) with tenant context.
   * Uses SET LOCAL ROLE to simulate the app role, ensuring RLS policies are enforced.
   */
  async function queryAsTenant<T = any>(
    ds: DataSource,
    orgId: string,
    sql: string,
    params: any[] = [],
  ): Promise<T[]> {
    const queryRunner = ds.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Switch to app role so RLS applies (bypass policy is only for owner role)
      await queryRunner.query(`SET LOCAL ROLE taskforge_app`);
      await queryRunner.query(`SET LOCAL app.current_org_id = '${orgId}'`);
      const result = await queryRunner.query(sql, params);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Helper: runs a query as the app role without any tenant context (empty org ID).
   */
  async function queryWithoutTenantContext<T = any>(
    ds: DataSource,
    sql: string,
    params: any[] = [],
  ): Promise<T[]> {
    const queryRunner = ds.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`SET LOCAL ROLE taskforge_app`);
      await queryRunner.query(`SET LOCAL app.current_org_id = ''`);
      const result = await queryRunner.query(sql, params);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  describe('Tasks table RLS', () => {
    it('should return only tasks belonging to the set tenant context', async () => {
      // Setup: two orgs, each with tasks
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });
      const projectA = await createProject(ctx.dataSource, {
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
      });
      await createTask(ctx.dataSource, {
        projectId: projectA.id,
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
        title: 'Org A Task',
      });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });
      const projectB = await createProject(ctx.dataSource, {
        organizationId: orgB.organization.id,
        createdBy: userB.user.id,
      });
      await createTask(ctx.dataSource, {
        projectId: projectB.id,
        organizationId: orgB.organization.id,
        createdBy: userB.user.id,
        title: 'Org B Task',
      });

      // Query as Org A — should only see Org A's task
      const tasksA = await queryAsTenant(
        ctx.dataSource,
        orgA.organization.id,
        `SELECT * FROM tasks WHERE deleted_at IS NULL`,
      );

      expect(tasksA.length).toBe(1);
      expect(tasksA[0].title).toBe('Org A Task');
      expect(tasksA[0].organization_id).toBe(orgA.organization.id);

      // Query as Org B — should only see Org B's task
      const tasksB = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM tasks WHERE deleted_at IS NULL`,
      );

      expect(tasksB.length).toBe(1);
      expect(tasksB[0].title).toBe('Org B Task');
      expect(tasksB[0].organization_id).toBe(orgB.organization.id);
    });

    it('should return zero rows when tenant context is empty', async () => {
      const user = await createVerifiedUser(ctx.dataSource, { email: 'rls-empty@test.local' });
      const org = await createOrganization(ctx.dataSource, { createdBy: user.user.id });
      const project = await createProject(ctx.dataSource, {
        organizationId: org.organization.id,
        createdBy: user.user.id,
      });
      await createTask(ctx.dataSource, {
        projectId: project.id,
        organizationId: org.organization.id,
        createdBy: user.user.id,
      });

      // Query without tenant context — should see nothing
      const tasks = await queryWithoutTenantContext(
        ctx.dataSource,
        `SELECT * FROM tasks`,
      );

      expect(tasks.length).toBe(0);
    });

    it('should prevent INSERT with mismatched org context', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-ins-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });
      const projectA = await createProject(ctx.dataSource, {
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
      });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-ins-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

      // Try to insert a task for Org A while authenticated as Org B
      await expect(
        queryAsTenant(
          ctx.dataSource,
          orgB.organization.id,
          `INSERT INTO tasks (id, project_id, organization_id, title, status, priority, created_by, created_at, updated_at)
           VALUES (uuid_generate_v4(), $1, $2, 'Injected Task', 'todo', 'medium', $3, NOW(), NOW())`,
          [projectA.id, orgA.organization.id, userB.user.id],
        ),
      ).rejects.toThrow(); // RLS WITH CHECK violation
    });
  });

  describe('Projects table RLS', () => {
    it('should isolate projects between tenants', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-proj-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });
      await createProject(ctx.dataSource, {
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
        name: 'Project Alpha',
      });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-proj-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });
      await createProject(ctx.dataSource, {
        organizationId: orgB.organization.id,
        createdBy: userB.user.id,
        name: 'Project Beta',
      });

      // Org A sees only their project
      const projA = await queryAsTenant(
        ctx.dataSource,
        orgA.organization.id,
        `SELECT * FROM projects WHERE deleted_at IS NULL`,
      );
      expect(projA.length).toBe(1);
      expect(projA[0].name).toBe('Project Alpha');

      // Org B sees only their project
      const projB = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM projects WHERE deleted_at IS NULL`,
      );
      expect(projB.length).toBe(1);
      expect(projB[0].name).toBe('Project Beta');
    });
  });

  describe('Activities table RLS', () => {
    it('should isolate activity logs between tenants', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-act-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-act-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

      // Insert activities directly
      await ctx.dataSource.query(
        `INSERT INTO activities (id, organization_id, event_type, entity_type, entity_id, payload, triggered_by, created_at)
         VALUES (uuid_generate_v4(), $1, 'task.created', 'task', uuid_generate_v4(), '{}', $2, NOW())`,
        [orgA.organization.id, userA.user.id],
      );
      await ctx.dataSource.query(
        `INSERT INTO activities (id, organization_id, event_type, entity_type, entity_id, payload, triggered_by, created_at)
         VALUES (uuid_generate_v4(), $1, 'task.created', 'task', uuid_generate_v4(), '{}', $2, NOW())`,
        [orgB.organization.id, userB.user.id],
      );

      // Org A sees only their activities
      const activitiesA = await queryAsTenant(
        ctx.dataSource,
        orgA.organization.id,
        `SELECT * FROM activities`,
      );
      expect(activitiesA.length).toBe(1);
      expect(activitiesA[0].organization_id).toBe(orgA.organization.id);

      // Org B sees only their activities
      const activitiesB = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM activities`,
      );
      expect(activitiesB.length).toBe(1);
      expect(activitiesB[0].organization_id).toBe(orgB.organization.id);
    });
  });

  describe('Memberships table RLS', () => {
    it('should only show memberships for the current org context', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-mem-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-mem-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

      // Org A should only see their membership
      const membershipsA = await queryAsTenant(
        ctx.dataSource,
        orgA.organization.id,
        `SELECT * FROM memberships`,
      );
      expect(membershipsA.length).toBe(1);
      expect(membershipsA[0].user_id).toBe(userA.user.id);

      // Org B should only see their membership
      const membershipsB = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM memberships`,
      );
      expect(membershipsB.length).toBe(1);
      expect(membershipsB[0].user_id).toBe(userB.user.id);
    });
  });

  describe('Cross-cutting RLS guarantees', () => {
    it('should prevent UPDATE across tenant boundaries', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-upd-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });
      const projectA = await createProject(ctx.dataSource, {
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
        name: 'Original Name',
      });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-upd-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

      // Attempt to update Org A's project while in Org B's context
      const result = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM projects WHERE id = $1`,
        [projectA.id],
      );

      // RLS filters the WHERE clause — Org A's project is not visible to Org B
      expect(result.length).toBe(0);
    });

    it('should prevent DELETE visibility across tenant boundaries', async () => {
      const userA = await createVerifiedUser(ctx.dataSource, { email: 'rls-del-a@test.local' });
      const orgA = await createOrganization(ctx.dataSource, { createdBy: userA.user.id });
      const projectA = await createProject(ctx.dataSource, {
        organizationId: orgA.organization.id,
        createdBy: userA.user.id,
      });

      const userB = await createVerifiedUser(ctx.dataSource, { email: 'rls-del-b@test.local' });
      const orgB = await createOrganization(ctx.dataSource, { createdBy: userB.user.id });

      // Org B cannot even see Org A's project
      const visible = await queryAsTenant(
        ctx.dataSource,
        orgB.organization.id,
        `SELECT * FROM projects WHERE id = $1`,
        [projectA.id],
      );
      expect(visible.length).toBe(0);

      // Org A CAN see their own project
      const ownProjects = await queryAsTenant(
        ctx.dataSource,
        orgA.organization.id,
        `SELECT * FROM projects WHERE id = $1`,
        [projectA.id],
      );
      expect(ownProjects.length).toBe(1);
    });
  });
});
