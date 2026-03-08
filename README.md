# PIPS 2.0

Multi-tenant SaaS that embeds a 6-step process improvement methodology into enterprise project management and ticketing software.

**Production:** https://pips-app.vercel.app

## The PIPS Methodology

| Step | Name          | Purpose                                                           |
| ---- | ------------- | ----------------------------------------------------------------- |
| 1    | Identify      | Define measurable problem statements                              |
| 2    | Analyze       | Root cause analysis (fishbone, 5-why, force-field)                |
| 3    | Generate      | Brainstorm solutions (brainwriting, brainstorming)                |
| 4    | Select & Plan | Decision matrices, weighted voting, RACI, implementation planning |
| 5    | Implement     | Execute with milestones, checklists, progress tracking            |
| 6    | Evaluate      | Measure results, lessons learned, cycle back to Step 1            |

## Features

- **15 methodology forms** spanning all 6 PIPS steps
- **Kanban board** with drag-and-drop ticket management
- **Sortable ticket table** with filtering and search
- **Cmd+K command palette** for quick navigation
- **Notification system** with real-time updates
- **RBAC** with 5 roles (owner, admin, manager, member, viewer)
- **Responsive sidebar** navigation
- **Multi-tenant** organizations with row-level security

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Framework  | Next.js 16.1.6 (App Router)                             |
| Language   | TypeScript 5.9.3 (strict mode)                          |
| Styling    | Tailwind CSS v4.2.1                                     |
| Components | shadcn/ui + Radix                                       |
| State      | Zustand                                                 |
| Backend    | Supabase (Postgres, Auth, RLS, Storage, Edge Functions) |
| Validation | Zod                                                     |
| Testing    | Vitest (144 tests passing)                              |
| Monorepo   | Turborepo + pnpm                                        |
| Hosting    | Vercel                                                  |
| Fonts      | DM Sans, DM Serif Display                               |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10.30.3
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)

### Install

```bash
git clone https://github.com/AgentCorp18/pips2.git
cd pips2
pnpm install
```

### Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp apps/web/.env.example apps/web/.env.local
```

| Variable                        | Required | Description                                  |
| ------------------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL`           | Yes      | App URL (`http://localhost:3000` for dev)    |
| `NEXT_PUBLIC_APP_NAME`          | Yes      | App display name (defaults to `PIPS`)        |
| `RESEND_API_KEY`                | No       | Resend API key for transactional emails      |
| `SENTRY_DSN`                    | No       | Sentry DSN for error tracking                |

### Local Database

```bash
pnpm db:start       # Start local Supabase
pnpm db:reset       # Apply migrations and seed data
pnpm db:types       # Generate TypeScript types from schema
```

### Development Server

```bash
pnpm dev
```

Open http://localhost:3000.

## Project Structure

```
PIPS2.0/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App Router
│       │   │   ├── (auth)/     # Login, signup, password reset
│       │   │   ├── (marketing)/# Landing page, pricing
│       │   │   └── (app)/      # Authenticated app (dashboard, projects, tickets, teams, settings)
│       │   ├── components/     # React components
│       │   │   ├── ui/         # shadcn/ui base components
│       │   │   ├── pips/       # PIPS methodology components
│       │   │   ├── tickets/    # Ticket management components
│       │   │   └── layout/     # Layout components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and Supabase clients
│       │   ├── stores/         # Zustand stores
│       │   └── types/          # TypeScript type definitions
│       └── vitest.config.ts
├── packages/
│   └── shared/                 # Shared types and constants
├── supabase/
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge Functions
│   └── seed.sql                # Dev seed data
├── tests/                      # E2E and integration tests
├── docs/                       # Planning docs and work logs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Scripts

Run from the project root:

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start development server                       |
| `pnpm build`     | Production build                               |
| `pnpm typecheck` | Run TypeScript type checking                   |
| `pnpm lint`      | Run ESLint                                     |
| `pnpm test`      | Run Vitest test suite                          |
| `pnpm format`    | Format code with Prettier                      |
| `pnpm db:start`  | Start local Supabase                           |
| `pnpm db:reset`  | Reset database (migrations + seed)             |
| `pnpm db:types`  | Generate TypeScript types from database schema |
| `pnpm db:push`   | Push migrations to remote Supabase             |
| `pnpm clean`     | Clean build artifacts                          |

## Testing

Tests use Vitest and run from the `apps/web` package:

```bash
pnpm test              # Run all tests
pnpm test:unit         # Run unit tests only
pnpm test:e2e          # Run Playwright E2E tests
```

## Deployment

The app deploys to [Vercel](https://vercel.com) automatically on push to `main`. Preview deployments are created for pull requests.

Required Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `SENTRY_DSN`

## License

Private. All rights reserved.
