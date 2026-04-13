# TaskForge Backend — Developer Guide

> Every rule here exists because someone, somewhere, shipped a production bug by ignoring it.
> Read the "Why" sections. They are more important than the rules themselves.

---

## 1. Architecture Mental Model

TaskForge is a **modular monolith** — not microservices, not a traditional layered app.

```
src/
  modules/          ← Business domains (the product)
  common/           ← Cross-cutting behavior (guards, filters, interceptors)
  infrastructure/   ← External system bridges (DB, cache, queue, storage)
  shared/           ← Pure data structures (enums, interfaces, errors)
  config/           ← Environment-specific configuration
```

**Think of it this way:**
- `modules/` is *what* the product does
- `common/` is *how* every request is handled
- `infrastructure/` is *where* data goes outside the app
- `shared/` is the *language* all layers speak

Each module is a self-contained business domain. If you removed `tasks/` from the codebase, only `tasks/` should break — nothing else.

---

## 2. Dependency Direction

This is the single most important rule. Violating it creates circular dependencies, untestable code, and architectural decay.

```
modules → common                                    ✅
modules → shared                                    ✅
modules → infrastructure (via interfaces ONLY)      ✅
modules → other modules' exported services (via DI) ✅
modules → other modules' repositories/entities      ❌ NEVER
common  → shared                                    ✅
common  → modules                                   ❌ NEVER
shared  → anything                                  ❌ NEVER (leaf node, zero imports)
infrastructure → shared                             ✅
infrastructure → modules                            ❌ NEVER
```

**Why:** Dependencies flow inward — from the edges of the system toward pure logic. If `shared` imports from `modules`, every module now transitively depends on every other module. One violation cascades into architectural collapse.

**How to check:** If your import path goes from `modules/tasks/` into `modules/projects/repositories/`, stop. You are violating this rule. Inject the *service*, never the repository or entity.

---

## 3. Module Boundaries

Each module owns its domain completely:

| Module | Owns | Never Touches |
|---|---|---|
| `auth/` | Authentication, JWT lifecycle, strategies | User profiles, memberships |
| `users/` | User identity, profiles | Auth tokens, org data |
| `organizations/` | Tenants, memberships, invitations | Projects, tasks |
| `projects/` | Project CRUD, lifecycle | Auth tokens, memberships |
| `tasks/` | Task CRUD, assignment, status | Project internals, org internals |
| `activity/` | Audit logging (read-only consumer) | Write to any other domain |

**Internal structure of every module:**

```
modules/feature/
  feature.module.ts       ← NestJS module definition
  controllers/            ← HTTP layer only (parse request, return response)
  services/               ← Business logic, orchestration, event emission
  repositories/           ← Database queries, tenant scoping
  entities/               ← TypeORM/database models
  dto/                    ← Request/response validation schemas
  listeners/              ← Domain event handlers (if this module reacts to events)
  guards/                 ← Module-specific guards (if any)
  strategies/             ← Auth strategies (auth module only)
```

**Why this structure:** When a bug is reported in task assignment, you know exactly where to look — `modules/tasks/services/`. You don't grep the entire codebase. Ownership is explicit.

### Module Ownership Rule

Each module is the **sole owner** of:
- Its database entities — no other module defines or migrates its tables
- Its repositories — no other module queries its tables directly
- Its domain events — only this module emits events for its domain
- Its service logic — no other module reimplements its rules

**What other modules must NOT do:**
- Import its repository classes
- Import its entity classes for direct queries
- Bypass its service layer to "just read one field" from the database
- Emit events on behalf of another module's domain

**Why:** If module A queries module B's tables directly, you now have two sources of truth for how that data is accessed. When B adds soft-delete filtering, A doesn't get it. When B adds tenant scoping, A doesn't get it. Every shortcut creates a future bug.

---

## 4. Data Flow

Every request follows this exact path. No shortcuts.

```
HTTP Request
  → Controller          (parse input, validate DTO, return response)
    → Service           (business logic, authorization, orchestration)
      → Repository      (database queries, tenant filtering)
        → Database
```

**What each layer is allowed to do:**

| Layer | Allowed | Forbidden |
|---|---|---|
| Controller | Parse request, validate DTO, call ONE service method, return response | Business logic, database access, calling multiple services |
| Service | Business rules, call repositories, emit events, coordinate transactions | HTTP concerns (req/res), direct ORM/SQL queries |
| Repository | Database queries, tenant scoping (`organization_id` filtering) | Business logic, validation, event emission |

