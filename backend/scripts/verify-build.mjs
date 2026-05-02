#!/usr/bin/env node
/**
 * Mirrors .github/workflows/ci.yml build verification (paths relative to backend/).
 */
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const dist = join(root, 'dist');

const files = ['main.js', 'worker.js'];
for (const f of files) {
  const p = join(dist, f);
  if (!existsSync(p)) {
    console.error(`Missing: dist/${f}`);
    process.exit(1);
  }
}

const migrateScript = join(root, 'scripts', 'migrate-prod.cjs');
if (!existsSync(migrateScript)) {
  console.error('Missing: scripts/migrate-prod.cjs');
  process.exit(1);
}

const migDir = join(dist, 'infrastructure/database/migrations');
if (!existsSync(migDir)) {
  console.error('Missing: dist/infrastructure/database/migrations/');
  process.exit(1);
}
const migrations = readdirSync(migDir).filter((item) => item.endsWith('.js'));
if (migrations.length === 0) {
  console.error('No compiled .js migrations in dist/infrastructure/database/migrations/');
  process.exit(1);
}

console.log(
  'Build outputs OK:',
  files.join(', '),
  `+ ${migrations.length} migration(s)`,
  '+ scripts/migrate-prod.cjs',
);
