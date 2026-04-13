# TaskForge — System Design

## 1. High-Level Architecture

TaskForge follows a modular, service-oriented architecture with clear separation of concerns between frontend, API layer, and supporting infrastructure.

The system is designed as a **modular monolith** — not microservices. This is intentional: start modular, evolve to microservices only if scale demands it.

### Components

- **Frontend (Next.js)**
  - Handles UI, state management, and API communication
  - Uses WebSockets for real-time updates

- **API Layer (NestJS)**
  - Acts as the central entry point for all client requests
  - Responsible for authentication, validation, and routing

### Core Modules (within backend)

- **Auth Module**
  - JWT-based authentication
  - OAuth (future support)

- **Organization Module**
  - Multi-tenant management
  - User invitations and onboarding

- **Project Module**
  - Project and task management

- **Activity Module**
  - Audit logs and system events

- **Notification Module** (future)
  - Real-time and async notifications

### Infrastructure

- **PostgreSQL** — primary data store
- **Redis** — caching + session storage
- **BullMQ** — background job queue
- **S3** — file storage
- **WebSockets** — real-time communication

### System Diagram

```
[ Next.js Frontend ]
         ↓
    [ NestJS API ]
         ↓
┌────────┬────────┬──────────┬─────┐
Auth  Projects  Activity   Org
         ↓
    PostgreSQL
         ↓
      Redis
         ↓
      BullMQ
         ↓
        S3
```

---

## 2. Multi-Tenancy Strategy

TaskForge uses a **shared database, shared schema** approach where all tenants (organizations) share the same database tables, and data is isolated using an `organization_id` column.

### Why This Approach?

- Simpler to implement and maintain in early stages
- Lower infrastructure and operational cost
- Easier to scale horizontally
- Suitable for SaaS MVPs

### Tradeoffs

**Pros:**
- Efficient resource usage
- Easier migrations
- Centralized monitoring

**Cons:**
- Requires strict data isolation in queries
- Risk of accidental data leaks if not handled carefully
- Limited customization per tenant

### Future Evolution

If needed, the system can evolve to:
- Schema-per-tenant
- Database-per-tenant (for enterprise clients)

---

## 3. Database Design (Initial)

### Core Tables

#### organizations
| Column     | Type      | Constraints       |
| ---------- | --------- | ----------------- |
| id         | UUID (PK) |                   |
| name       | VARCHAR   | NOT NULL          |
| slug       | VARCHAR   | UNIQUE, NOT NULL  |
| created_at | TIMESTAMP | DEFAULT now()     |
| updated_at | TIMESTAMP | DEFAULT now()     |
| deleted_at | TIMESTAMP | NULLABLE          |

#### users
| Column        | Type      | Constraints       |
| ------------- | --------- | ----------------- |
| id            | UUID (PK) |                   |
| email         | VARCHAR   | UNIQUE, NOT NULL  |
| password_hash | VARCHAR   | NOT NULL          |
| full_name     | VARCHAR   | NOT NULL          |
| created_at    | TIMESTAMP | DEFAULT now()     |
| updated_at    | TIMESTAMP | DEFAULT now()     |
| deleted_at    | TIMESTAMP | NULLABLE          |

#### memberships (RBAC pivot)
| Column          | Type      | Constraints          |
| --------------- | --------- | -------------------- |
| id              | UUID (PK) |                      |
| user_id         | UUID (FK) | → users              |
| organization_id | UUID (FK) | → organizations      |
| role            | ENUM      | 'admin', 'member'    |
| created_at      | TIMESTAMP | DEFAULT now()        |

#### projects
| Column          | Type      | Constraints          |
| --------------- | --------- | -------------------- |
| id              | UUID (PK) |                      |
| organization_id | UUID (FK) | → organizations      |
| name            | VARCHAR   | NOT NULL             |
| description     | TEXT      | NULLABLE             |
| created_at      | TIMESTAMP | DEFAULT now()        |
| updated_at      | TIMESTAMP | DEFAULT now()        |
| deleted_at      | TIMESTAMP | NULLABLE             |

