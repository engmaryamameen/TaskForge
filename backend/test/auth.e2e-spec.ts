import { createHash, randomBytes } from 'crypto';
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
  createUnverifiedUser,
  createOrganization,
} from './factories';
import { EmailVerificationToken } from '../src/modules/auth/entities/email-verification-token.entity';
import { RefreshToken } from '../src/modules/auth/entities/refresh-token.entity';

describe('Auth Flow (E2E)', () => {
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

  // ─── REGISTRATION ──────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return verification prompt', async () => {
      const res = await http.post('/api/v1/auth/register', {
        email: 'new@test.local',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.nextStep).toBe('VERIFY_EMAIL');
      expect(res.body.data.email).toBe('new@test.local');
    });

    it('should reject duplicate email registration', async () => {
      await createVerifiedUser(ctx.dataSource, { email: 'taken@test.local' });

      const res = await http.post('/api/v1/auth/register', {
        email: 'taken@test.local',
        password: 'SecurePass123!',
        firstName: 'Dup',
        lastName: 'User',
      });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject weak passwords (under 8 chars)', async () => {
      const res = await http.post('/api/v1/auth/register', {
        email: 'weak@test.local',
        password: 'short',
        firstName: 'Weak',
        lastName: 'Pass',
      });

      expect(res.status).toBe(400);
    });

    it('should reject unknown fields (mass-assignment protection)', async () => {
      const res = await http.post('/api/v1/auth/register', {
        email: 'hack@test.local',
        password: 'SecurePass123!',
        firstName: 'Hack',
        lastName: 'Er',
        role: 'admin',
        status: 'active',
      });

      expect(res.status).toBe(400);
    });

    it('should normalize email to lowercase', async () => {
      const res = await http.post('/api/v1/auth/register', {
        email: 'UPPER@Test.LOCAL',
        password: 'SecurePass123!',
        firstName: 'Case',
        lastName: 'Test',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('upper@test.local');
    });
  });

  // ─── EMAIL VERIFICATION ────────────────────────────────────────

  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify email and return tokens + user', async () => {
      // Create unverified user and manually insert verification token
      const { user } = await createUnverifiedUser(ctx.dataSource, {
        email: 'verify@test.local',
      });

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');

      await ctx.dataSource.getRepository(EmailVerificationToken).save({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const res = await http.post('/api/v1/auth/verify-email', {
        token: rawToken,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('verify@test.local');
    });

    it('should reject expired verification token', async () => {
      const { user } = await createUnverifiedUser(ctx.dataSource);

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');

      await ctx.dataSource.getRepository(EmailVerificationToken).save({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      const res = await http.post('/api/v1/auth/verify-email', {
        token: rawToken,
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VERIFICATION_TOKEN_EXPIRED');
    });

    it('should reject invalid verification token', async () => {
      const res = await http.post('/api/v1/auth/verify-email', {
        token: 'invalid-token-that-does-not-exist',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VERIFICATION_TOKEN_INVALID');
    });

    it('should create default workspace on first verification', async () => {
      const { user } = await createUnverifiedUser(ctx.dataSource, {
        email: 'workspace@test.local',
        firstName: 'Alice',
      });

      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');

      await ctx.dataSource.getRepository(EmailVerificationToken).save({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const res = await http.post('/api/v1/auth/verify-email', {
        token: rawToken,
      });

      expect(res.status).toBe(201);

      // User should now have a currentOrganizationId
      const meRes = await http.get('/api/v1/auth/me', {
        Authorization: `Bearer ${res.body.data.accessToken}`,
      });
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.currentOrganizationId).toBeDefined();
    });
  });

  // ─── LOGIN ─────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should login verified user and return tokens', async () => {
      const { user, password } = await createVerifiedUser(ctx.dataSource, {
        email: 'login@test.local',
      });

      const res = await http.post('/api/v1/auth/login', {
        email: 'login@test.local',
        password,
      });

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@test.local');
      // Never expose passwordHash
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      await createVerifiedUser(ctx.dataSource, { email: 'wrong@test.local' });

      const res = await http.post('/api/v1/auth/login', {
        email: 'wrong@test.local',
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with non-existent email', async () => {
      const res = await http.post('/api/v1/auth/login', {
        email: 'nobody@test.local',
        password: 'SomePassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for unverified user', async () => {
      const { user, password } = await createUnverifiedUser(ctx.dataSource, {
        email: 'unverified@test.local',
      });

      const res = await http.post('/api/v1/auth/login', {
        email: 'unverified@test.local',
        password,
      });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('should reject login for suspended user', async () => {
      const { user, password } = await createVerifiedUser(ctx.dataSource, {
        email: 'suspended@test.local',
        status: 'suspended',
      });

      const res = await http.post('/api/v1/auth/login', {
        email: 'suspended@test.local',
        password,
      });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('ACCOUNT_SUSPENDED');
    });

    it('should be case-insensitive on email', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'case@test.local',
      });

      const res = await http.post('/api/v1/auth/login', {
        email: 'CASE@Test.LOCAL',
        password,
      });

      expect(res.status).toBe(201);
    });
  });

  // ─── REFRESH TOKEN ROTATION ────────────────────────────────────

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new token pair and rotate refresh token', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'refresh@test.local',
      });

      // Login to get initial tokens
      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'refresh@test.local',
        password,
      });
      const { refreshToken: oldRefreshToken } = loginRes.body.data;

      // Use refresh token
      const refreshRes = await http.post('/api/v1/auth/refresh', {
        refreshToken: oldRefreshToken,
      });

      expect(refreshRes.status).toBe(201);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
      // New tokens should differ from old ones
      expect(refreshRes.body.data.refreshToken).not.toBe(oldRefreshToken);
    });

    it('should reject reuse of already-rotated refresh token', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'reuse@test.local',
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'reuse@test.local',
        password,
      });
      const { refreshToken } = loginRes.body.data;

      // First refresh — succeeds and revokes old token
      const firstRefresh = await http.post('/api/v1/auth/refresh', {
        refreshToken,
      });
      expect(firstRefresh.status).toBe(201);

      // Second refresh with same token — should fail (already revoked)
      const secondRefresh = await http.post('/api/v1/auth/refresh', {
        refreshToken,
      });
      expect(secondRefresh.status).toBe(401);
      expect(secondRefresh.body.error.code).toBe('REFRESH_TOKEN_INVALID');
    });

    it('should reject expired refresh token', async () => {
      const { user } = await createVerifiedUser(ctx.dataSource);

      // Manually insert an expired refresh token
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      await ctx.dataSource.getRepository(RefreshToken).save({
        userId: user.id,
        tokenHash,
        familyId: crypto.randomUUID(),
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      const res = await http.post('/api/v1/auth/refresh', {
        refreshToken: rawToken,
      });

      expect(res.status).toBe(401);
    });

    it('should reject refresh for suspended user', async () => {
      const { user, password } = await createVerifiedUser(ctx.dataSource, {
        email: 'suspend-refresh@test.local',
      });

      // Login while active
      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'suspend-refresh@test.local',
        password,
      });

      // Suspend user after login
      await ctx.dataSource.getRepository('User').update(user.id, {
        status: 'suspended',
      });

      const res = await http.post('/api/v1/auth/refresh', {
        refreshToken: loginRes.body.data.refreshToken,
      });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('ACCOUNT_SUSPENDED');
    });

    it('should preserve token family across rotations', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'family@test.local',
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'family@test.local',
        password,
      });

      // Rotate multiple times
      let currentRefresh = loginRes.body.data.refreshToken;
      for (let i = 0; i < 3; i++) {
        const res = await http.post('/api/v1/auth/refresh', {
          refreshToken: currentRefresh,
        });
        expect(res.status).toBe(201);
        currentRefresh = res.body.data.refreshToken;
      }

      // All tokens in the chain should share a familyId
      const tokens = await ctx.dataSource
        .getRepository(RefreshToken)
        .find({ order: { createdAt: 'ASC' } });

      const families = new Set(tokens.map((t) => t.familyId));
      expect(families.size).toBe(1);
    });
  });

  // ─── LOGOUT ────────────────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('should revoke refresh token on logout', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'logout@test.local',
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'logout@test.local',
        password,
      });
      const { accessToken, refreshToken } = loginRes.body.data;

      // Logout
      const logoutRes = await http.post(
        '/api/v1/auth/logout',
        { refreshToken },
        { Authorization: `Bearer ${accessToken}` },
      );
      expect(logoutRes.status).toBe(201);

      // Refresh token should no longer work
      const refreshRes = await http.post('/api/v1/auth/refresh', {
        refreshToken,
      });
      expect(refreshRes.status).toBe(401);
    });

    it('should succeed silently even with invalid refresh token', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'logout-safe@test.local',
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'logout-safe@test.local',
        password,
      });

      const logoutRes = await http.post(
        '/api/v1/auth/logout',
        { refreshToken: 'completely-invalid-token' },
        { Authorization: `Bearer ${loginRes.body.data.accessToken}` },
      );

      // Should not reveal whether token was valid
      expect(logoutRes.status).toBe(201);
    });
  });

  // ─── PROTECTED ROUTES ──────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const { password } = await createVerifiedUser(ctx.dataSource, {
        email: 'me@test.local',
        firstName: 'Me',
        lastName: 'Test',
      });

      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'me@test.local',
        password,
      });

      const meRes = await http.get('/api/v1/auth/me', {
        Authorization: `Bearer ${loginRes.body.data.accessToken}`,
      });

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe('me@test.local');
      expect(meRes.body.data.user.firstName).toBe('Me');
    });

    it('should reject request without token', async () => {
      const res = await http.get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject request with malformed token', async () => {
      const res = await http.get('/api/v1/auth/me', {
        Authorization: 'Bearer not.a.valid.jwt.token',
      });
      expect(res.status).toBe(401);
    });
  });

  // ─── PASSWORD RESET ────────────────────────────────────────────

  describe('Password reset flow', () => {
    it('should complete full reset: forgot → reset → login with new password', async () => {
      const { user, password: oldPassword } = await createVerifiedUser(ctx.dataSource, {
        email: 'reset@test.local',
      });

      // Request reset (always returns success regardless of email existence)
      const forgotRes = await http.post('/api/v1/auth/forgot-password', {
        email: 'reset@test.local',
      });
      expect(forgotRes.status).toBe(201);

      // Get token from DB (in real flow this comes via email)
      const resetTokenRepo = ctx.dataSource.getRepository('PasswordResetToken');
      const tokenRow = await resetTokenRepo.findOne({ where: { userId: user.id } });
      expect(tokenRow).not.toBeNull();

      // We need the raw token, but only the hash is stored.
      // For testing, create a known token directly.
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');

      await resetTokenRepo.save({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      // Reset password
      const resetRes = await http.post('/api/v1/auth/reset-password', {
        token: rawToken,
        password: 'NewSecurePass456!',
      });
      expect(resetRes.status).toBe(201);

      // Old password should no longer work
      const oldLoginRes = await http.post('/api/v1/auth/login', {
        email: 'reset@test.local',
        password: oldPassword,
      });
      expect(oldLoginRes.status).toBe(401);

      // New password should work
      const newLoginRes = await http.post('/api/v1/auth/login', {
        email: 'reset@test.local',
        password: 'NewSecurePass456!',
      });
      expect(newLoginRes.status).toBe(201);
    });

    it('should revoke all refresh tokens on password reset', async () => {
      const { user, password } = await createVerifiedUser(ctx.dataSource, {
        email: 'revoke-on-reset@test.local',
      });

      // Login to create a refresh token
      const loginRes = await http.post('/api/v1/auth/login', {
        email: 'revoke-on-reset@test.local',
        password,
      });
      const { refreshToken } = loginRes.body.data;

      // Reset password
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken, 'utf8').digest('hex');
      await ctx.dataSource.getRepository('PasswordResetToken').save({
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await http.post('/api/v1/auth/reset-password', {
        token: rawToken,
        password: 'BrandNew789!',
      });

      // Old refresh token should be revoked
      const refreshRes = await http.post('/api/v1/auth/refresh', {
        refreshToken,
      });
      expect(refreshRes.status).toBe(401);
    });

    it('should not reveal whether email exists (forgot-password)', async () => {
      const res = await http.post('/api/v1/auth/forgot-password', {
        email: 'nonexistent@test.local',
      });

      expect(res.status).toBe(201);
      // Same generic message whether or not user exists
      expect(res.body.data.message).toContain('If an account exists');
    });
  });
});
