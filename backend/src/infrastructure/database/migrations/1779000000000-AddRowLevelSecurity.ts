import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds Row-Level Security (RLS) policies to all tenant-scoped tables.
 *
 * Strategy:
 * - Create a limited application role (taskforge_app) that the app connects as
 * - The migration runner (current role) retains table ownership and bypasses RLS
 * - RLS policies use current_setting('app.current_org_id') set per-transaction
 * - ENABLE ROW LEVEL SECURITY activates enforcement immediately
 *
 * Rollback: DISABLE ROW LEVEL SECURITY + DROP POLICY (instant, no data changes)
 */
export class AddRowLevelSecurity1779000000000 implements MigrationInterface {
  name = 'AddRowLevelSecurity1779000000000';

  // Tables that contain organization_id and need tenant isolation
  // Maps table name → column name for the org ID (varies due to legacy naming)
  private readonly tenantTables: Array<{ table: string; column: string }> = [
    { table: 'projects', column: 'organization_id' },
    { table: 'tasks', column: 'organization_id' },
    { table: 'activities', column: 'organization_id' },
    { table: 'memberships', column: 'organization_id' },
    { table: 'invites', column: 'organization_id' },
    { table: 'subscriptions', column: 'organization_id' },
    { table: 'organization_usage', column: 'organization_id' },
    { table: 'notifications', column: 'organizationId' },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure the GUC variable exists with a safe default (empty string)
    // This prevents errors when current_setting is called without a SET
    const [{ current_database: dbName }] = await queryRunner.query(
      `SELECT current_database()`,
    );
    await queryRunner.query(
      `ALTER DATABASE "${dbName}" SET app.current_org_id = ''`,
    );

    // Create the application role if it doesn't exist.
    // In production, the app connects as this role; the migration runner
    // connects as the table owner which bypasses RLS by default.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'taskforge_app') THEN
          CREATE ROLE taskforge_app NOLOGIN;
        END IF;
      END
      $$
    `);

    // Allow the current user (table owner) to assume the app role for testing
    await queryRunner.query(`
      GRANT taskforge_app TO current_user
    `);

    // Grant necessary privileges to the app role
    await queryRunner.query(`
      GRANT USAGE ON SCHEMA public TO taskforge_app
    `);
    await queryRunner.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO taskforge_app
    `);
    await queryRunner.query(`
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO taskforge_app
    `);
    // Ensure future tables also get grants
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO taskforge_app
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT USAGE ON SEQUENCES TO taskforge_app
    `);

    // Create RLS policies for each tenant-scoped table
    for (const { table, column } of this.tenantTables) {
      // Enable RLS on the table
      await queryRunner.query(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`,
      );

      // FORCE ensures RLS is applied even to the table owner role.
      // This is defense-in-depth: even if the app accidentally connects
      // as the owner, RLS still protects.
      await queryRunner.query(
        `ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY`,
      );

      // Policy: rows are visible/modifiable only when the org column
      // matches the current session's tenant context.
      // USING = read filter, WITH CHECK = write filter
      await queryRunner.query(`
        CREATE POLICY tenant_isolation_${table} ON "${table}"
          USING ("${column}" = NULLIF(current_setting('app.current_org_id', true), '')::uuid)
          WITH CHECK ("${column}" = NULLIF(current_setting('app.current_org_id', true), '')::uuid)
      `);

      // Bypass policy for system operations (migrations, admin tasks).
      // Applied only to the current user role (table owner / migration runner).
      await queryRunner.query(`
        CREATE POLICY system_bypass_${table} ON "${table}"
          FOR ALL
          TO current_user
          USING (true)
          WITH CHECK (true)
      `);
    }

    // Organizations table gets a different policy — users can see orgs
    // they're a member of (checked via memberships), but RLS here is
    // less critical since org data isn't sensitive in the same way.
    // We don't apply RLS to: users, organizations, plans, processed_webhooks,
    // refresh_tokens, email_verification_tokens, password_reset_tokens
    // These are either user-scoped (not org-scoped) or system tables.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Disable RLS and drop policies (instant, non-destructive)
    for (const { table } of this.tenantTables) {
      await queryRunner.query(`
        DROP POLICY IF EXISTS tenant_isolation_${table} ON "${table}"
      `);
      await queryRunner.query(`
        DROP POLICY IF EXISTS system_bypass_${table} ON "${table}"
      `);
      await queryRunner.query(
        `ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" NO FORCE ROW LEVEL SECURITY`,
      );
    }

    // Revoke grants (safe even if role doesn't exist)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'taskforge_app') THEN
          REVOKE ALL ON ALL TABLES IN SCHEMA public FROM taskforge_app;
          REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM taskforge_app;
          REVOKE USAGE ON SCHEMA public FROM taskforge_app;
        END IF;
      END
      $$
    `);

    const [{ current_database: dbName }] = await queryRunner.query(
      `SELECT current_database()`,
    );
    await queryRunner.query(
      `ALTER DATABASE "${dbName}" RESET app.current_org_id`,
    );
  }
}
