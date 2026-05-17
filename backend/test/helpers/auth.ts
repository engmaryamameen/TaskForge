import { TestHttpClient } from './http';
import { DataSource } from 'typeorm';
import { createVerifiedUser, CreatedUser } from '../factories';

/**
 * Creates a user, logs them in, and returns auth headers ready for use.
 * Convenience helper for tests that need an authenticated user quickly.
 */
export async function createAuthenticatedUser(
  dataSource: DataSource,
  http: TestHttpClient,
  options: { email?: string; password?: string } = {},
): Promise<{
  user: CreatedUser;
  accessToken: string;
  refreshToken: string;
  headers: Record<string, string>;
}> {
  const password = options.password ?? 'TestPassword123!';
  const created = await createVerifiedUser(dataSource, {
    password,
    email: options.email,
  });

  const res = await http.post('/api/v1/auth/login', {
    email: created.user.email,
    password,
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed in test setup: ${JSON.stringify(res.body)}`);
  }

  const accessToken = res.body.data.accessToken;
  const refreshToken = res.body.data.refreshToken;

  return {
    user: created,
    accessToken,
    refreshToken,
    headers: { Authorization: `Bearer ${accessToken}` },
  };
}

/**
 * Returns auth + org headers for a user who is a member of the given org.
 */
export function authHeaders(
  accessToken: string,
  organizationId?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (organizationId) {
    headers['x-organization-id'] = organizationId;
  }
  return headers;
}
