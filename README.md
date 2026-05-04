![TaskForge Dashboard](screenshots/dashboard/1.png)

# TaskForge — Multi-Tenant SaaS Project Management Platform

TaskForge is a production-grade SaaS project management platform built with **Next.js, NestJS, PostgreSQL, Redis, Socket.IO, Stripe, Docker, and CI/CD**.

It includes organization-based multi-tenancy, role-based access control, Kanban task management, real-time notifications, email workflows, billing architecture, and a polished dashboard UI.

## Live Demo

**Demo:** [https://task-forge-demo.vercel.app](https://task-forge-demo.vercel.app)

### Demo Account

| Field | Value |
|---|---|
| **Email** | `demo@taskforge.com` |
| **Password** | `Demo@12345` |

> The demo account has sample projects, tasks, members, notifications, and dashboard data pre-loaded.

---

## Why This Project Stands Out

- **Multi-tenant SaaS architecture** — organization-scoped data isolation
- **Role-based access control** — Admin / Member with guard chain enforcement
- **Kanban board** with drag-and-drop tasks using dnd-kit
- **Real-time notifications** using Socket.IO
- **Email notifications** using Nodemailer
- **Stripe subscription billing** structure
- **JWT auth** with refresh token rotation and theft detection
- **PostgreSQL + Redis** backend architecture
- **Docker-based** local and production setup
- **CI/CD pipeline** with GitHub Actions

---

## Screenshots

### Dashboard & Analytics

**Overview** — Stats cards, task flow over time, and status mix.

![Dashboard overview with metrics and charts](screenshots/dashboard/1.png)

**Operational view** — Workflow health, activity feed, priority mix, deadlines, and "My work."

![Dashboard with workflow health and activity](screenshots/dashboard/2.png)

### Kanban Board

![Kanban task board](screenshots/dashboard/tasks.png)

### Projects

**Project grid** — Workspace projects with search and card layout.

![Projects grid](screenshots/dashboard/projects.png)

**Project detail** — Single project header with board/table switcher and Kanban columns.

![Project detail board view](screenshots/dashboard/project-detail.png)

### Organization Members

**Organizations** — Active workspace, metadata, and team access summary.

![Organizations workspace](screenshots/dashboard/organization.png)

**Team roster** — Members and pending invitations with role badges.

![Team members and invitations](screenshots/dashboard/organization-2.png)

**Invite member** — Modal with email, role, and send invitation.

![Invite member modal](screenshots/dashboard/send-invitation.png)

### Real-Time Notifications

![Notification dropdown](screenshots/dashboard/notifications.png)

### Authentication

Split-panel auth with shared branding.

![Login](screenshots/auth/login.png)

![Create workspace — registration](screenshots/auth/register.png)

![Forgot password](screenshots/auth/forgot-password.png)

### Mobile & Responsive

![Mobile dashboard](screenshots/mobile-view/dashboard.png)
![Mobile project list](screenshots/mobile-view/project-list.png)
![Mobile project detail](screenshots/mobile-view/project-detail.png)
![Mobile organizations](screenshots/mobile-view/organization.png)

---

## Use TaskForge as a Reference For

- Building multi-tenant SaaS apps
- Structuring a Next.js + NestJS monorepo
- Implementing organization-based RBAC
- Adding real-time notifications with Socket.IO
- Designing project/task management workflows
- Integrating Stripe billing architecture
- Setting up Docker and CI/CD for full-stack apps

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **State** | Zustand (client state), TanStack React Query (server state) |
| **Realtime Client** | Socket.IO Client |
| **Drag & Drop** | dnd-kit |
| **Backend** | NestJS 11, TypeScript |
| **Database** | PostgreSQL 16, TypeORM |
| **Cache** | Redis 7, ioredis |
| **Queue** | BullMQ (separate worker process) |
| **WebSocket** | Socket.IO via NestJS Gateway |
| **Email** | Nodemailer with SMTP |
| **Billing** | Stripe SDK v22 |
| **Auth** | JWT + Passport + argon2 |
| **Logging** | Pino (structured JSON) |

---

## Project Structure

```
TaskForge/
├── frontend/                    # Next.js 15 App Router
│   └── src/
│       ├── app/                 # Pages (auth, dashboard)
│       ├── components/          # UI components + layout
│       ├── features/            # Feature modules (tasks, projects, orgs)
│       ├── hooks/               # Shared hooks
│       ├── lib/                 # API client, utils, socket
│       ├── store/               # Zustand stores
│       └── types/               # TypeScript interfaces
│
├── backend/                     # NestJS 11 API
│   └── src/
│       ├── modules/
│       │   ├── auth/            # JWT, refresh tokens, login/register
│       │   ├── users/           # User management
│       │   ├── organizations/   # Multi-tenant orgs, memberships, invites
│       │   ├── projects/        # Project CRUD
│       │   ├── tasks/           # Task CRUD with assignment
│       │   ├── activity/        # Audit logging
│       │   ├── realtime/        # WebSocket gateway
│       │   ├── notifications/   # In-app notification system
│       │   ├── mail/            # Nodemailer email service
│       │   ├── billing/         # Stripe subscriptions
│       │   └── health/          # Health checks
│       ├── infrastructure/      # Database, Redis, Queue
│       ├── common/              # Guards, filters, decorators
│       └── shared/              # Enums, interfaces, errors│
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Backend Setup

```bash
cd backend
cp .env.example .env          # Edit with your credentials
npm install
npm run migration:run         # Create database tables
npm run start:dev             # Start API on port 3000
npm run start:worker:dev      # Start background worker (separate terminal)
```

### Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # Start on port 3001
```

### Access the App

1. Open `http://localhost:3001`
2. Register a new account
3. Create an organization
4. Start creating projects and tasks

---

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=taskforge

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secret-key-at-least-32-characters-long
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Email (SMTP) - Optional, logs emails when not configured
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=TaskForge <noreply@taskforge.io>

# Stripe (optional in development)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## Email Notification Setup

### Using Nodemailer with SMTP

TaskForge uses Nodemailer for transactional emails. Configure SMTP credentials in your backend `.env`:

```bash
SMTP_HOST=smtp.gmail.com      # Or any SMTP provider
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=TaskForge <noreply@yourdomain.com>
```

### Testing with Mailtrap/Ethereal

For development, use [Mailtrap](https://mailtrap.io) or [Ethereal](https://ethereal.email):

```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

### Email Events

| Event | Email Sent To | Content |
|-------|--------------|---------|
| Admin invites a user | Invited email address | Invitation with accept link |
| Task assigned to user | Assigned user's email | Task title, description, priority, due date |
| Task reassigned | Newly assigned user | Same as above |

When SMTP is not configured, emails are logged to console for development visibility.

---

## WebSocket Notifications

TaskForge uses Socket.IO for real-time notifications:

1. **Connection**: Client connects with JWT token in handshake auth
2. **Rooms**: Users join `user:{id}` (personal) and `org:{orgId}` (team) rooms
3. **Events**: Domain events (task.created, task.updated, member.joined) broadcast to org rooms
4. **Notifications**: Task assignments and member joins create persistent notifications
5. **Frontend**: Bell icon with unread count, dropdown with notification list

---

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh tokens |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/logout` | Logout |

### Organizations
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/organizations` | Create organization |
| GET | `/api/v1/organizations` | List user's orgs |
| POST | `/api/v1/organizations/switch` | Switch active org |
| GET | `/api/v1/organizations/current` | Get current org |
| GET | `/api/v1/organizations/members` | List org members |
| POST | `/api/v1/organizations/invites` | Create invite (admin) |

### Projects & Tasks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects` | List projects |
| POST | `/api/v1/projects/{id}/tasks` | Create task |
| GET | `/api/v1/tasks` | List all tasks |
| PATCH | `/api/v1/tasks/{id}` | Update task |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread count |
| POST | `/api/v1/notifications/{id}/read` | Mark as read |
| POST | `/api/v1/notifications/read-all` | Mark all as read |

---

## Architecture Highlights

### Request Flow
```
Client -> Next.js -> NestJS API
                        |
                   Guard Chain:
                   Throttler -> JWT -> OrgMembership -> Roles
                        |
                   Service Layer -> PostgreSQL
                        |
                   Domain Event Bus
                    /          \
              BullMQ         Socket.IO
              Queue          Broadcast
                |
              Worker
           (audit log)
```

### Multi-Tenant Isolation
- Organization ID validated at guard layer, not query layer
- Services read org context from validated request, never from user input
- Membership checked with 3-tier cache for performance

### Event-Driven Architecture
- All mutations emit domain events
- Events consumed by: Activity Logger, WebSocket Broadcaster, Notification Creator, Email Sender
- Background worker processes audit log asynchronously

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

See the [open issues](https://github.com/engmaryamameen/TaskForge/issues) for a list of known issues and planned features.

---

## License

MIT
