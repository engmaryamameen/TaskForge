import * as path from 'path';
import * as fs from 'fs';

/**
 * Load .env.test into process.env before tests run.
 * This ensures the test environment variables are available
 * for both the global setup (DB creation) and the app bootstrap.
 */
const envPath = path.resolve(__dirname, '../../.env.test');
const envContent = fs.readFileSync(envPath, 'utf-8');

for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=');
  if (key && !process.env[key]) {
    process.env[key] = value;
  }
}
