# TaskForge

**Multi-tenant project management platform built with production-grade SaaS architecture.**

TaskForge is not a CRUD app with a database. It is a fully engineered backend system designed around the real constraints of multi-tenant SaaS: tenant isolation, subscription enforcement, horizontal scalability, and operational safety.

---

## Why TaskForge Exists

Most project management tools start as a CRUD app and bolt on multi-tenancy, billing, and realtime features as afterthoughts. The result is systems where tenant isolation depends on remembering to add `WHERE org_id = ?` to every query, billing enforcement is checked in random controller methods, and scaling means rewriting the foundation.

TaskForge inverts this. It starts from the constraints:

- **Tenant isolation is structural.** A guard chain enforces organization scoping at the request boundary before any business logic runs. You cannot accidentally write a cross-tenant query because services never see raw tenant IDs from user input.
- **Billing is a system primitive, not a feature.** Entitlements are computed from plan + live usage counters, cached with version keys, and enforced via atomic database operations. The billing system is the entitlement system — not a Stripe wrapper with a few `if` checks.
- **Realtime and async processing are first-class.** Domain events flow through an event bus to both WebSocket broadcasts and a persistent audit trail via background workers. This isn't WebSocket bolted onto REST — it's event-driven architecture where REST, WebSocket, and background processing are consumers of the same event stream.

The result is a system where complexity exists because the problem demands it, not because the code grew organically.

---

## System in 30 Seconds

A user creates a task. The request hits Nginx, which injects a request ID and proxies to the API. Four guards execute in sequence: rate limiting (Redis-backed), JWT verification, organization membership validation (3-tier cache), and role check. The task is written to PostgreSQL. A domain event fires synchronously to the event bus. Two things happen in parallel: the realtime listener broadcasts `task:created` to all org members via WebSocket, and the activity listener enqueues the event to BullMQ. The worker process (separate container) picks up the job, writes an immutable audit log entry, and the request has already returned to the client. Total synchronous path: ~15ms. Audit persistence: ~100ms async.

```
Request → Nginx → API Guard Chain → Service → PostgreSQL (write)
                                        │
                                        ▼
                                  Domain Event Bus
                                   │           │
                                   ▼           ▼
                              BullMQ       WebSocket
                              Queue       Broadcast
                                │         (instant)
                                ▼
                             Worker
                          (async audit
                           log → DB)
```

---

## Architecture

### Runtime Architecture

```
                    Stripe                          Clients
                  (webhooks)                       (browser)
                      │                               │
                      ▼                               ▼
              ┌──────────────────────────────────────────────────┐
              │                    Nginx                         │
              │   (reverse proxy, X-Request-ID, security hdrs)  │
              └────────────┬──────────────┬─────────────────────┘
                           │              │
                      HTTP /api/    WebSocket /socket.io/
                           │              │
              ┌────────────▼──────────────▼─────────────────────┐
              │                  NestJS API                      │
              │                                                  │
              │  Request Flow:                                   │
              │  Throttler → JWT → OrgMembership → Roles         │
              │       │                                          │
              │       ▼                                          │
              │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
              │  │  Auth    │  │  Orgs    │  │   Billing     │  │
              │  │ (argon2  │  │ (tenant  │  │  (Stripe +    │  │
              │  │  + JWT   │  │  scoping)│  │  entitlements) │  │
              │  │  + token │  │          │  │               │  │
              │  │  rotate) │  │          │  │               │  │
              │  └──────────┘  └──────────┘  └───────────────┘  │
              │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
              │  │ Projects │  │  Tasks   │  │   Realtime    │  │
              │  │          │  │          │  │  (Socket.io   │  │
              │  │          │  │          │  │   rooms)      │  │
              │  └──────────┘  └──────────┘  └───────────────┘  │
              │       │                             ▲            │
              │       ▼                             │            │
              │  ┌─────────────────────────────────────────┐    │
              │  │          Domain Event Bus                │    │
              │  │  (NestJS EventEmitter — wildcard events) │    │
              │  └──────┬──────────────────┬───────────────┘    │
              │         │                  │                     │
              └─────────┼──────────────────┼─────────────────────┘
                        │                  │
                        ▼                  ▼
              ┌──────────────┐   ┌──────────────────┐
              │  PostgreSQL  │   │      Redis        │
              │              │   │                   │
              │  - users     │   │  Cache:           │
              │  - orgs      │   │   user sessions   │
              │  - tasks     │   │   memberships     │
              │  - projects  │   │   entitlements    │
              │  - activity  │   │                   │
              │  - billing   │   │  Rate Limiting:   │
              │  - webhooks  │   │   per-user/IP     │
              │              │   │                   │
              └──────────────┘   │  Job Queues:      │
                                 │   activity queue  │
                                 │   notifications   │
                                 └────────┬──────────┘
                                          │
                                   ┌──────▼──────┐
                                   │   BullMQ    │
                                   │   Worker    │
                                   │  (separate  │
                                   │   process)  │
                                   │             │
                                   │  activity   │
                                   │  logging    │
                                   │  → DB write │
                                   └─────────────┘
```