**Why "call ONE service method":** A controller that calls three services is secretly an orchestrator. That orchestration logic belongs in a service. Controllers are translators between HTTP and business logic — nothing more.

---

## 5. Module Communication

Modules are isolated. They talk through two channels only.

### Channel 1: Service Injection (synchronous, strong coupling)

Use when module A *needs* module B's validated data to proceed.

```typescript
// tasks.service.ts — needs to verify project belongs to org
constructor(
  private readonly projectsService: ProjectsService,  // ✅ injected service
) {}
```

**Rules:**
- Only inject **exported services** from other modules
- Never inject repositories, entities, or internal classes
- If you're injecting more than 2 external services, your module may be doing too much

### Channel 2: Domain Events (asynchronous, loose coupling)

Use for side effects that don't affect the caller's response.

```typescript
// After task creation succeeds:
this.eventEmitter.emit(EventType.TASK_CREATED, {
  type: EventType.TASK_CREATED,
  payload: { taskId, projectId },
  organizationId,
  triggeredBy: userId,
  occurredAt: new Date(),
});
```

**Rules:**
- Events fire AFTER transaction commit — never inside a transaction
- Event consumers must not throw errors that break the emitter
- Events are fire-and-forget — the emitter never waits for consumers
- Use wildcards in listeners: `@OnEvent('task.*')` — not one listener per event

**When to use which:**

| Scenario | Channel | Why |
|---|---|---|
| Task needs to verify project ownership | Service injection | Caller needs the result to proceed |
| Task created → log to activity | Domain event | Side effect, caller doesn't care if logging fails |
| Task assigned → send notification | Domain event | Async, should not slow down the response |
| Project needs org membership check | Service injection | Authorization, must block if invalid |

### Domain Event Contract Rules

Events are not free-form strings. They follow a strict contract.

**Naming convention:** `domain.action`

```
task.created       ✅
task.updated       ✅
member.invited     ✅
project.archived   ✅
taskCreatedEvent   ❌ (no camelCase)
TASK_CREATED       ❌ (that's the enum key, not the event name)
task.status.changed ❌ (max two segments)
```

**All event names must be registered** in `shared/enums/event-type.enum.ts`. Free-form string events are forbidden — if it's not in the enum, it doesn't get emitted.

**Payload contract:** Every event must implement the `DomainEvent` interface:

```typescript
interface DomainEvent<T = any> {
  type: string;           // EventType enum value
  payload: T;             // Typed per event — no `any` in practice
  organizationId: string; // Tenant context always present
  triggeredBy: string;    // User who caused this
  occurredAt: Date;       // When it happened
}
```

**Why typed events matter:** At scale, untyped events are a debugging nightmare. When a notification arrives for a task that doesn't exist, you need to trace back through typed payloads — not guess what `data.id` referred to.

### Transaction + Event Safety

Events emitted inside a transaction that rolls back create phantom state — notifications for tasks that don't exist, activity logs for operations that never completed.

**The iron rule:** Emit events AFTER transaction commit. Never inside.

```typescript
// ✅ CORRECT
await this.dataSource.transaction(async (manager) => {
  await manager.save(task);
  await manager.save(activityLog);
});
this.eventEmitter.emit(EventType.TASK_CREATED, event); // after commit

// ❌ WRONG — if transaction rolls back, event already fired
await this.dataSource.transaction(async (manager) => {
  await manager.save(task);
  this.eventEmitter.emit(EventType.TASK_CREATED, event); // inside transaction
});
```

**Future evolution:** For mission-critical events (billing, compliance), implement the **transactional outbox pattern** — write the event to an `outbox` table inside the same transaction, then a separate process reads and dispatches them. This guarantees exactly-once delivery even across crashes.

---

## 6. Multi-Tenancy Enforcement

Every piece of data belongs to an organization. There are zero exceptions.

### The Rule

`organization_id` is **never** trusted from the client. It is always derived from the JWT.

```
Request → AuthGuard (extract JWT) → OrgInterceptor (set req.organizationId) → Service → Repository
```

### In Practice

