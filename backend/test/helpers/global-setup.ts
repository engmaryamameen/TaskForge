import { DataSource } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.test since global setup runs in a separate context
const envPath = path.resolve(__dirname, '../../.env.test');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

/**
 * Global setup for E2E tests.
 * Creates the test database and runs migrations once before all test suites.
 */
export default async function globalSetup() {
  const dbName = process.env.DB_NAME || 'taskforge_test';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || '5432';
  const dbUser = process.env.DB_USERNAME || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'postgres';

  // Create test database if it doesn't exist
  const adminDs = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: parseInt(dbPort),
    username: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  await adminDs.initialize();

  const dbExists = await adminDs.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );

  if (dbExists.length === 0) {
    await adminDs.query(`CREATE DATABASE "${dbName}"`);
  }

  await adminDs.destroy();

  // Run migrations against test database
  const testDs = new DataSource({
    type: 'postgres',
    host: dbHost,
    port: parseInt(dbPort),
    username: dbUser,
    password: dbPassword,
    database: dbName,
    migrations: [
      path.join(__dirname, '../../src/infrastructure/database/migrations/*.ts'),
    ],
  });

  await testDs.initialize();
  // Ensure UUID extension is available (required by migrations)
  await testDs.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await testDs.runMigrations();
  await testDs.destroy();
}