### Event Flow Architecture

```
  Service Mutation (task.create, project.update, etc.)
         │
         ▼
  EventEmitter.emit('task.created', DomainEvent)
         │
         ├──────────────────────────┐
         ▼                          ▼
  ActivityListener            RealtimeListener
  (enqueue to BullMQ)        (broadcast via Socket.io)
         │                          │
         ▼                          ▼
  ┌─────────────┐           ┌──────────────┐
  │ Redis Queue │           │  org:{orgId} │
  │ (persisted) │           │  WebSocket   │
  └──────┬──────┘           │  room        │
         │                  └──────────────┘
         ▼
  ┌─────────────┐
  │   Worker    │
  │  Process    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐       ┌──────────────────────┐
  │  Activity   │       │  Billing Listener     │
  │  Table      │       │  (subscription events │
  │  (immutable │       │   → Stripe sync)      │
  │   audit)    │       └──────────────────────┘
  └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js 20 + NestJS 11 | Modular DI framework, TypeScript-first, production battle-tested |
| **Database** | PostgreSQL 16 + TypeORM | ACID transactions, JSONB for flexible fields, mature migration system |
| **Cache & Pub/Sub** | Redis 7 + ioredis | Sub-millisecond reads, rate limiting storage, BullMQ backing store |
| **Auth** | JWT + argon2 + refresh token rotation | Stateless auth with secure token lifecycle |
| **Background Jobs** | BullMQ | Redis-backed, retries with exponential backoff, concurrency control |
| **Realtime** | Socket.io via NestJS WebSocket gateway | Room-based broadcasting, JWT-authenticated connections |
| **Billing** | Stripe SDK v22 | Webhook-driven subscription lifecycle, idempotent event processing |
| **Logging** | Pino via nestjs-pino | Structured JSON in production, request ID correlation |
| **Validation** | class-validator + Joi | DTO validation at request boundary, env validation at startup |
| **Container** | Docker (multi-stage) + Docker Compose | Reproducible builds, non-root user, layer-cached dependencies |
| **CI/CD** | GitHub Actions → GHCR | 4-stage pipeline: lint → test → build → docker push |
| **Proxy** | Nginx | WebSocket upgrade, request ID injection, security headers |

---

## Key Features

### Multi-Tenancy
- Organization-scoped data isolation enforced at the guard layer, not sprinkled across queries
- 4-guard chain executes on every request: `Throttler → JWT → OrgMembership → Roles`
- Membership lookup uses a 3-tier cache: request-level → Redis (5 min) → database
- Role-based access control: `admin` | `member` per organization

### Authentication
- Argon2 password hashing (memory-hard, resistant to GPU attacks)
- JWT access tokens (15 min) + refresh token rotation (7 day family chains)
- Refresh token theft detection via family ID revocation
- User object cached in Redis to avoid DB lookup on every authenticated request

### Billing & Subscriptions
- Stripe-driven subscription lifecycle (free → pro → enterprise)
- Entitlements computed from plan + live usage, cached with version key
- Usage enforcement via atomic `UPDATE ... WHERE count < limit` (no race conditions)
- Webhook idempotency: every Stripe event ID stored in `ProcessedWebhook` table
- 7-day grace period on payment failures before downgrade

### Background Processing
- BullMQ worker runs as a separate process (same Docker image, different entrypoint)
- Activity queue: concurrency 5, exponential backoff (1s base), 3 retry attempts
- Domain events flow: service → event emitter → listener → queue → worker → activity table
- Worker is stateless and horizontally scalable

### Realtime
- JWT-authenticated WebSocket connections with room-based broadcasting
- Rooms: `user:{id}` (personal), `org:{id}` (team)
- Events: project/task CRUD mutations broadcast to org members
- Membership validated before joining org rooms

### Audit Trail
- Every mutation emits a `DomainEvent` with: type, entity, payload, triggeredBy, organizationId
- Async persistence via BullMQ (non-blocking to the request path)
- Immutable activity log with JSONB payload for flexible querying
- Paginated query API with event type and date range filters

### Infrastructure
- Multi-stage Docker build: build deps → compile → production image (alpine, non-root)
- Migration isolation: dedicated one-shot container runs before API starts
- Health endpoint checks DB + Redis connectivity (`@nestjs/terminus`)
- Graceful shutdown: SIGTERM drains BullMQ jobs, closes Redis, completes in-flight requests
- Config validation: Joi schema crashes app at startup if critical env vars are missing

---

## Design Principles

These are the rules the codebase enforces structurally, not by convention:

1. **Tenant isolation is a request boundary concern.** Organization scoping is enforced once at the guard layer. Services never accept `organizationId` as a parameter from user input — they read it from the validated request context. A developer cannot accidentally write a cross-tenant query.

2. **Every write is auditable.** All mutations emit domain events. The activity trail is not opt-in — it is a structural side effect of using the event bus. Skipping audit logging requires actively removing the listener, not forgetting to add it.

3. **Workers are stateless by design.** The BullMQ worker holds no in-memory state between jobs. Any worker instance can process any job. Scaling is horizontal: add more worker containers, BullMQ distributes automatically.

4. **Failures are isolated, not cascading.** Redis failure degrades rate limiting and cache (requests still hit the DB). Worker failure pauses async processing (API keeps serving). Database slowness triggers health check failure (new traffic is rejected, not queued). No single failure takes down the entire system.

5. **Configuration is validated, not assumed.** The app refuses to start if critical environment variables are missing or malformed. There is no "partially configured" runtime state.

6. **Billing is enforcement, not decoration.** Usage limits are checked via atomic database operations at write time, not after the fact. A user cannot exceed plan limits even under concurrent requests.

---

## Security Model

The system operates on a zero-trust-the-client principle:

- **Frontend is untrusted.** Organization IDs in request headers are validated against the user's actual membership in the database (cached, but never assumed). A user cannot access an organization by guessing its ID.
- **Tenant isolation is enforced at the guard layer, not the query layer.** Services receive `organizationId` from the request context (set by `OrgMembershipGuard`), never from raw user input. There is no way to call a service method with an arbitrary org ID.
- **Passwords never leave the auth boundary.** Argon2 hashing happens at registration/login only. Tokens are stateless — the API never stores or logs plaintext credentials.
- **Refresh tokens are hashed at rest.** The database stores SHA-256 hashes, not raw tokens. Token theft from a database breach does not grant session access.
- **Stripe webhooks are signature-verified.** Raw request body + HMAC validation ensures webhook payloads are from Stripe, not forged. Every event is idempotently tracked to prevent replay.
- **Rate limiting is per-identity, not per-IP.** Authenticated users are rate-limited by `userId`, preventing legitimate users behind shared NATs from being penalized. Public endpoints (login, register) fall back to IP-based limiting — this doubles as brute force protection on auth endpoints.
- **Services enforce their own data boundaries.** A service method never accepts a raw `organizationId` parameter from a controller. It reads from the request context, which was validated by the guard. Even if a new endpoint is added without proper decorators, the global guard chain still executes.

---

## System Design Decisions

### Why organization-scoped guards instead of query-level filtering?

Query-level filtering (`WHERE org_id = ?` in every query) is fragile — one missed filter leaks data across tenants. Instead, the `OrgMembershipGuard` validates tenant access once at the request boundary and attaches `organizationId` to the request context. Services read it from context, never from user input. This makes tenant isolation a structural guarantee, not a per-query discipline.

### Why a separate worker process instead of in-process BullMQ?

In-process workers couple job throughput to API throughput. A notification spike would compete with HTTP request handling for CPU and memory. Separate processes allow independent scaling: 3 API replicas + 10 workers, or vice versa. The worker uses `NestFactory.createApplicationContext()` — no HTTP server, no guards, no WebSocket overhead. Same Docker image, different `CMD`.

### Why refresh token rotation with family chains?

A single long-lived token is a theft vector. Token rotation means each refresh token is single-use — after refresh, the old token is immediately revoked. Family IDs link tokens in a rotation chain. If a revoked token is replayed (indicating theft), the entire family can be invalidated. This balances UX (7-day sessions) with security (token reuse detection).

### Why Joi for env validation instead of class-validator?

class-validator is already used for DTO validation, but environment config has different semantics: string-to-number coercion, environment-conditional rules (`STRIPE_KEY` required only in production), and default values. Joi's `.when()` operator handles this natively. NestJS ConfigModule has first-class `validationSchema` support for Joi — zero custom plumbing. Using both avoids mixing two different validation concerns in one system.

### Why atomic usage counting instead of derived counts?

`SELECT COUNT(*) FROM projects WHERE org_id = ?` on every entitlement check doesn't scale. Instead, `OrganizationUsage` maintains atomic counters updated via `UPDATE ... SET count = count + 1 WHERE count < limit`. This is a single-row conditional update — it enforces limits and updates counts in one atomic operation, eliminating race conditions where two requests simultaneously create the Nth project.

### Why migration isolation in Docker instead of app-startup migrations?

Running migrations in `onModuleInit` means every API replica attempts migrations on startup. With 3 replicas, you get 3 concurrent migration attempts — a race condition that causes schema corruption. A dedicated migration container (`restart: "no"`, `depends_on: postgres: service_healthy`) runs once, exits, and the API starts only after `service_completed_successfully`.

---

## Scaling Considerations

### Current architecture supports vertical scaling to ~10K concurrent users without changes.

### To reach ~100K users:
- **Database**: Add read replicas. TypeORM supports read/write splitting. Task queries (the hottest path) hit replicas; writes stay on primary.
- **Redis**: Single Redis handles ~100K ops/sec. No change needed yet.
- **WebSocket**: Add `@socket.io/redis-adapter` for cross-process message broadcasting. Without it, users connected to different API replicas won't receive each other's events.
- **Workers**: Scale horizontally. BullMQ distributes jobs across worker instances automatically. Current concurrency (5) is per-worker — 10 workers = 50 concurrent job processors.

### To reach ~1M users:
- **Database**: Partition the `tasks` and `activity` tables by `organization_id`. These are the highest-cardinality tables and benefit most from partition pruning. Consider connection pooling via PgBouncer.
- **Cache**: Move from single Redis to Redis Cluster. Shard rate limiting keys and cache keys across nodes.
- **API**: Stateless by design — scale horizontally behind a load balancer. The 3-tier membership cache prevents DB connection pressure from scaling API replicas.
- **Queue**: Separate queues per job type (activity, notifications, billing). Add dead-letter queues for exhausted retries. Consider priority lanes for time-sensitive jobs (webhook processing > activity logging).
- **Multi-region**: The architecture is region-ready. PostgreSQL streaming replication to read-heavy regions. Redis Cluster per region. WebSocket connections pinned to the nearest edge.
- **What breaks first**: The `activity` table. It's append-only with no archival strategy. At ~1M users generating 50 events/day each, that's ~50M rows/month. Solution: time-based partitioning + cold storage archival to S3.

### Bottleneck order under load:

1. **Activity table** — append-only, no archival. First to cause disk/index pressure.
2. **WebSocket fanout** — single-process Socket.io can't broadcast across replicas without Redis adapter.
3. **Database write contention** — task creation under high concurrency hits row-level locks on usage counters.
4. **Redis memory** — rate limiting keys + cache + BullMQ job data grow with traffic.

### Scaling order of operations (what you change first):

1. Add `@socket.io/redis-adapter` — unblocks horizontal API scaling (currently the ceiling)
2. Add PostgreSQL read replicas — offloads task/activity queries (highest read volume)
3. Partition `activity` table by month — prevents index degradation on the fastest-growing table
4. Separate BullMQ queues per job type — isolates webhook processing latency from audit logging
5. Move to Redis Cluster — only needed when single Redis approaches memory/ops limits

---

## Failure Modes & System Behavior

| Failure | System Behavior | Recovery |
|---------|----------------|----------|
| **Redis down** | Rate limiting degrades (requests pass through). Cache misses hit DB directly. BullMQ jobs queue in memory briefly. | Redis reconnects automatically via ioredis retry. Cached data repopulates on next request. |
| **Worker down** | Jobs accumulate in Redis queue. No data loss — BullMQ persists jobs. API continues serving requests normally. | Worker restart drains backlog. Jobs retry with exponential backoff (3 attempts). |
| **Database slow** | API requests timeout at the connection level. Health check reports unhealthy. New requests fail fast. | Connection pool recovers when DB returns. No cascading failure — Redis cache absorbs read load during recovery. |
| **Stripe webhook fails** | Stripe retries delivery (up to 3 days). Idempotency key in `ProcessedWebhook` prevents duplicate processing on retry. | No manual intervention needed. Subscription state eventually consistent. |
| **Migration fails in Docker** | `migrate` container exits non-zero. `api` and `worker` never start (`service_completed_successfully` not met). | Fix migration, rebuild, redeploy. System stays on previous version until migration succeeds. |
| **Config missing at startup** | Joi validation fails. App crashes immediately with all missing variables listed. | Intentional fail-fast. No partial startup with broken config. |
| **Refresh token replayed** | Token already revoked — request rejected. Entire token family can be invalidated (theft detection). | User must re-authenticate. Legitimate sessions on other devices unaffected (different family). |

---

## Engineering Tradeoffs

These are deliberate choices with known costs:

| Decision | What we gained | What it costs |
|----------|---------------|---------------|
| **Event-driven audit trail via BullMQ** | Non-blocking request path. Audit logs don't slow down API responses. Worker scales independently. | Eventual consistency — activity logs appear ~100ms after the mutation, not instantly. Adds Redis as a hard dependency. |
| **Atomic Redis counters for usage** instead of `COUNT(*)` queries | O(1) enforcement checks. No table scans on every entitlement check. Race-condition-free limit enforcement. | Counters can drift if a bug skips decrement. Requires periodic reconciliation against source tables. |
| **BullMQ over Kafka** | Simple setup, Redis-backed (already in stack), excellent NestJS integration, sufficient for current throughput. | No consumer groups, no replay, no cross-service event streaming. Would need replacement at ~10K events/sec. |
| **TypeORM over Prisma** | Mature migration system, decorator-based entities align with NestJS patterns, `QueryBuilder` for complex queries. | Heavier ORM with more runtime overhead. Migration generation can be unpredictable. No type-safe query builder. |
| **Monolith over microservices** | Single deployable unit. Shared types. No network overhead between modules. Simple local development. | All modules scale together. A billing webhook spike scales the entire API, not just billing. |
| **JWT over sessions** | Stateless API servers. No session store to scale. Horizontal scaling without sticky sessions. | Token revocation requires Redis check (not truly stateless). Token size larger than session ID. |
| **Soft deletes on projects/tasks** | Data recovery possible. Audit trail preserved. No cascade deletion surprises. | Table bloat over time. Queries must filter `deletedAt IS NULL` (handled by TypeORM automatically, but indexes include soft-deleted rows). |

---

## Project Structure

```
TaskForge/
├── backend/
│   ├── src/
│   │   ├── common/              # Guards, filters, interceptors, decorators, middleware
│   │   ├── config/              # Environment config factories + Joi validation
│   │   ├── infrastructure/
│   │   │   ├── database/        # TypeORM config, migrations
│   │   │   ├── redis/           # Redis client, shutdown service
│   │   │   ├── cache/           # Redis cache service (get/set/del)
│   │   │   └── queue/           # BullMQ producer + worker modules
│   │   ├── modules/
│   │   │   ├── auth/            # JWT, refresh tokens, registration, login
│   │   │   ├── users/           # User management
│   │   │   ├── organizations/   # Multi-tenant orgs, memberships, invites
│   │   │   ├── projects/        # Project CRUD (soft delete)
│   │   │   ├── tasks/           # Task CRUD (soft delete, multi-index)
│   │   │   ├── activity/        # Audit logging, domain event persistence
│   │   │   ├── realtime/        # WebSocket gateway, room management
│   │   │   ├── billing/         # Stripe subscriptions, entitlements, webhooks
│   │   │   └── health/          # Terminus health checks (DB + Redis)
│   │   ├── shared/              # Constants, DTOs, enums, interfaces, errors
│   │   ├── main.ts              # API entrypoint
│   │   ├── worker.ts            # Worker entrypoint (no HTTP)
│   │   └── run-migrations.ts    # Standalone migration runner for Docker
│   ├── Dockerfile               # Multi-stage build (builder → alpine prod)
│   └── .env.example
├── nginx/
│   └── nginx.conf               # Reverse proxy + WebSocket + request ID
├── scripts/
│   ├── deploy.sh                # Versioned deploy by git sha
│   └── rollback.sh              # Revert to previous version
├── .github/workflows/
│   └── ci.yml                   # 4-job pipeline: lint → test → build → docker
├── docker-compose.yml           # Dev (builds from source)
└── docker-compose.prod.yml      # Prod simulation (pulls from GHCR)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized setup)

