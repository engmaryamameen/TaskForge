/**
 * Neon and other managed Postgres providers require TLS. Set DB_SSL=true in production.
 * If you see certificate errors in a container, try DB_SSL_REJECT_UNAUTHORIZED=false
 * (weaker; prefer fixing trust store / CA first).
 */
function isEnabled(value: string | undefined): boolean {
  if (value == null || value === '') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

/**
 * @returns `undefined` = do not set TypeORM `ssl` (local Docker Postgres).
 *          object = use TLS with the given `rejectUnauthorized` flag.
 */
export function getPostgresSslConfig():
  | undefined
  | { rejectUnauthorized: boolean } {
  if (!isEnabled(process.env.DB_SSL)) {
    return undefined;
  }
  // Default: verify server cert (works with Neon when system CAs are present).
  const rejectUnauthorized = isEnabled(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'true');
  return { rejectUnauthorized };
}
