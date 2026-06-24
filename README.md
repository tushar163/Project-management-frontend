# Frontend — Project & Task Management Platform

This is the frontend for the Project & Task Management Platform, built for the
Fastigo AI Coding Round 1 assignment. It is a Next.js 16 (App Router) application
written in TypeScript that covers authentication, project management, task
creation/assignment, status tracking, search, and AI-generated task summaries.

> This README documents the **frontend only**. See the root-level README (or the
> `backend/` directory) for the API, database, and Docker setup.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR/middleware support, file-based routing, matches the assignment's required stack |
| Language | TypeScript (strict mode) | Type safety across API boundaries |
| UI Library | HeroUI v3 (`@heroui/react`) | Accessible, React Aria–based components |
| Styling | Tailwind CSS v4 | Utility-first styling, no separate CSS files per component |
| Server State | TanStack Query v5 | Caching, optimistic updates, request dedup |
| HTTP Client | Axios | Interceptors for auth headers and 401 handling |
| Icons | lucide-react | Lightweight icon set |

State management is split deliberately: **TanStack Query owns all server state**
(projects, tasks), and a small **React Context (`authStore`)** holds just the
current user and JWT. There is no Redux/Zustand — for an app this size, two
well-scoped state mechanisms are clearer than one large global store.

---

## Architecture

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                 # Root layout, wraps app in Providers
│   │   ├── page.tsx                   # Redirects to /projects
│   │   ├── globals.css                # Tailwind + design tokens
│   │   ├── (auth)/                    # Route group — no dashboard chrome
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/               # Route group — shared sidebar/navbar
│   │       ├── layout.tsx
│   │       ├── projects/
│   │       │   ├── page.tsx           # Project list + create
│   │       │   └── [id]/page.tsx      # Single project's tasks
│   │       └── tasks/
│   │           └── page.tsx           # All tasks, with search
│   ├── components/
│   │   ├── auth/                      # LoginForm, RegisterForm
│   │   ├── projects/                  # ProjectCard, ProjectList, CreateProjectModal
│   │   ├── tasks/                     # TaskCard, TaskBoard, CreateTaskModal,
│   │   │                              # TaskStatusSelect, TaskSearchBar, TaskAiSummary
│   │   ├── layout/                    # Sidebar, Navbar, Providers
│   │   └── ui/                        # Small shared primitives (LoadingButton)
│   ├── lib/
│   │   ├── api/                       # axios instance + typed endpoint calls
│   │   ├── hooks/                     # useAuth, useProjects, useTasks (TanStack Query)
│   │   ├── types/                     # TypeScript types mirroring the Prisma schema
│   │   └── validation.ts              # Manual per-field validation (switch-case)
│   ├── store/
│   │   └── authStore.tsx              # Auth Context: user, token, session lifecycle
│   └── middleware.ts                  # Edge route protection
├── .env.local.example
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

### Key architectural decisions

- **Route groups (`(auth)` / `(dashboard)`)** separate pages that need the
  sidebar/navbar from pages that don't, without affecting the URL structure.
- **Types mirror the Prisma schema exactly** (`Role`, `TaskStatus`, `Priority` as
  string literal unions in `lib/types/`), so the frontend and backend never drift
  silently — a backend field rename will surface as a TypeScript error here.
- **`middleware.ts`** guards `/projects` and `/tasks` at the edge by checking an
  `auth_token` cookie, redirecting unauthenticated users before the page renders.
  The actual bearer token used for API calls lives in `localStorage` (read by the
  axios interceptor on every request); the cookie is a parallel copy written only
  so middleware — which cannot read `localStorage` — can do this check.
- **Optimistic status updates** (`useUpdateTaskStatus` in `lib/hooks/useTasks.ts`)
  update the TanStack Query cache immediately when a task's status changes, then
  reconcile with the server response. This is what satisfies the "real-time status
  tracking" requirement without a WebSocket layer, which a 24-hour scope did not
  justify.
- **Manual form validation**, not a form library. Each form keeps its own field
  state and runs values through `validateField` (a switch-case per field name) on
  every change and on submit.

---

## API Integration

The frontend expects the backend at `NEXT_PUBLIC_API_URL` (default
`http://localhost:4000/api`) and consumes these endpoints:

| Method | Endpoint | Used by |
|---|---|---|
| `POST` | `/api/auth/register` | `RegisterForm` → `useAuth().register` |
| `POST` | `/api/auth/login` | `LoginForm` → `useAuth().login` |
| `GET` | `/api/projects` | `ProjectList` → `useProjects()` |
| `POST` | `/api/projects` | `CreateProjectModal` → `useCreateProject()` |
| `GET` | `/api/tasks?search=&status=&projectId=` | `TaskBoard` → `useTasks(filters)` |
| `POST` | `/api/tasks` | `CreateTaskModal` → `useCreateTask()` |
| `PUT` | `/api/tasks/:id/status` | `TaskStatusSelect` → `useUpdateTaskStatus()` |
| `POST` | `/api/tasks/:id/summary` *(addition)* | `TaskAiSummary` → `useGenerateTaskSummary()` |

The `/api/tasks/:id/summary` endpoint isn't in the original three-endpoint list
provided, but is necessary to trigger "AI-generated task summaries" from the UI —
the field `Task.aiSummary` exists in the schema, so something has to populate it.

All API calls are centralized in `lib/api/`; components never call `axios`
directly. `lib/api/client.ts` attaches the JWT to every request and redirects to
`/login` on a `401` response.

---

## State Management

| State | Mechanism | Where |
|---|---|---|
| Current user + JWT | React Context, persisted to `localStorage` + mirrored to a cookie | `store/authStore.tsx` |
| Projects list | TanStack Query | `lib/hooks/useProjects.ts` |
| Tasks (list, filtered) | TanStack Query, with `placeholderData` to avoid flicker while searching | `lib/hooks/useTasks.ts` |
| Task status updates | TanStack Query mutation with optimistic cache write + rollback on error | `useUpdateTaskStatus` in `lib/hooks/useTasks.ts` |
| Form field values/errors | Local `useState` per form | Each form component |

---

## Setup

### Prerequisites
- Node.js 18+
- The backend running and reachable (see backend README)

### Install and run

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if not using the default
npm run dev
```

The app runs at `http://localhost:3000`. Unauthenticated visits to `/projects` or
`/tasks` redirect to `/login`.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Base URL the axios client sends requests to |

### Build for production

```bash
npm run build
npm start
```

---

## Testing

Test coverage for the frontend is the other in-progress item — see the root
repository README and test report for current status across the full stack.