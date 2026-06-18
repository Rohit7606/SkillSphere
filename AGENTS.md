# AGENTS.md — SkillSphere System Instruction File
> **Project:** SkillSphere – Intelligent Hyperlocal Freelance Ecosystem
> **Organization:** Nayoda
> **Review Deadline:** 03 June 2026
> **Version:** 1.0.0

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack (Canonical)](#2-tech-stack-canonical)
3. [Repository Structure](#3-repository-structure)
4. [Database Schema (Supabase + Drizzle ORM)](#4-database-schema-supabase--drizzle-orm)
5. [Authentication & RBAC](#5-authentication--rbac)
6. [Core Modules — Feature Specification](#6-core-modules--feature-specification)
7. [API Design Rules](#7-api-design-rules)
8. [Frontend & UI/UX Standards](#8-frontend--uiux-standards)
9. [AI Integration (Vercel AI SDK)](#9-ai-integration-vercel-ai-sdk)
10. [Real-Time Layer (Socket.IO / Supabase Realtime)](#10-real-time-layer-socketio--supabase-realtime)
11. [Payment Integration](#11-payment-integration)
12. [Security Standards](#12-security-standards)
13. [Development Timeline](#13-development-timeline)
14. [Agent Behaviour Rules](#14-agent-behaviour-rules)

---

## 1. PROJECT OVERVIEW

SkillSphere is a **production-grade, full-stack MERN-inspired platform** (migrated to Next.js 16 + Supabase) that connects **Clients** with **Freelancers** in a hyperlocal environment.

### Core Value Propositions
- AI-powered job matching (HuggingFace embeddings via Vercel AI SDK)
- Milestone-based escrow payments (Razorpay / Stripe)
- Weighted reputation & fraud-detection review system
- Real-time chat + collaboration (Socket.IO / Supabase Realtime)
- Admin analytics dashboards with full platform control

### User Roles
| Role | Description |
|------|-------------|
| `client` | Posts gigs, manages payments, reviews freelancers |
| `freelancer` | Builds profiles, applies to gigs, receives payments |
| `admin` | Full platform control, moderation, analytics |

---

## 2. TECH STACK (CANONICAL)

> All agents MUST use only these libraries. Do not introduce alternatives without explicit approval.

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** |
| React Compiler | Enabled (stable) — no manual `useMemo`/`useCallback` needed |
| Styling | **Tailwind CSS v4.0** (Oxide engine, native container queries) |
| Component System | **shadcn/ui** (Radix UI Primitives) |
| Server State | **TanStack Query v5** (client) + `next/cache` / `use cache` (server) |
| UI State | Local component state + **Zustand** (global UI state only) |
| Forms | **React Hook Form** + **Zod** |
| Data Grid | **TanStack Table v8** |
| Charts | **Recharts** (standard dashboards) / **ECharts** (high-frequency data) |
| AI Streaming UI | **Vercel AI SDK** (`useChat`, `useCompletion`, `useObject`) |
| Real-time | **Socket.IO client** + **Supabase Realtime** |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | **Node.js 20+** |
| Framework | **Next.js 16 Route Handlers** + **Express.js** (Socket.IO server) |
| ORM | **Drizzle ORM** |
| Database | **Supabase** (PostgreSQL) |
| Auth | **Clerk** (primary) or **Auth.js v5** (self-hosted fallback) |
| AI Orchestration | **Vercel AI SDK** (server-side streaming, tool calling) |
| File Uploads | **Cloudinary** |
| Email | **Nodemailer** / **Resend** |
| Caching / Rate Limiting | **Upstash Redis** |
| Search | **Supabase Full-Text Search** / **ElasticSearch** (advanced) |

### Integrations
| Service | Purpose |
|---------|---------|
| Razorpay / Stripe | Payments, escrow, milestone payouts |
| Cloudinary | Portfolio images, resume uploads, document attachments |
| HuggingFace (via Vercel AI SDK) | Skill embedding + similarity scoring |
| Upstash Redis | Rate limiting (AI endpoints), session caching |
| Nodemailer / Resend | Transactional emails (verification, reset, notifications) |

---

## 3. REPOSITORY STRUCTURE

```
skillsphere/
├── apps/
│   └── web/                          # Next.js 16 App
│       ├── app/
│       │   ├── (auth)/               # Login, Register, Verify, Reset
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   └── layout.tsx
│       │   ├── (dashboard)/          # Protected routes with sidebar
│       │   │   ├── layout.tsx        # Persistent sidebar + topbar
│       │   │   ├── page.tsx          # Dashboard overview
│       │   │   ├── gigs/
│       │   │   ├── proposals/
│       │   │   ├── messages/
│       │   │   ├── payments/
│       │   │   ├── profile/
│       │   │   ├── reviews/
│       │   │   ├── analytics/
│       │   │   └── settings/
│       │   ├── (admin)/              # Admin-only routes
│       │   │   ├── layout.tsx
│       │   │   ├── users/
│       │   │   ├── gigs/
│       │   │   ├── payments/
│       │   │   └── analytics/
│       │   ├── api/
│       │   │   ├── auth/             # Clerk webhooks / Auth.js
│       │   │   ├── gigs/
│       │   │   ├── proposals/
│       │   │   ├── payments/
│       │   │   ├── reviews/
│       │   │   ├── notifications/
│       │   │   ├── search/
│       │   │   ├── ai/
│       │   │   │   ├── match/        # AI job matching endpoint
│       │   │   │   └── recommend/    # Freelancer recommendation
│       │   │   └── admin/
│       │   ├── globals.css
│       │   └── layout.tsx            # Root layout
│       ├── components/
│       │   ├── ui/                   # shadcn/ui generated components
│       │   ├── layout/
│       │   │   ├── sidebar.tsx
│       │   │   ├── topbar.tsx
│       │   │   └── mobile-nav.tsx
│       │   ├── gigs/
│       │   ├── proposals/
│       │   ├── payments/
│       │   ├── chat/
│       │   ├── reviews/
│       │   ├── analytics/
│       │   └── shared/
│       ├── lib/
│       │   ├── db/
│       │   │   ├── index.ts          # Drizzle client (Supabase)
│       │   │   └── schema/           # All Drizzle schema files
│       │   ├── auth/
│       │   │   └── clerk.ts
│       │   ├── ai/
│       │   │   ├── match.ts          # HuggingFace embedding logic
│       │   │   └── recommend.ts
│       │   ├── payments/
│       │   │   ├── razorpay.ts
│       │   │   └── stripe.ts
│       │   ├── socket/
│       │   │   └── server.ts
│       │   ├── validations/          # All Zod schemas
│       │   ├── hooks/                # Custom React hooks
│       │   ├── queries/              # TanStack Query query functions
│       │   └── utils.ts
│       ├── types/
│       │   └── index.ts
│       ├── middleware.ts             # Clerk auth middleware + RBAC
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── drizzle.config.ts
├── server/                           # Standalone Express + Socket.IO server
│   ├── index.ts
│   ├── socket/
│   │   ├── chat.ts
│   │   └── notifications.ts
│   └── middleware/
├── packages/
│   └── shared/                       # Shared types, Zod schemas, utils
├── drizzle/
│   └── migrations/
├── .env.example
└── README.md
```

---

## 4. DATABASE SCHEMA (SUPABASE + DRIZZLE ORM)

> All tables live in Supabase PostgreSQL. Use Drizzle ORM for all queries. Never write raw SQL in application code — use Drizzle's query builder.

### Collections / Tables

```typescript
// lib/db/schema/index.ts — Export all tables from here

// Core tables:
users            // Base user (id, email, role, createdAt, clerkId)
freelancers      // Extended profile (userId FK, skills[], bio, hourlyRate, location, reputationScore)
clients          // Extended profile (userId FK, company, location)
gigs             // Job postings (clientId FK, title, description, budget, milestones[], status, location)
proposals        // Bids (freelancerId FK, gigId FK, bidAmount, deliveryDays, description, status)
reviews          // (reviewerId FK, revieweeId FK, gigId FK, rating, comment, weightedScore, isVerified)
messages         // (senderId FK, receiverId FK, gigId FK, content, fileUrl, readAt)
payments         // (gigId FK, clientId FK, freelancerId FK, amount, status, gateway, escrowStatus)
notifications    // (userId FK, type, payload JSON, readAt)
disputes         // (gigId FK, raisedBy FK, reason, evidence[], status, resolvedBy FK)
adminLogs        // (adminId FK, action, targetType, targetId, metadata JSON, createdAt)
```

### Drizzle Setup

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://...           # Supabase connection string
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_WEBHOOK_SECRET=...

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

HUGGINGFACE_API_KEY=...

RESEND_API_KEY=...

NEXT_PUBLIC_SOCKET_URL=...
```

---

## 5. AUTHENTICATION & RBAC

### Provider: Clerk (Primary)

- Use **Clerk** for authentication. All user sessions, JWTs, and OAuth are managed by Clerk.
- On user registration, sync to Supabase `users` table via **Clerk webhook** (`user.created` event).
- Store `clerkId` in the `users` table as the bridge key.

### Middleware (Next.js)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/login(.*)', '/register(.*)', '/api/webhooks(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect();
  // RBAC: check role metadata for admin routes
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== 'admin') {
      return Response.redirect(new URL('/dashboard', req.url));
    }
  }
});
```

### RBAC Rules
| Route Group | Allowed Roles |
|-------------|---------------|
| `/(auth)/*` | Public |
| `/(dashboard)/*` | `client`, `freelancer`, `admin` |
| `/(admin)/*` | `admin` only |
| `/api/admin/*` | `admin` only (server-side check) |

> **Rule:** RBAC is ALWAYS enforced server-side in Route Handlers / Server Actions. UI-level hiding is supplementary only.

### Two-Factor Authentication
- Enable Clerk's built-in 2FA (TOTP) for all roles.
- Admin accounts: 2FA is **mandatory**.

---

## 6. CORE MODULES — FEATURE SPECIFICATION

### Module 1: Multi-Role Authentication System
- JWT authentication via Clerk
- Role-based access control (RBAC) — `client | freelancer | admin`
- Google OAuth login (configured in Clerk dashboard)
- Email verification system (Clerk + Resend for custom emails)
- Password reset with token (Clerk managed)
- Two-Factor Authentication (2FA) — TOTP via Clerk

---

### Module 2: AI-Powered Job Matching
- **Engine:** HuggingFace sentence-transformers via Vercel AI SDK
- **Flow:** On gig creation → embed gig description → query top-N freelancers by cosine similarity + location proximity + reputation score
- **Features:**
  - AI matching algorithm for gigs (HuggingFace AI)
  - Skill similarity scoring (cosine similarity on embeddings)
  - Personalized freelancer recommendations
  - Trending skills detection (aggregate query on `proposals` + `gigs`)

**API Route:** `POST /api/ai/match`
```typescript
// Input: { gigId: string }
// Output: { recommendations: FreelancerMatch[] }
// Rate limited: 20 req/min per user via Upstash Redis
```

---

### Module 3: Freelancer Professional Profiles
Freelancer profile includes:
- Skills with proficiency level (beginner / intermediate / expert)
- Portfolio gallery (Cloudinary uploads, max 20 items)
- Resume upload (PDF, Cloudinary)
- Certifications (title, issuer, year, URL)
- Work experience timeline
- Availability calendar (availability slots, booking system, auto-scheduling)
- Hourly & milestone pricing
- Verification badge system (admin-granted)
- Reputation score (computed, not manually set)

---

### Module 4: Gig / Project Marketplace

**Clients can:**
- Create gigs with budget ranges (fixed / hourly)
- Define milestones (title, amount, due date)
- Attach documents (Cloudinary)
- Invite specific freelancers
- Track progress

**Freelancers can:**
- Apply to gigs
- Submit proposals
- Track application status

**Gig Statuses:** `draft → open → in_progress → completed → cancelled | disputed`

---

### Module 5: Proposal & Bidding System
Freelancers submit:
- Proposal description
- Bid amount
- Estimated completion time

Clients can:
- Accept proposal (triggers contract creation + escrow payment)
- Negotiate price (counter-offer message thread)
- Reject proposal

**Proposal Statuses:** `pending → accepted | rejected | withdrawn | countered`

---

### Module 6: Real-Time Chat + Collaboration
Built using **Socket.IO** (standalone Express server) + **Supabase Realtime** (fallback / presence).

Features:
- Instant messaging (text)
- File sharing (Cloudinary upload URLs)
- Typing indicators (`socket.emit('typing', ...)`)
- Message read receipts (store `readAt` in `messages` table)
- Video call integration (WebRTC — optional, Phase 2)

**Socket Events:**
```
join_room       → user joins a gig conversation room
send_message    → broadcast message to room
message_read    → update readAt on server
typing_start    → broadcast typing indicator
typing_stop     → stop typing indicator
```

---

### Module 7: Secure Payment System
**Gateway:** Razorpay (India primary) / Stripe (international)

Features:
- Escrow payments (client pays → funds held → released on milestone approval)
- Milestone payments (per-milestone release triggers)
- Automatic freelancer payout (post approval, Razorpay/Stripe payout API)
- Refund management (dispute resolution triggers refund flow)
- Transaction history (full audit in `payments` table)

**Payment Flow:**
```
Client accepts proposal
  → Create payment order (Razorpay/Stripe)
  → Client pays → funds held in escrow
  → Freelancer submits milestone
  → Client approves → funds released
  → Freelancer payout initiated
```

---

### Module 8: Smart Reputation & Review System
Instead of simple ratings:

Features:
- Weighted reputation score (recency × rating × completion rate)
- Verified reviews (only post-gig-completion)
- Fraud detection for fake reviews (rate limiting + duplicate detection via Upstash)
- Review analytics (per freelancer dashboard)

**Score Formula:**
```
reputationScore = (avgRating × 0.4) + (completionRate × 0.3) + (responseRate × 0.2) + (recencyBoost × 0.1)
```

---

### Module 9: Admin Dashboard
Admin controls everything.

Features:
- Manage users (list, search, filter by role)
- Suspend accounts (set `status = 'suspended'`)
- Verify freelancers (grant verification badge)
- Approve gigs (review flagged gigs)
- Payment monitoring (all transactions, export CSV)
- Fraud detection (flagged reviews, duplicate accounts)

Admin Analytics:
- Platform revenue (sum of platform fee per payment)
- Active freelancers (count, trend chart)
- Top categories (skill/gig category aggregation)
- Job success rate (completed / total gigs)

---

### Module 10: Advanced Search Engine
Features:
- Location-based search (Supabase PostGIS or coordinate bounding box)
- Skill-based search (Supabase Full-Text Search on `skills[]`)
- Price range filters
- Rating filters
- Experience filters

**Implementation:** Supabase Full-Text Search (primary) / ElasticSearch (advanced option, Phase 2).

---

### Module 11: Notification System
Real-time notifications via Socket.IO + email via Resend.

Types:
- New gig posted (to matching freelancers)
- Proposal accepted (to freelancer)
- Payment received (to freelancer)
- Review added (to reviewed user)

Channels:
- In-app (Socket.IO push → stored in `notifications` table)
- Email notifications (Resend / Nodemailer)

---

### Module 12: Freelancer Availability Scheduler
Calendar system.

Features:
- Availability slots (set weekly recurring or specific dates)
- Booking system (client requests meeting → freelancer confirms)
- Automatic scheduling (suggest slots based on availability)

---

### Module 13: Dispute Resolution System
Triggered when payment issues arise.

Features:
- Dispute request (either party can raise)
- Admin mediation (admin reviews evidence, makes ruling)
- Evidence upload (screenshots, files via Cloudinary)
- Resolution system (refund / release / partial split)

**Dispute Statuses:** `open → under_review → resolved_client | resolved_freelancer | resolved_split`

---

### Module 14: Project Progress Tracker
Track work milestones.

Features:
- Task completion percentage (per milestone)
- File uploads (deliverable submission via Cloudinary)
- Progress logs (timestamped activity feed)
- Deadline reminders (cron job via Vercel Cron / Supabase Edge Functions)

---

### Module 15: Analytics Dashboard for Freelancers
Freelancers can see:
- Profile views (tracked on profile page load)
- Gig applications (applied / accepted / rejected counts)
- Earnings statistics (total, monthly, per gig)
- Monthly revenue chart (bar chart — Recharts)
- Client feedback analytics (rating breakdown, keyword themes)

---

## 7. API DESIGN RULES

- All API routes live under `app/api/` as Next.js Route Handlers.
- Every route handler MUST:
  1. Authenticate via Clerk (`auth()`) before any data access
  2. Validate input with Zod
  3. Enforce RBAC server-side
  4. Return consistent JSON shape: `{ data, error, meta }`
  5. Log sensitive actions to `adminLogs` table

```typescript
// Standard response shape
type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  meta?: { total?: number; page?: number; limit?: number };
};
```

- AI endpoints (`/api/ai/*`) MUST be rate-limited via Upstash Redis (20 req/min per user).
- Payment webhook endpoints MUST verify signatures (Razorpay HMAC / Stripe `stripe.webhooks.constructEvent`).
- Use **Server Actions** for form submissions where possible (co-located with Server Components).

---

## 8. FRONTEND & UI/UX STANDARDS

### UI/UX & ARCHITECTURE STANDARDS (SENIOR BAR)

**Goal:** Build a production-ready, senior-level data dashboard web app that is calm, clear, and fast. This is a tool interface, not a marketing page.

#### 1. App Architecture Requirements
* **Single Source of Truth:** Use a single source of truth for data (API/database). The UI reads from query cache, not random component state.
* **State Separation:**
    * Server state: TanStack Query
    * UI state: Local component state (Zustand/Context)
    * Form state: React Hook Form
* **Next.js Patterns:**
    * Use `/app/(dashboard)/layout.tsx` with a persistent sidebar.
    * Implement route-level loading and error boundaries.
    * Use Server Components for initial data fetching and Client Components for interactivity.

#### 2. Design Frameworks (Non-negotiable)
* **Information Architecture (IA):** Organize by user goals/decisions, not by features.
* **Cognitive Load Reduction:** Reduce visual noise; make scanning effortless.
* **Progressive Disclosure:** Default view is simple; advanced controls appear only when needed.
* **Perceived Performance:** UI should feel instant via optimistic updates, skeletons, and non-blocking interactions.

UI/UX Specifications (Senior Bar)
1) Layout & Hierarchy
  - Strict grid; consistent spacing scale.
  - Main content dominates; navigation is visually quiet.
  - No oversized logos/banners. This is a tool.

2) Color & Token System
  - Neutral base + **one accent** used only for primary actions/highlights.
  - System colors:
      - red = error/destructive
      - green = success
  - Contrast must be readable. Never use color as the only indicator.

3) Navigation
  - Persistent left sidebar:
      - grouped links
      - clear active state
      - settings/logout at bottom
  - Top bar only for global page actions + global search (optional).

4) Tables (Core Dashboard Utility)
Use TanStack Table features:
  - Search + filters + sort
  - Pagination (client or server)
  - Row selection with bulk actions (selection reveals contextual toolbar)
  - Column visibility + responsive columns

5) Charts (Keep them Functional)
  - Only line and bar charts.
  - Always include axes, labels, values, gridlines.
  - Tooltips on hover.
  - Choose chart approach:
      - Use **Recharts** for simple "business dashboards"
      - Use **ECharts** if dataset is large/high-frequency updates
         (Prefer functional clarity over fancy visuals.)

6) Interaction Patterns (Radix-backed)
  - **Popover** for small, non-blocking actions (display options, quick filters).
  - **Dialog/Modal** for complex or blocking flows (create/edit item).
  - **Toast notifications** for success/error/warning.
  - **Optimistic UI** for common mutations:
      - immediate UI update, rollback on failure
      - use TanStack Query optimistic updates or React's useOptimistic pattern

7) States & Trust (Must be designed)
For every data region/component, implement:
  - Loading (skeletons)
  - Empty state (clear CTA)
  - Error state (recoverable, retry)
  - Success confirmation (toasts)
     Users should never wonder "did that work?"

Data Layer Requirements (Be Explicit)
Define:
  - Data entities (e.g., Users, Projects, Links, Events, Metrics)
  - Which endpoints power which cards/tables/charts
  - Refresh strategy:
      - polling vs websocket vs manual refresh
  - Caching rules:
      - stale time, refetch on focus, invalidation on mutation (TanStack Query)

Security & "Responsible App" Defaults
  - Enforce RBAC/permissions server-side (not just UI hiding).
  - Validate all inputs with Zod on server.
  - Avoid exposing secrets to client.
  - Add basic audit logging hooks for key actions (create/update/delete).
  - Follow OWASP Top 10 mindset: secure defaults, least privilege, safe error handling.

Deliverables (What you must output)
1.  A working Next.js dashboard app scaffold:
      - routes, layout, sidebar, top actions
2.  One "Dashboard Overview" page with:
      - KPI cards
      - a table with filtering/sorting/selection + bulk actions
      - a line chart + bar chart
3.  A "Create/Edit" flow:
      - modal dialog form with validation + toast + optimistic update
4.  Fully implemented loading/empty/error states
5.  Clean, consistent component patterns and tokens

Final Quality Gate
  - Understandable in **<10 seconds**
  - Calm, professional, data-first
  - Accessible keyboard navigation (Radix primitives help here)
  - Fast-feeling interactions (optimistic updates + good loading UX)

---

### Component Conventions (SkillSphere-Specific)

```typescript
// Every page exports: generateMetadata + default page component (Server Component)
// Interactivity isolated to 'use client' child components

// Pattern: Page (Server) → Data fetched → passes to Client Component
export default async function GigsPage() {
  const gigs = await getGigs(); // Server-side fetch
  return <GigsTable initialData={gigs} />; // Client component hydrates TanStack Query
}
```

```typescript
// TanStack Query stale times
const QUERY_CONFIG = {
  gigs:          { staleTime: 30_000 },   // 30s
  freelancers:   { staleTime: 60_000 },   // 1min
  notifications: { staleTime: 0 },        // always fresh
  analytics:     { staleTime: 300_000 },  // 5min
};
```

---

## 9. AI INTEGRATION (VERCEL AI SDK)

### Job Matching Engine
```typescript
// lib/ai/match.ts
import { embed } from 'ai';

// 1. Embed gig description
// 2. Embed each freelancer's skill summary
// 3. Compute cosine similarity
// 4. Filter by location radius
// 5. Sort by: similarity score x reputation score
// 6. Return top 10 recommendations
```

### Streaming AI Responses (UI)
- Use `useChat` from `ai/react` for any conversational AI features.
- Use `streamObject` for structured AI outputs (e.g., proposal drafting assistant).
- All AI API routes MUST stream responses — never block on full completion.

### Rate Limiting (AI Endpoints)
```typescript
// All /api/ai/* routes
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
});
```

---

## 10. REAL-TIME LAYER (SOCKET.IO / SUPABASE REALTIME)

### Socket.IO (Chat + Typing)
- Standalone Express server (`server/index.ts`) running alongside Next.js.
- Client connects on dashboard mount, disconnects on unmount.
- All socket events require authenticated userId in handshake.

### Supabase Realtime (Notifications + Presence)
```typescript
// Use Supabase Realtime for notification broadcasting
const channel = supabase
  .channel(`notifications:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Update notification state
  })
  .subscribe();
```

---

## 11. PAYMENT INTEGRATION

### Razorpay (Primary — India)
- Create order server-side: `POST /api/payments/create-order`
- Verify webhook signature on: `POST /api/payments/razorpay-webhook`
- Escrow logic: store `escrowStatus: 'held'` on payment, update to `'released'` on milestone approval.

### Stripe (International)
- Use Payment Intents API for escrow-like behavior.
- Webhook: `POST /api/payments/stripe-webhook` — verify with `stripe.webhooks.constructEvent`.

### Payout
- Razorpay: use Razorpay X Payouts API.
- Stripe: use Stripe Connect (Express accounts for freelancers).

---

## 12. SECURITY STANDARDS

Follow **OWASP Top 10 (2025)** across all layers.

| Threat | Mitigation |
|--------|-----------|
| Broken Access Control | Server-side RBAC on every route + Server Action |
| Injection | Drizzle ORM parameterized queries only; Zod validation on all inputs |
| Auth failures | Clerk handles sessions; 2FA mandatory for admin |
| Insecure Design | Escrow payment model; dispute resolution before refund |
| Security Misconfiguration | `.env` secrets never exposed to client; Clerk keys server-only |
| Vulnerable Components | `npm audit` in CI; Dependabot enabled |
| Auth & Session | Clerk short-lived JWTs; refresh token rotation |
| Data Integrity | Webhook signature verification (Razorpay HMAC, Stripe) |
| Logging | `adminLogs` table for all create/update/delete actions |
| SSRF | Validate all external URLs (Cloudinary, webhooks) against allowlist |

### Rate Limiting
```typescript
// Applied to:
// - /api/ai/*       → 20 req/min per user
// - /api/payments/* → 10 req/min per user
// - /api/auth/*     → 5 req/min per IP (Clerk handles this)
```

### Input Validation — Always Zod
```typescript
// Every Server Action and Route Handler:
const schema = z.object({ ... });
const result = schema.safeParse(input);
if (!result.success) return { error: result.error.flatten() };
```

---

## 13. DEVELOPMENT TIMELINE

> **Deadline: 03 June 2026** — Screen-share demo required.

### Week 1 — Foundation
**Backend:**
- Authentication system (Clerk integration + Supabase sync webhook)
- User role management (RBAC middleware)
- Profile APIs (freelancer + client CRUD)
- Drizzle schema + initial migration

**Frontend:**
- Login / Register UI (Clerk components styled with shadcn/ui)
- Profile pages (freelancer + client)
- Dashboard layout (sidebar + topbar + route structure)

---

### Week 2 — Core Marketplace
**Backend:**
- Gig APIs (CRUD, search, filters)
- Proposal system (submit, accept, reject, counter)
- Search APIs (Supabase FTS + location filters)

**Frontend:**
- Gig marketplace UI (TanStack Table + filters)
- Proposal submission flow (React Hook Form + Zod)
- Search filters (Popover-based filter panel)

---

### Week 3 — Collaboration & Trust
**Backend:**
- Chat with Socket.IO (rooms, messages, typing, read receipts)
- Review & rating APIs (weighted score computation)
- Notification system (Socket.IO + Supabase Realtime + Resend emails)

**Frontend:**
- Messaging interface (real-time chat UI)
- Review UI (post-gig review form + display)
- Notifications (bell icon + notification panel)

---

### Week 4 — Payments, Admin & Polish
**Backend:**
- Payment integration (Razorpay + Stripe, escrow, milestone release, webhooks)
- Admin dashboard APIs (user management, analytics aggregations)
- Security improvements (rate limiting, audit logging, OWASP hardening)
- AI job matching endpoint (HuggingFace embeddings + Upstash rate limit)

**Frontend:**
- Payment UI (checkout flow, milestone tracker, transaction history)
- Admin dashboard (user table, analytics charts, moderation tools)
- Final UI polish (loading states, empty states, error boundaries, responsive)

---

## 14. AGENT BEHAVIOUR RULES

> These rules govern how AI coding agents (Cursor / Windsurf / Antigravity) must behave when working on this codebase.

### General Rules
1. **Never install packages not listed in Section 2.** Ask before adding a new dependency.
2. **Always use TypeScript.** No `.js` files in `apps/web/`. Strict mode enabled.
3. **Always validate with Zod** before any database write or external API call.
4. **Never write raw SQL.** Use Drizzle ORM query builder exclusively.
5. **Never hardcode secrets.** All env vars must come from `process.env.*` and be listed in `.env.example`.
6. **Always implement all four UI states:** loading (skeleton), empty (CTA), error (retry), success (toast).
7. **RBAC is server-side first.** Hiding UI elements is supplementary.
8. **Every mutation must invalidate the relevant TanStack Query cache key.**
9. **AI endpoints must be rate-limited** before the AI call is made.
10. **Log all admin actions** to `adminLogs` table with `adminId`, `action`, `targetType`, `targetId`.

### Code Style
- Use named exports for components, default exports for pages.
- Co-locate types with their feature (e.g., `gigs/types.ts`).
- Prefix Server Actions with `action` (e.g., `actionCreateGig`).
- Prefix query functions with `get` (e.g., `getGigById`).
- Use `cn()` from `lib/utils.ts` for all conditional class merging.
- shadcn/ui components live in `components/ui/` — do not modify them directly; wrap them.

### File Generation Order (when scaffolding a new module)
1. Drizzle schema (`lib/db/schema/moduleName.ts`)
2. Zod validation schema (`lib/validations/moduleName.ts`)
3. Database query functions (`lib/queries/moduleName.ts`)
4. API Route Handler (`app/api/moduleName/route.ts`)
5. TanStack Query hooks (`lib/hooks/useModuleName.ts`)
6. UI Components (`components/moduleName/`)
7. Page (`app/(dashboard)/moduleName/page.tsx`)

### Forbidden Patterns
- NO `any` type — use `unknown` and narrow
- NO `useEffect` for data fetching — use TanStack Query or Server Components
- NO inline styles — use Tailwind utility classes
- NO `console.log` in production code — use structured logging
- NO client-side only auth checks — always verify server-side
- NO direct Supabase client calls from Client Components — go through Route Handlers or Server Actions
- NO storing payment card data — delegate entirely to Razorpay/Stripe hosted flows

---

*This file is the single source of truth for all AI agents working on SkillSphere. When in doubt, refer back here before writing code.*
