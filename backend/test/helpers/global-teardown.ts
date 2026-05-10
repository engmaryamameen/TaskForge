import { DataSource } from 'typeorm';

/**
 * Global teardown for E2E tests.
 * Drops the test database after all suites complete.
 */
export default async function globalTeardown() {
  const dbName = process.env.DB_NAME || 'taskforge_test';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';

  const adminDs = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: parseInt(dbPort),
    username: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  await adminDs.initialize();

  // Terminate active connections then drop
  await adminDs.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [dbName],
  );
  await adminDs.query(`DROP DATABASE IF EXISTS "${dbName}"`);

  await adminDs.destroy();
}