```typescript
// ✅ CORRECT — org_id from JWT context
async findTasks(organizationId: string, projectId: string) {
  return this.repo.find({ where: { project: { organizationId }, id: projectId } });
}

// ❌ WRONG — no tenant filter
async findTasks(projectId: string) {
  return this.repo.find({ where: { projectId } });
}

// ❌ WRONG — org_id from request body
async findTasks(dto: FindTasksDto) {
  return this.repo.find({ where: { organizationId: dto.organizationId } });
}
```

**Why this is critical:** Without tenant filtering, one API call with a guessed UUID can leak another organization's data. This is the #1 security vulnerability in multi-tenant SaaS.

**Repository-level enforcement:** Every repository method that reads or writes tenant-scoped data MUST accept `organizationId` as a parameter. No default, no optional. If you forget, the compiler (via required parameters) and code review will catch it.

---

## 7. Infrastructure Abstraction

Modules never depend on concrete infrastructure. They depend on interfaces.

```
IStorageService  → LocalStorageService (dev) / S3StorageService (prod)
ICacheService    → MemoryCacheService (test) / RedisCacheService (prod)
IQueueService    → SyncQueueService (test) / BullMQService (prod)
```

### How to inject

```typescript
// In the module:
{ provide: STORAGE_SERVICE, useClass: LocalStorageService }

// In the service:
constructor(@Inject(STORAGE_SERVICE) private storage: IStorageService) {}
```

**Why:** You will switch from local file storage to S3. You will switch from in-memory cache to Redis. When that happens, you change ONE provider binding — not 47 service files. Tests inject mocks through the same token.

---

## 8. Shared Layer Contract

`shared/` is the vocabulary of the system. It has the strictest rules.

### What belongs here

| Allowed | Example |
|---|---|
| Enums | `Role`, `TaskStatus`, `TaskPriority`, `EventType` |
| Constants | `API_PREFIX`, `BCRYPT_ROUNDS`, `DEFAULT_PAGE_SIZE` |
| Interfaces | `ApiResponse<T>`, `RequestContext`, `DomainEvent` |
| Base DTOs | `PaginationDto` |
| Error definitions | `AppError`, `ErrorCodes` |

### What does NOT belong here

| Forbidden | Why |
|---|---|
| Service classes | Business logic belongs in modules |
| Database logic | Belongs in repositories |
| Utility functions with side effects | Create an infrastructure service instead |
| Module-specific types | Keep them in the module's own `dto/` or `interfaces/` |

**The test:** Can this file be copy-pasted into a completely different NestJS project and still make sense? If yes, it belongs in `shared/`. If no, it belongs in a module.

---

## 9. Common Layer Contract

`common/` handles behavior that applies to every request, regardless of business domain.

### What belongs here

| Type | Purpose | Example |
|---|---|---|
| Guards | Authentication, authorization | `JwtAuthGuard`, `RolesGuard` |
| Interceptors | Response transformation, logging | `ResponseTransformInterceptor` |
| Filters | Exception handling | `AppExceptionFilter` |
| Decorators | Metadata extraction | `@CurrentUser()`, `@Roles()` |
| Pipes | Validation, transformation | Custom validation pipes |

### What does NOT belong here

- Business-specific guards (e.g., "can this user edit THIS task") → belongs in the module
- Feature-specific interceptors → belongs in the module
- Anything that imports from `modules/` → violates dependency direction

**The test:** Does this behavior apply to 3+ modules identically? If yes → `common/`. If it's specific to one domain → keep it in that module.

---

## 10. Error Handling

Errors are not an afterthought — they are a system-wide contract. Every error flows through the same architecture.

### Error class

```typescript
class AppError extends Error {
  constructor(
    public readonly code: string,       // From ErrorCodes — machine-readable
    message: string,                     // Human-readable, safe for client
    public readonly statusCode: number,  // HTTP status
    public readonly metadata?: Record<string, any>,  // Optional context for debugging
  ) {}
}
```

### Throwing errors

```typescript
// Simple error
throw new AppError(ErrorCodes.TASK_NOT_FOUND, 'Task with the given ID does not exist', 404);

// Error with metadata (logged server-side, never sent to client)
throw new AppError(
  ErrorCodes.INVALID_ASSIGNEE,
  'Assignee is not a member of this organization',
  400,
  { assigneeId, organizationId },
);
```