#### tasks
| Column      | Type      | Constraints                          |
| ----------- | --------- | ------------------------------------ |
| id          | UUID (PK) |                                      |
| project_id  | UUID (FK) | → projects                           |
| assigned_to | UUID (FK) | → users, NULLABLE                    |
| title       | VARCHAR   | NOT NULL                             |
| description | TEXT      | NULLABLE                             |
| status      | ENUM      | 'todo', 'in_progress', 'done'        |
| priority    | ENUM      | 'low', 'medium', 'high', 'urgent'    |
| due_date    | TIMESTAMP | NULLABLE                             |
| created_at  | TIMESTAMP | DEFAULT now()                        |
| updated_at  | TIMESTAMP | DEFAULT now()                        |
| deleted_at  | TIMESTAMP | NULLABLE                             |

#### activity_logs
| Column          | Type      | Constraints          |
| --------------- | --------- | -------------------- |
| id              | UUID (PK) |                      |
| organization_id | UUID (FK) | → organizations      |
| user_id         | UUID (FK) | → users              |
| action          | VARCHAR   | e.g. 'TASK_CREATED'  |
| metadata        | JSONB     | NULLABLE             |
| created_at      | TIMESTAMP | DEFAULT now()        |

### Indexing Strategy

- Index on `organization_id` (critical for multi-tenancy — every tenant-scoped query hits this)
- Index on `user_id` in memberships (user lookup across orgs)
- Composite index `(project_id, status)` for task filtering queries
- Unique index on `email` in users
- Index on `created_at` in activity_logs (chronological queries)

### Data Integrity

- Enforce foreign key constraints across all relations
- `ON DELETE CASCADE`: projects → tasks (deleting a project removes its tasks)
- `ON DELETE RESTRICT`: users → memberships (prevent orphaned references)
- Unique constraint on `(user_id, organization_id)` in memberships (one membership per org)

### Soft Deletes

All major entities include:
- `deleted_at` (nullable timestamp)

This ensures:
- Data recovery capability
- Audit compliance
- Referential integrity preserved (no broken FK chains from hard deletes)

### RBAC Model (Initial)

**Roles:**
- **Admin** — full access (manage members, projects, settings)
- **Member** — limited access (manage assigned tasks, view projects)

**Future Extension:**

Move to a permission-based model:
- `create_project`
- `edit_task`
- `delete_task`
- `invite_users`

This allows fine-grained control per organization without changing the core auth flow.

### Audit Fields

Every table includes:
- `created_at` — record creation timestamp
- `updated_at` — last modification timestamp

---

## 4. Request Lifecycle

Understanding how a request flows through the system — not just what components exist.

### Example: Create Task

```
Client (Next.js)
  → POST /api/v1/projects/:projectId/tasks
    → Auth Guard: validate JWT, extract user_id + organization_id
      → Authorization: check membership (user belongs to org) + role
        → Validation: DTO validation (title required, valid status, etc.)
          → TaskService: verify project belongs to organization
            → Database: INSERT task
              → ActivityService: record TASK_CREATED event
                → WebSocket: emit event to project subscribers
                  → Response: 201 Created + task payload
```

### Key Enforcement Points

| Step           | What It Prevents                              |
| -------------- | --------------------------------------------- |
| Auth Guard     | Unauthenticated access                        |
| Authorization  | Cross-tenant access, privilege escalation      |
| Validation     | Malformed data, injection                     |
| Service Layer  | Business rule violations (org mismatch, etc.) |
| Activity Log   | Untracked mutations                           |

---

## 5. Tenant Isolation Strategy

Defining `organization_id` is not enough — you need to define **how** isolation is enforced in code.

### Enforcement Approach