### Local Development

```bash
# Clone and install
git clone https://github.com/engmaryamameen/TaskForge.git
cd TaskForge/backend
cp .env.example .env    # Edit with your local DB/Redis credentials
npm install

# Run migrations
npm run migration:run

# Start API (dev mode with hot reload)
npm run start:dev

# Start worker (separate terminal)
npm run start:worker:dev
```

### Docker (Full Stack)

```bash
# Development — builds from source
docker compose up

# Production simulation — pulls from GHCR
cp .env.production.example .env.production   # Edit with real values
./scripts/deploy.sh latest
```

### API Health Check

```bash
curl http://localhost:3000/api/v1/health
# {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}}}
```

---

## CI/CD Pipeline

```
Push to main
    │
    ├─► quality (lint + npm audit)
    ├─► test (unit tests with Postgres + Redis service containers)
    │
    └─► build (compile + verify outputs)
            │
            └─► docker (build image + push to GHCR + validate compose)
```

- **PRs**: build and test only (no push)
- **Main merges**: build, test, push to `ghcr.io/engmaryamameen/taskforge-backend`
- **Image tags**: `sha-<7char>` + `latest`
- **Deploy**: `./scripts/deploy.sh sha-abc1234`
- **Rollback**: `./scripts/rollback.sh`

---

## Future Improvements

| Area | Improvement | Impact |
|------|-------------|--------|
| **Observability** | Prometheus metrics + Grafana dashboards | Request latency, error rates, queue depth visibility |
| **Error tracking** | Sentry integration | Aggregated error reporting with stack traces |
| **WebSocket scaling** | Redis adapter for Socket.io | Cross-replica event broadcasting |
| **Database** | Read replicas + connection pooling (PgBouncer) | Read throughput for task queries |
| **Search** | Elasticsearch for task full-text search | Sub-100ms search across millions of tasks |
| **Notifications** | Email/Slack notification workers | Assignment alerts, deadline reminders |
| **Frontend** | Next.js dashboard | Complete SaaS product surface |
| **Auth** | OAuth2 (Google/GitHub) + MFA | Enterprise SSO requirements |
| **Activity** | Time-based partitioning + S3 archival | Prevents unbounded table growth |
| **Worker readiness** | Redis key-based health signal | Replaces log-based startup detection in deploy script |