### Error response format (enforced by AppExceptionFilter)

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with the given ID does not exist"
  }
}
```

**Note:** `metadata` is logged server-side for debugging but NEVER sent to the client. This prevents leaking internal IDs, query details, or system state.

### Rules

- **All modules throw `AppError` only** — no raw `Error`, no `HttpException` in service layer
- Every error has a unique `code` from `ErrorCodes` — clients switch on codes, not messages
- Error messages are user-facing — no stack traces, no internal details, no SQL
- New error codes are added to `shared/errors/error-codes.ts` before use
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (unexpected)
- Controllers may use NestJS `HttpException` for HTTP-specific concerns (rare)
- Services must never import from `@nestjs/common` for error throwing — use `AppError`

**Why `AppError` only:** If services throw random exceptions, the frontend can't build reliable error handling. With `AppError`, every error is typed, coded, and predictable. The exception filter catches everything — `AppError` gets formatted, unknown errors become a safe 500.

---

## 11. API Response Format

Every successful response is wrapped by `ResponseTransformInterceptor`:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}
```

**Rules:**
- Controllers return raw data — the interceptor wraps it
- Paginated endpoints include `meta` with `page` and `total`
- Never return `null` as top-level `data` — return `404` instead
- Arrays return `[]` when empty, not `null`

---

## 12. Naming Conventions

Consistency is not about aesthetics — it's about predictability. A developer should guess a filename correctly before looking.

### Files

| Type | Pattern | Example |
|---|---|---|
| Module | `feature.module.ts` | `tasks.module.ts` |
| Controller | `feature.controller.ts` | `tasks.controller.ts` |
| Service | `feature.service.ts` | `tasks.service.ts` |
| Repository | `feature.repository.ts` | `tasks.repository.ts` |
| Entity | `feature.entity.ts` | `task.entity.ts` (singular) |
| DTO | `action-feature.dto.ts` | `create-task.dto.ts` |
| Guard | `feature.guard.ts` | `jwt-auth.guard.ts` |
| Listener | `feature.listener.ts` | `activity.listener.ts` |
| Interface | `feature.interface.ts` | `storage.interface.ts` |
| Enum | `feature.enum.ts` | `task-status.enum.ts` |
| Config | `feature.config.ts` | `database.config.ts` |

### Classes

| Type | Pattern | Example |
|---|---|---|
| Controller | `FeatureController` | `TasksController` |
| Service | `FeatureService` | `TasksService` |
| Repository | `FeatureRepository` | `TasksRepository` |
| Entity | `Feature` (singular, no suffix) | `Task` |
| DTO | `ActionFeatureDto` | `CreateTaskDto` |
| Guard | `FeatureGuard` | `JwtAuthGuard` |
| Interface | `IFeatureService` | `IStorageService` |
| Enum | `Feature` | `TaskStatus` |

### Variables and methods

- `camelCase` for variables and methods
- `UPPER_SNAKE_CASE` for constants and injection tokens
- Boolean variables prefixed with `is`, `has`, `can`, `should`
- Async methods describe what they return, not the mechanism: `findTasks()` not `queryTasksFromDatabase()`

---

## 13. DTO Rules

DTOs are the contract between client and server. They enforce what gets in.

### Rules

- Every endpoint has its own DTO — no reusing `CreateTaskDto` for updates
- Use `class-validator` decorators for validation — no manual `if` checks
- `whitelist: true` and `forbidNonWhitelisted: true` are set globally — unknown fields are rejected
- Partial update DTOs use `PartialType(CreateFeatureDto)` — don't duplicate fields
- DTOs never contain business logic — they are pure validation schemas

### Example structure

```
dto/
  create-task.dto.ts       ← POST /tasks
  update-task.dto.ts       ← PATCH /tasks/:id
  query-tasks.dto.ts       ← GET /tasks (filters, pagination)
```

---

## 14. Transaction Rules

Transactions prevent partial state. But misusing them causes deadlocks and ghost data.

### When to use transactions

| Operation | Transaction? | Why |
|---|---|---|
| Create task + log activity | Yes | Task without audit = compliance gap |
| Create membership + send email | Partial | Membership is transactional, email is queued |
| Delete project + cascade tasks | DB-level | `ON DELETE CASCADE` handles it atomically |
| Update task + WebSocket push | No | Notification is eventual, not transactional |

### The pattern