1. `organization_id` is extracted from JWT token at the Auth Guard level
2. Injected into the request context (available to all downstream services)
3. Every service method that touches tenant data **requires** `organization_id`

### Rules

- **NEVER** query tasks, projects, or memberships without `organization_id` filter
- **ALWAYS** validate resource ownership (e.g., project belongs to the requesting org before creating a task in it)
- **NEVER** trust client-supplied `organization_id` — always derive from JWT

### Implementation Pattern (NestJS)

```
Request → AuthGuard (JWT) → OrgInterceptor (sets req.organizationId) → Service (uses req.organizationId in all queries)
```

### Future Improvements

- **Global query filters** — ORM-level scoping (TypeORM subscribers or Prisma middleware) so devs can't accidentally skip org filtering
- **Row-Level Security (PostgreSQL RLS)** — database-enforced isolation as a second layer of defense

---

## 6. Background Jobs (Queue Design)

BullMQ handles asynchronous processing to keep API responses fast and enable fault tolerance.

### Initial Jobs

| Job                    | Trigger                    | Priority |
| ---------------------- | -------------------------- | -------- |
| Send invitation email  | User invited to org        | High     |
| Process file upload    | File attached to task      | Medium   |
| Record activity log    | Any mutation event         | Low      |
| Notification dispatch  | Task assigned/commented    | Medium   |

### Why Queue?

- Prevents blocking API responses (email sending = 1-3s)
- Enables automatic retries on failure
- Provides fault tolerance — failed jobs don't crash the API
- Allows rate limiting (e.g., email provider limits)

### Configuration

- Failed jobs retry 3 times with exponential backoff
- Dead letter queue for permanently failed jobs
- Job completion events for monitoring

---

## 7. API Design

### Principles

- RESTful resource-based routing
- Versioned APIs: `/api/v1/`
- Consistent JSON response format
- Proper HTTP status codes
- Centralized error handling with error codes

### Endpoint Structure

```
Auth:
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh

Organizations:
  POST   /api/v1/organizations
  GET    /api/v1/organizations/:orgId
  PATCH  /api/v1/organizations/:orgId
  POST   /api/v1/organizations/:orgId/invite

Projects:
  GET    /api/v1/projects
  POST   /api/v1/projects
  GET    /api/v1/projects/:id
  PATCH  /api/v1/projects/:id
  DELETE /api/v1/projects/:id

Tasks:
  GET    /api/v1/projects/:projectId/tasks
  POST   /api/v1/projects/:projectId/tasks
  PATCH  /api/v1/tasks/:id
  DELETE /api/v1/tasks/:id
```

### Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}

// Error
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with the given ID does not exist"
  }
}
```

---

## 8. Scalability Considerations

- **Horizontal scaling** — stateless API servers behind a load balancer
- **Redis caching** — frequent queries (project lists, user permissions)
- **WebSocket scaling** — Redis adapter to sync events across multiple API instances
- **Connection pooling** — PostgreSQL connection pool (pgBouncer for production)
- **Read replicas** — PostgreSQL read replicas for heavy read workloads (future)
- **CDN** — static assets and file downloads via CDN (future)

---

## 9. Data Access Strategy

TaskForge uses a structured data access layer to enforce consistency and prevent business logic leakage into controllers.

### Structure

```
Controller → Service → Repository → Database
     ↑           ↑          ↑
 HTTP only   Business    Query logic
             logic       + tenant scoping
```

- **Controllers** — handle HTTP request/response only. No business logic, no direct DB access.
- **Services** — business logic, validation, orchestration. Calls repositories, never the ORM directly.
- **Repositories** — database access layer. All queries live here. Tenant filtering (`organization_id`) is enforced at this level.

### Why This Matters

- Prevents duplicated query logic across services
- Enforces tenant filtering consistency — one place to audit
- Improves testability — mock repositories, not the ORM
- Clear separation makes code reviews faster and safer

---

## 10. Real-Time Architecture

WebSockets provide live updates for:
- Task status changes
- New comments
- Activity feed updates
- Member join/leave events

### Scaling Approach

A single API instance can only push events to its own connected clients. In a multi-instance deployment, **Redis Pub/Sub** synchronizes events across all instances.

### Flow

```
Service emits event
  → Redis Pub/Sub (broadcast to all API instances)
    → Each WS server checks subscriber list
      → Matching clients receive the update
