import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import Redis from 'ioredis';

import { AppModule } from '../src/app.module';
import { REDIS_CLIENT } from '../src/infrastructure/redis/redis.module';
import { StripeService } from '../src/modules/billing/services/stripe.service';
import { AppExceptionFilter } from '../src/common/filters/app-exception.filter';
import { ResponseTransformInterceptor } from '../src/common/interceptors/response-transform.interceptor';
import { API_PREFIX } from '../src/shared/constants';

import { TestHttpClient, cleanDatabase, cleanRedis } from './helpers';
import { createVerifiedUser, createOrganization } from './factories';

/**
 * Billing Webhook Integration Tests
 *
 * Tests Stripe webhook handling: signature verification, idempotency,
 * event processing, and error handling.
 *
 * We mock StripeService.constructWebhookEvent to bypass Stripe's signature
 * verification timing constraints, while still testing our webhook handler logic.
 */
describe('Billing Webhooks (E2E)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let dataSource: DataSource;
  let redis: Redis;
  let http: TestHttpClient;
  let stripeService: StripeService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ rawBody: true });
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new AppExceptionFilter());
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    await app.init();

    dataSource = module.get(DataSource);
    redis = module.get<Redis>(REDIS_CLIENT);
    stripeService = module.get(StripeService);
    http = new TestHttpClient(app);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await Promise.all([cleanDatabase(dataSource), cleanRedis(redis)]);
    // Seed required plans table
    await seedPlans(dataSource);
  });

  async function seedPlans(ds: DataSource) {
    await ds.query(`
      INSERT INTO plans (id, name, price_monthly, max_members, max_projects, features)
      VALUES
        ('free', 'Free', 0, 5, 3, '{}'),
        ('pro', 'Pro', 2900, 50, 50, '{}'),
        ('enterprise', 'Enterprise', 9900, 500, 500, '{}')
      ON CONFLICT (id) DO NOTHING
    `);
  }

  /**
   * Creates a mock Stripe event and sends it via webhook with mocked signature verification.
   */
  async function sendWebhook(event: any) {
    // Mock constructWebhookEvent to return our event directly
    jest.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue(event);

    return http.post('/api/v1/billing/webhooks/stripe', event, {
      'stripe-signature': 'mocked-signature-for-testing',
    });
  }

  function createStripeEvent(type: string, data: any, eventId?: string) {
    return {
      id: eventId ?? `evt_${randomUUID().replace(/-/g, '')}`,
      type,
      data: { object: data },
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      api_version: '2024-12-18.acacia',
    };
  }

  // ─── SIGNATURE VERIFICATION ────────────────────────────────────

  describe('Webhook signature verification', () => {
    it('should reject webhook with missing signature header', async () => {
      const payload = JSON.stringify({ id: 'evt_test', type: 'test' });

      const res = await http.request('POST', '/api/v1/billing/webhooks/stripe', {
        rawBody: Buffer.from(payload),
        headers: { 'Content-Type': 'application/json' },
        // No stripe-signature header
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('WEBHOOK_SIGNATURE_INVALID');
    });

    it('should reject webhook when signature verification throws', async () => {
      jest
        .spyOn(stripeService, 'constructWebhookEvent')
        .mockImplementation(() => {
          throw new Error('Signature verification failed');
        });

      const payload = JSON.stringify({ id: 'evt_test', type: 'test' });
      const res = await http.request('POST', '/api/v1/billing/webhooks/stripe', {
        rawBody: Buffer.from(payload),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid-signature',
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('WEBHOOK_SIGNATURE_INVALID');
    });
  });

  // ─── IDEMPOTENCY ───────────────────────────────────────────────

  describe('Webhook idempotency', () => {
    it('should process the same event ID only once', async () => {
      const eventId = `evt_${randomUUID().replace(/-/g, '')}`;

      // Manually mark an event as processed
      await dataSource.query(
        `INSERT INTO processed_webhooks (stripe_event_id, event_type, processed_at)
         VALUES ($1, $2, NOW())`,
        [eventId, 'checkout.session.completed'],
      );

      // Send webhook with same event ID
      const event = createStripeEvent(
        'checkout.session.completed',
        { customer: 'cus_test', subscription: 'sub_test' },
        eventId,
      );

      const res = await sendWebhook(event);

      // Should return 201 (accepted) but not process again
      expect(res.status).toBe(201);

      // Verify only one record in processed_webhooks for this event
      const rows = await dataSource.query(
        `SELECT COUNT(*) as cnt FROM processed_webhooks WHERE stripe_event_id = $1`,
        [eventId],
      );
      expect(parseInt(rows[0].cnt)).toBe(1);
    });

    it('should handle duplicate webhook deliveries gracefully', async () => {
      const event = createStripeEvent('unknown.event.type', { some: 'data' });

      // Send same event three times (simulating Stripe retries)
      const results = await Promise.all([
        sendWebhook(event),
        sendWebhook(event),
        sendWebhook(event),
      ]);

      // All should succeed (no 500 errors from constraint violations)
      for (const res of results) {
        expect(res.status).toBeLessThan(500);
      }
    });
  });

  // ─── EVENT PROCESSING ──────────────────────────────────────────

  describe('Webhook event processing', () => {
    it('should handle unrecognized event types gracefully', async () => {
      const event = createStripeEvent('unknown.event.type', { some: 'data' });
      const res = await sendWebhook(event);
      expect(res.status).toBe(201);
    });

    it('should handle invoice.payment_failed and set grace period', async () => {
      // Set up org with a subscription
      const userA = await createVerifiedUser(dataSource, { email: 'billing@test.local' });
      const org = await createOrganization(dataSource, { createdBy: userA.user.id });

      // Insert subscription record
      await dataSource.query(
        `INSERT INTO subscriptions (id, organization_id, plan_id, status, stripe_customer_id, created_at, updated_at)
         VALUES ($1, $2, 'pro', 'active', 'cus_grace_test', NOW(), NOW())`,
        [randomUUID(), org.organization.id],
      );

      const event = createStripeEvent('invoice.payment_failed', {
        id: 'in_failed_123',
        customer: 'cus_grace_test',
        subscription: 'sub_grace_test',
      });

      const res = await sendWebhook(event);
      expect(res.status).toBe(201);

      // Verify subscription is now past_due with grace period set
      const sub = await dataSource.query(
        `SELECT status, grace_period_ends_at FROM subscriptions WHERE organization_id = $1`,
        [org.organization.id],
      );

      expect(sub[0]?.status).toBe('past_due');
      expect(sub[0]?.grace_period_ends_at).not.toBeNull();
    });

    it('should mark event as processed after successful handling', async () => {
      const eventId = `evt_${randomUUID().replace(/-/g, '')}`;
      const event = createStripeEvent('unknown.event.type', {}, eventId);

      await sendWebhook(event);

      // Should be recorded
      const rows = await dataSource.query(
        `SELECT * FROM processed_webhooks WHERE stripe_event_id = $1`,
        [eventId],
      );
      expect(rows.length).toBe(1);
      expect(rows[0].event_type).toBe('unknown.event.type');
    });
  });

  // ─── SUBSCRIPTION LIFECYCLE ────────────────────────────────────

  describe('Subscription lifecycle via webhooks', () => {
    it('should downgrade to free on subscription deletion', async () => {
      const userA = await createVerifiedUser(dataSource, { email: 'cancel@test.local' });
      const org = await createOrganization(dataSource, { createdBy: userA.user.id });

      await dataSource.query(
        `INSERT INTO subscriptions (id, organization_id, plan_id, status, stripe_customer_id, stripe_subscription_id, created_at, updated_at)
         VALUES ($1, $2, 'pro', 'active', 'cus_cancel_test', 'sub_cancel_test', NOW(), NOW())`,
        [randomUUID(), org.organization.id],
      );

      const event = createStripeEvent('customer.subscription.deleted', {
        id: 'sub_cancel_test',
        customer: 'cus_cancel_test',
        status: 'canceled',
      });

      const res = await sendWebhook(event);
      expect(res.status).toBe(201);

      // Verify downgraded to free
      const sub = await dataSource.query(
        `SELECT plan_id, status, stripe_subscription_id FROM subscriptions WHERE organization_id = $1`,
        [org.organization.id],
      );

      expect(sub[0]?.plan_id).toBe('free');
      expect(sub[0]?.status).toBe('canceled');
      expect(sub[0]?.stripe_subscription_id).toBeNull();
    });
  });
});