```typescript
// Side effects AFTER commit — never inside
await this.dataSource.transaction(async (manager) => {
  await manager.save(task);
  await manager.save(activityLog);
});
// Transaction committed — now safe to emit
this.eventEmitter.emit(EventType.TASK_CREATED, payload);
```

**Why AFTER:** If the transaction rolls back but the event already fired, you get a notification about a task that doesn't exist. Side effects after commit. Always.

---

## 15. Testing Strategy

Untested code is code that works by accident. Each layer has its own test type.

```
test/
  unit/              ← Service logic with mocked repositories
  integration/       ← Repository queries against real database
  e2e/               ← Full HTTP request → response cycle
```

| Layer | Test Type | What's Real | What's Mocked |
|---|---|---|---|
| Controller | e2e | HTTP, validation, guards | Database (optional) |
| Service | Unit | Business logic | Repositories, external services |
| Repository | Integration | Database, queries | Nothing |
| Infrastructure | Unit | Interface contract | External systems |

**The principle:** Business logic (services) must be testable without a database, without Redis, without any external system. If your test needs a database connection to verify a business rule, the rule is in the wrong layer.

**What to test:**
- Services: every business rule, every edge case, every error path
- Repositories: query correctness, tenant scoping, soft delete filtering
- e2e: happy paths, auth enforcement, input validation rejection

**What NOT to test:**
- NestJS framework behavior (DI, decorators)
- Third-party library internals
- Obvious getters/setters with no logic

---

## 16. Security Checklist (every PR)

Before merging any code, verify:

- [ ] No endpoint is accessible without `JwtAuthGuard` (unless explicitly public)
- [ ] Every tenant-scoped query includes `organizationId` filter
- [ ] `organization_id` is derived from JWT, never from request body/params
- [ ] Sensitive fields (`password_hash`, `refresh_token`) are excluded from API responses
- [ ] New endpoints use `class-validator` DTOs with `whitelist: true`
- [ ] No raw SQL without parameterized queries
- [ ] No secrets or tokens in error messages or logs
- [ ] Rate limiting is applied to auth endpoints
- [ ] File uploads are validated (type, size) before processing

---

## 17. Code Review Principles

These are the questions a reviewer should ask on every PR.

### Architecture

- Does this change respect dependency direction? (imports flow inward)
- Is the new code in the right module? (does it belong to this business domain?)
- If a new module-to-module dependency was added, is it via service injection or events?

### Data safety

- Does every database query filter by `organizationId`?
- Are transactions used where multiple writes must succeed together?
- Are events emitted after transaction commit?

### API contract

- Does the endpoint have a DTO with proper validation?
- Does the response follow the standard `{ success, data, meta }` format?
- Are error codes from `ErrorCodes`, not ad-hoc strings?

### Simplicity

- Is this the simplest solution that solves the problem?
- Are there new abstractions? Do they earn their complexity with 3+ use cases?
- Is there dead code, commented-out code, or TODOs without issue links?

---

## 18. Git and Branch Strategy

### Branch naming

```
feature/TASK-123-add-task-assignment
fix/TASK-456-tenant-leak-in-projects
refactor/TASK-789-extract-membership-service
```

### Commit messages

```
feat(tasks): add task assignment with org membership validation
fix(projects): enforce organization_id filter on project queries
refactor(auth): extract token service from auth service
```

Format: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
Scope: module name or `common`, `shared`, `infra`, `config`

### PR rules

- One feature per PR — not "added tasks and also refactored auth"
- Every PR must pass lint, tests, and build before merge
- Squash merge to main — clean history over detailed noise

---

## 19. Performance Defaults

These are not optimizations — they are baseline expectations.

- **No N+1 queries** — use eager loading or joins for related data
- **No `SELECT *`** — select only required columns
- **Pagination on all list endpoints** — no unbounded queries
- **Indexes on all `organization_id` columns** — every tenant query hits this
- **Connection pooling** — never open/close connections per request
- **Short transactions** — no API calls or queue jobs inside a transaction

**The rule of thumb:** If a list endpoint can return more than 50 rows, it must be paginated. If a query runs without an index on the filter column, it will be caught in code review.

---

## 20. Adding a New Module (checklist)

When you add a new business domain:

1. Create the module directory under `src/modules/feature-name/`
2. Follow the internal structure: `controllers/`, `services/`, `repositories/`, `entities/`, `dto/`
3. Define the module class in `feature-name.module.ts`
4. Register it in `app.module.ts`
5. Add entity enums to `shared/enums/` if they're used across modules
6. Add error codes to `shared/errors/error-codes.ts`
7. Add event types to `shared/enums/event-type.enum.ts` if the module emits events
8. Write unit tests for the service layer
9. Write e2e tests for the controller endpoints
10. Verify dependency direction — no imports from other modules' internals

---

## 21. Adding a New Endpoint (checklist)

1. Create a DTO in `modules/feature/dto/` with class-validator decorators
2. Add the controller method — one service call, return data
3. Add the service method — business logic, authorization, event emission
4. Add the repository method — database query with `organizationId` filter
5. Protect with `@UseGuards(JwtAuthGuard)` — or `@UseGuards(JwtAuthGuard, RolesGuard)` with `@Roles()`
6. Add error codes if new failure cases exist
7. Write a unit test for the service method
8. Write an e2e test for the endpoint

---

## 22. Configuration Strategy

Configuration is how your app adapts to its environment. Hardcoded values are tech debt that silently accumulates.

### The rule

All runtime configuration comes from **environment variables**, accessed via **NestJS ConfigService**. No exceptions.

### What must be configured (never hardcoded)

| Setting | Example | Why |
|---|---|---|
| Database connection | host, port, credentials | Different per environment |
| Redis connection | host, port | Different per environment |
| JWT secret | signing key | Security — must rotate |
| Token TTLs | access: 15m, refresh: 7d | Tunable without deploy |
| API port | 3000 | Infrastructure decides this |
| CORS origins | frontend URL | Changes per environment |
| File storage path/bucket | uploads/ or s3://bucket | Local vs cloud |
| Rate limit thresholds | 100 req/min | Tunable per environment |

### How to access config

```typescript
// ✅ CORRECT — via ConfigService
constructor(private config: ConfigService) {}

async someMethod() {
  const secret = this.config.get<string>('auth.jwtSecret');
}

// ❌ WRONG — hardcoded
const secret = 'my-jwt-secret';

// ❌ WRONG — direct process.env in services
const secret = process.env.JWT_SECRET;
```

**Why no direct `process.env`:** ConfigService provides type safety, default values, and validation. Direct `process.env` gives you `string | undefined` everywhere, fails silently when missing, and scatters environment coupling across the entire codebase.

### Config file organization

```
config/
  database.config.ts   ← registerAs('database', () => ({ ... }))
  redis.config.ts      ← registerAs('redis', () => ({ ... }))
  auth.config.ts       ← registerAs('auth', () => ({ ... }))
  index.ts             ← re-exports all configs
```

### Rules

- Every config file uses `registerAs()` with a namespace
- Default values are for **development only** — production must set explicit env vars
- Secrets (`JWT_SECRET`, `DB_PASSWORD`) have no sensible default — app should fail to start if missing in production
- `.env` is gitignored. `.env.example` is committed with placeholder values
- Config is loaded once at startup — not re-read per request

---

## Quick Reference — Decision Table

| Question | Answer |
|---|---|
| Where does business logic go? | `modules/feature/services/` |
| Where does a database query go? | `modules/feature/repositories/` |
| Where does request validation go? | `modules/feature/dto/` |
| Where does a cross-cutting guard go? | `common/guards/` |
| Where does a feature-specific guard go? | `modules/feature/guards/` |
| Where does a new enum go? | `shared/enums/` (if cross-module) or module's own file (if local) |
| Where does a new error code go? | `shared/errors/error-codes.ts` |
| How do modules talk? | Service injection (sync) or domain events (async) |
| How does infra get injected? | Via interface token (`@Inject(STORAGE_SERVICE)`) |
| How is tenant isolation enforced? | `organizationId` from JWT on every query, no exceptions |
| What error class do services throw? | `AppError` only — never raw `Error` or `HttpException` |
| Where do event names live? | `shared/enums/event-type.enum.ts` — no free-form strings |
| When do events fire? | After transaction commit — never inside |
| Where does config come from? | `ConfigService` — never `process.env` in services |
| Can module A import module B's repository? | No. Never. Inject the service instead |
| Where does metadata go on errors? | `AppError.metadata` — logged server-side, never sent to client |