```

### Connection Management

- Clients authenticate WebSocket connections with the same JWT used for REST
- Connections are scoped to `organization_id` — a client only receives events for their tenant
- Client-side reconnection with exponential backoff on disconnect

---

## 11. Consistency Model

Not everything needs to be synchronous. TaskForge explicitly defines what requires strong vs. eventual consistency.

### Strong Consistency (synchronous, blocking)

- Authentication & token validation
- RBAC permission checks
- Task creation, updates, deletion
- Membership changes
- Project CRUD operations

These operations **must** reflect immediately — stale data here causes security issues or broken UX.

### Eventual Consistency (asynchronous, non-blocking)

- Activity log recording
- Email notifications
- Real-time WebSocket broadcasts
- File upload processing

These can tolerate a delay of seconds without user impact. They are processed via BullMQ to keep API responses fast.

---

## 12. Failure Handling Strategy

Real systems fail. This section defines how TaskForge behaves when they do.

### API Failures

- Centralized exception filter catches all unhandled errors
- Standard error response format (see Section 7)
- Unique `request_id` attached to every error for traceability
- No stack traces or internal details exposed to clients

### Queue Failures (BullMQ)

- Failed jobs retry **3 times** with exponential backoff (1s → 4s → 16s)
- Permanently failed jobs move to a **dead letter queue** for manual inspection
- Job failure events are logged with full context (job type, payload, error)

### Database Failures

- Connection pooling prevents connection exhaustion
- Transient failures (connection reset, timeout) retry at the service layer
- Long-running transactions are avoided — prefer short, scoped transactions

### Real-Time Failures

- Client-side: automatic reconnection with exponential backoff + jitter
- Server-side: if Redis Pub/Sub disconnects, events are lost (acceptable for non-critical updates) — clients re-fetch state on reconnect
- Heartbeat mechanism to detect stale connections

---

## 13. Observability Strategy

You cannot fix what you cannot see. Observability is built into the system from day one, not bolted on later.

### Logging

- **Structured JSON logs** for all services (machine-parseable, not console.log)
- Every request tagged with a unique `request_id` for end-to-end tracing
- Log levels: `error`, `warn`, `info`, `debug` — production runs at `info`
- Sensitive data (passwords, tokens) **never** logged

### Monitoring (Initial)

- API response latency (p50, p95, p99)
- Queue job success/failure rates
- Active WebSocket connections per instance
- Database connection pool utilization

### Alerting Triggers

- API error rate exceeds 5% over 5 minutes
- Queue dead letter queue depth > 0
- Database connection pool > 80% utilization

### Future Tools

- **Prometheus** — metrics collection
- **Grafana** — dashboards and visualization
- **OpenTelemetry** — distributed tracing across modules

---

## 14. Domain Boundaries

Each module owns its domain logic and database access. No module reaches into another module's internals.

### Ownership Map

| Module         | Owns                                      | Does NOT Touch              |
| -------------- | ----------------------------------------- | --------------------------- |
| Auth           | Authentication, token lifecycle, sessions | User profiles, memberships  |
| Organization   | Tenant lifecycle, membership, invitations | Projects, tasks             |
| Project        | Projects, tasks, assignment logic         | Auth tokens, memberships    |
| Activity       | Event logging (read-only event consumer)  | Any write to other domains  |
| Notification   | Async message delivery (future)           | Business logic of any kind  |

### Communication Rules

- Modules **must NOT** directly access each other's repositories
- Cross-module communication happens via:
  - **Service injection** — module A injects module B's service (NestJS dependency injection)
  - **Event emission** — module A emits an event, module B listens (for decoupled side effects)

### Example

When a task is created:
1. `ProjectModule.TaskService` handles the creation (owns this)
2. Emits a `TASK_CREATED` event
3. `ActivityModule.ActivityListener` picks up the event and logs it (does not import TaskRepository)
4. `NotificationModule` (future) picks up the same event and dispatches a notification

### Why This Matters

- Modules can be developed, tested, and refactored independently
- Clear ownership prevents "spaghetti" dependencies
- Makes future extraction to microservices possible — each module already has clean boundaries

---

## 15. Transaction Strategy

For operations involving multiple writes, TaskForge defines explicit transaction boundaries to prevent partial state.

### When to Use Transactions

| Operation                          | Transaction Required | Reason                                        |
| ---------------------------------- | -------------------- | --------------------------------------------- |
| Create task + log activity         | Yes                  | Task without audit trail = compliance gap      |
| Create membership + send invite    | Partial              | Membership is transactional, email is queued   |
| Delete project + cascade tasks     | Yes (DB-level)       | ON DELETE CASCADE handles this atomically      |
| Update task + notify via WebSocket | No                   | Notification is eventual, not transactional    |

### Rules

- If any step within a transaction fails → **rollback the entire operation**
- Keep transactions **short and scoped** — no API calls, no queue jobs inside a transaction
- Side effects (emails, WebSocket events, queue jobs) happen **after** the transaction commits, not inside it

### Pattern

```
// Correct: side effects AFTER commit
await transaction(async (manager) => {
  await manager.save(task);
  await manager.save(activityLog);
});
// Transaction committed — safe to emit
this.eventEmitter.emit('task.created', task);
this.queue.add('send-notification', payload);

