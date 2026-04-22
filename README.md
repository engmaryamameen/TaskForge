# TaskForge

**Multi-tenant project management platform built with production-grade SaaS architecture.**

TaskForge is not a CRUD app with a database. It is a fully engineered backend system designed around the real constraints of multi-tenant SaaS: tenant isolation, subscription enforcement, horizontal scalability, and operational safety.

---

## Architecture

```
                              ┌─────────────┐
                              │   Nginx      │
                              │  (reverse    │
                              │   proxy)     │
                              └──────┬───────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                 │
               HTTP /api/      WebSocket          /health
                    │          /socket.io/             │
                    ▼                ▼                 ▼
              ┌──────────────────────────────────────────┐
              │              NestJS API                   │
              │                                          │
              │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │
              │  │  Auth    │ │  Billing │ │  Realtime │ │
              │  │  (JWT +  │ │  (Stripe)│ │(Socket.io)│ │
              │  │  argon2) │ │          │ │           │ │
              │  └─────────┘ └──────────┘ └───────────┘ │
              │  ┌─────────┐ ┌──────────┐ ┌───────────┐ │
              │  │  Orgs   │ │ Projects │ │   Tasks   │ │
              │  │  (multi │ │          │ │           │ │
              │  │  tenant)│ │          │ │           │ │
              │  └─────────┘ └──────────┘ └───────────┘ │
              │                                          │
              │  Guards: Throttler → JWT → OrgScope → Roles │
              └────────────┬──────────────┬──────────────┘
                           │              │
                    ┌──────▼──────┐ ┌─────▼──────┐
                    │ PostgreSQL  │ │   Redis     │
                    │             │ │ (cache +    │
                    │  - users    │ │  sessions + │
                    │  - orgs     │ │  rate limit │
                    │  - tasks    │ │  + queues)  │
                    │  - billing  │ │             │
                    │  - activity │ │             │
                    └─────────────┘ └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │   BullMQ    │
                                    │   Worker    │
                                    │             │
                                    │ - activity  │
                                    │   logging   │
                                    │ - async     │
                                    │   events    │
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