// Wrong: side effect INSIDE transaction
await transaction(async (manager) => {
  await manager.save(task);
  await this.queue.add('notify', payload); // ← if rollback happens, job is already queued
});
```

### Why This Matters

- Prevents ghost data — queued jobs referencing rolled-back records
- Prevents partial writes — task exists but activity log is missing
- Keeps DB lock time minimal — no external I/O inside transactions

---

## 16. Security Model

Security is not a feature — it is a constraint applied across every layer of the system.

### Authentication

- JWT-based auth with **short-lived access tokens** (15 min) and **long-lived refresh tokens** (7 days)
- Refresh token rotation — each use issues a new refresh token and invalidates the old one
- Refresh tokens stored hashed in database (not plaintext)
- Token blacklisting on logout via Redis (check against blacklist on every request)

### Authorization

- Role-based access control (RBAC) enforced at the service layer
- Organization-scoped — a user's role in Org A has no effect in Org B
- Resource ownership validation — always verify the resource belongs to the requesting org

### Data Protection

- Passwords hashed using **bcrypt** (cost factor 12) — argon2 as future upgrade
- Sensitive fields (`password_hash`, `refresh_token`) **never** returned in API responses
- Email addresses treated as PII — excluded from logs

### API Security

- **Rate limiting** — per IP and per authenticated user (prevent brute force + abuse)
- **Input validation** — DTO-based validation on all endpoints (class-validator in NestJS)
- **Mass assignment prevention** — whitelist accepted fields per endpoint, reject unknown properties
- **CORS** — restricted to known frontend origins
- **Helmet** — security headers (X-Frame-Options, CSP, etc.)

### Future Enhancements

- OAuth2 / SSO support (Google, GitHub)
- IP whitelisting for enterprise organizations
- Multi-factor authentication (MFA)

---

## 17. Event-Driven Architecture (Internal)

TaskForge uses internal domain events to decouple side effects from core business logic. This keeps modules independent and makes the system extensible.

### Event Bus

- **Initial:** In-memory event emitter (NestJS `EventEmitter2`)
- **Future:** Redis-based event bus for cross-instance event propagation

### Event Catalog

| Event              | Emitted By         | Payload                                  |
| ------------------ | ------------------ | ---------------------------------------- |
| `TASK_CREATED`     | ProjectModule      | `{ taskId, projectId, organizationId }`  |
| `TASK_UPDATED`     | ProjectModule      | `{ taskId, changes, updatedBy }`         |
| `TASK_DELETED`     | ProjectModule      | `{ taskId, deletedBy }`                  |
| `MEMBER_INVITED`   | OrganizationModule | `{ email, organizationId, invitedBy }`   |
| `MEMBER_JOINED`    | OrganizationModule | `{ userId, organizationId }`             |
| `PROJECT_CREATED`  | ProjectModule      | `{ projectId, organizationId }`          |
| `PROJECT_DELETED`  | ProjectModule      | `{ projectId, deletedBy }`               |

### Consumers

| Consumer               | Listens To                          | Action                          |
| ---------------------- | ----------------------------------- | ------------------------------- |
| ActivityListener       | All mutation events                 | Records audit log entry         |
| NotificationListener   | `TASK_CREATED`, `MEMBER_INVITED`    | Dispatches notification (future)|
| WebSocketGateway       | All events                          | Pushes real-time update         |

### Rules

- Events are **fire-and-forget** — emitter does not wait for consumers
- Consumer failures **must not** break the emitting operation
- Events are emitted **after** transaction commit (see Section 15)

---

## 18. Performance Strategy

Performance is designed in, not optimized later. These patterns are applied from V1.

### Query Optimization

- **No N+1 queries** — use eager loading / joins for related data (e.g., tasks with assignees)
- **No `SELECT *`** — select only required columns
- **Pagination on all list endpoints** — cursor-based for large datasets, offset-based for simple cases
- **Batch operations** where applicable (e.g., bulk task status updates)

### Caching Strategy (Redis)

| Cache Target             | TTL     | Invalidation Trigger          |
| ------------------------ | ------- | ----------------------------- |
| User permissions/roles   | 5 min   | Membership change             |
| Project list (per org)   | 2 min   | Project created/updated       |
| Organization metadata    | 10 min  | Org settings updated          |

**Cache pattern:** Cache-aside (read-through) — check cache first, fetch from DB on miss, populate cache.

### Database Optimization

- Indexes on all frequently queried columns (see Section 3)
- Connection pooling to prevent connection churn
- Read replicas for heavy read workloads (future)
- Query analysis in development — flag queries exceeding 100ms

### API Response Optimization

- Compress responses with gzip/brotli
- Consistent use of HTTP 304 (Not Modified) for cacheable resources
- Avoid over-fetching — return only what the client needs

---

## 19. Service Layer Separation

As the system grows, a single "service" layer becomes a dumping ground. TaskForge separates service responsibilities explicitly.

### Layers

```
Controller
  → Application Service (orchestration)
    → Domain Service (business rules)
      → Repository (persistence)
```

- **Application Services** — orchestrate use cases. They coordinate multiple domain services, handle transactions, and emit events. One method per use case.
- **Domain Services** — pure business rules. No HTTP context, no database calls. Validate business invariants (e.g., "a member cannot assign tasks to users outside their org").
- **Repositories** — persistence only. No business logic, no validation.

### Example: Create Task

```
TaskController.create(dto)
  → TaskAppService.createTask(dto, orgId, userId)
      → TaskDomainService.validateAssignment(assigneeId, orgId)  // business rule
      → TaskRepository.save(task)                                 // persistence
      → EventEmitter.emit('TASK_CREATED', payload)                // side effect
```

### Why This Matters

- **Application services** stay thin — they orchestrate, not compute
- **Domain services** are testable without mocks — pure logic, no I/O
- **Repositories** never contain business rules — swappable ORM without touching logic
- Prevents the "god service" anti-pattern where one 500-line service does everything
