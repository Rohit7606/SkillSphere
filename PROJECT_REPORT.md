# SkillSphere — Master Project Report

> **Organization:** Nayoda  
> **Project Type:** Full-Stack Dev Internship — Capstone Project  
> **Report Date:** 18 June 2026  
> **Version:** 1.0.0  
> **Status:** MVP — Feature Complete

---

## 1. Project Overview

SkillSphere is an intelligent, hyperlocal freelance ecosystem that connects **Clients** (people who need work done) with **Freelancers** (professionals who do the work) through an AI-powered matching engine, real-time collaboration tools, and a secure milestone-based escrow payment system. In plain language: it is a web-based marketplace — similar to Upwork or Fiverr — but optimized for geographic proximity and powered by machine learning to recommend the best freelancer for each job.

### Core Problem

Traditional freelance platforms rely on manual search and simple keyword matching, making it difficult for clients to discover the right talent quickly and for freelancers to surface their skills to the right audience. SkillSphere closes this gap by embedding AI-driven semantic matching directly into the gig lifecycle.

### Intended Users

| Role | Description |
|------|-------------|
| **Client** | Posts gigs, manages milestones, reviews freelancers, funds escrow payments |
| **Freelancer** | Builds a professional profile, discovers gigs, submits proposals, earns money |
| **Admin** | Moderates the platform, resolves disputes, manages users, views analytics |

### Current Status

**MVP — Feature Complete.** All 15 core modules defined in the project specification have been implemented. The application is functional in development mode with live Supabase data, Clerk authentication, Razorpay payment integration (test mode), and HuggingFace AI matching. It has not yet been deployed to production (Vercel deployment is planned as the final step).

---

## 2. Motivation & Genesis

SkillSphere was conceived as a capstone project for the **Nayoda Full-Stack Developer Internship Program**. The project brief required building a production-grade platform that demonstrates mastery of modern full-stack web development, including:

- Server-side rendering and the Next.js App Router pattern
- Relational database design with an ORM layer
- Third-party API integration (payments, AI, file storage)
- Real-time communication (WebSockets)
- Role-based access control and secure authentication
- Professional-grade UI/UX following senior dashboard design standards

### Inspirations & Prior Art

- **Upwork** — Marketplace model, proposal bidding system, milestone-based contracts
- **Fiverr** — Gig-centric interface, reputation scoring
- **Toptal** — Curated matching and vetting (inspiration for the AI matching component)
- **Linear** — Dashboard design aesthetic (calm, data-first, professional)

---

## 3. Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.6 | React meta-framework — App Router, Server Components, Server Actions, Route Handlers |
| React | 19.2.4 | UI component library |
| TypeScript | ^5 | Static type safety across the entire codebase |
| Tailwind CSS | v4 (Oxide engine) | Utility-first styling with CSS variables and custom design tokens |
| shadcn/ui (Base Nova) | v4.7.0 | Pre-built, accessible Radix UI primitives styled with Tailwind |
| TanStack Query | v5.100.11 | Server-state management (async data fetching, caching, mutations) |
| TanStack Table | v8.21.3 | Headless data grid (filtering, sorting, pagination, row selection) |
| Recharts | v3.8.1 | Chart library for the analytics dashboard |
| React Hook Form | v7.76.0 | Performant form state management |
| Zod | v4.4.3 | Schema validation for form inputs and API payloads |
| Zustand | v5.0.13 | Lightweight global UI state (imported but minimally used — server state is preferred) |
| Lucide React | v1.16.0 | Icon library |
| Socket.IO Client | v4.8.3 | Real-time WebSocket communication with the Express server |
| Sonner | v2.0.7 | Toast notification system |
| date-fns | v4.2.1 | Date formatting and manipulation utilities |
| next-themes | v0.4.6 | Theme switching (currently forced to light/bright dashboard mode) |
| tw-animate-css | v1.4.0 | Animation utilities for Tailwind CSS |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime environment |
| Next.js Route Handlers | 16.2.6 | RESTful API endpoints co-located with the frontend |
| Next.js Server Actions | 16.2.6 | Form submissions and mutations via `"use server"` |
| Express.js | v4.19.2 | Standalone server for Socket.IO (real-time messaging) |
| Drizzle ORM | v0.45.2 | Type-safe SQL query builder for PostgreSQL |
| Drizzle Kit | v0.31.10 | Migration tooling for Drizzle schemas |
| postgres (porsager) | v3.4.9 | PostgreSQL client driver (used by Drizzle) |

### Database & Storage

| Service | Purpose |
|---------|---------|
| **Supabase** (PostgreSQL) | Primary relational database — hosted PostgreSQL with built-in auth extensions |
| **Cloudinary** | Image/file storage — portfolio images, avatars, chat attachments |
| **Upstash Redis** | Rate limiting for AI endpoints (sliding window: 20 req/min/user) |

### Authentication

| Service | Purpose |
|---------|---------|
| **Clerk** (v7.3.7) | Managed authentication — JWT sessions, OAuth (Google), email verification, 2FA |

### AI / Machine Learning

| Service | Purpose |
|---------|---------|
| **HuggingFace Inference API** | Sentence-transformer model (`all-MiniLM-L6-v2`) for semantic similarity between gig descriptions and freelancer profiles |
| **Vercel AI SDK** (v6.0.185) | SDK imported for AI streaming (available for future `useChat`/`useCompletion` patterns) |

### Payments

| Service | Purpose |
|---------|---------|
| **Razorpay** (v2.9.6) | Payment gateway — test mode order creation, payment verification, webhook handling |

### Dev Tooling

| Tool | Purpose |
|------|---------|
| ESLint (v9) + eslint-config-next | Linting and code quality |
| React Compiler (babel-plugin-react-compiler v1.0.0) | Automatic memoization — no manual `useMemo`/`useCallback` required |
| PostCSS + @tailwindcss/postcss | CSS processing pipeline |
| concurrently | Runs Next.js dev server and Express Socket.IO server in parallel |
| nodemon + ts-node | Hot-reloading TypeScript execution for the Express server |
| dotenv | Environment variable loading from `.env` files |

---

## 4. System Architecture

### High-Level Architecture

SkillSphere follows a **monorepo architecture** managed via npm workspaces. It consists of three primary packages:

```
┌─────────────────────────────────────────────────────────┐
│                    npm Workspaces Root                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  apps/web    │  │   server     │  │ packages/     │  │
│  │  (Next.js)   │  │  (Express)   │  │  shared       │  │
│  │              │  │              │  │  (Zod types)  │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
│         │                 │                              │
└─────────┼─────────────────┼──────────────────────────────┘
          │                 │
          │  HTTP/REST      │  WebSocket (Socket.IO)
          ▼                 ▼
  ┌───────────────────────────────┐
  │        Supabase (PostgreSQL)  │
  └───────────────────────────────┘
          │
  ┌───────┴───────────────────────┐
  │  External Services            │
  │  • Clerk (Auth)               │
  │  • Razorpay (Payments)        │
  │  • Cloudinary (Files)         │
  │  • HuggingFace (AI)           │
  │  • Upstash Redis (Rate Limit) │
  └───────────────────────────────┘
```

### Component Relationships

1. **apps/web (Next.js 16)** — The primary application. Contains all frontend pages, API Route Handlers, Server Actions, and the Drizzle ORM schema. It communicates directly with Supabase for data persistence, Clerk for authentication, Razorpay for payments, Cloudinary for file uploads, and HuggingFace for AI matching.

2. **server (Express + Socket.IO)** — A lightweight standalone server responsible exclusively for real-time features: chat messaging, typing indicators, and push notifications. Next.js posts to this server's `/api/notify` endpoint to trigger real-time notifications to specific users via their Clerk ID.

3. **packages/shared** — A shared library containing Zod validation schemas and TypeScript types used across both the web app and the server.

### Data Flow: From User Input to Final Output

**Example: Client Posts a Gig → Freelancer Gets AI-Matched**

1. Client fills out the "Create Gig" modal form (`CreateGigModal` component).
2. Form data is validated client-side with React Hook Form + Zod.
3. The `createGigAction` Server Action is invoked.
4. Server Action authenticates via `auth()` from Clerk, resolves the internal user and client profile from Supabase, and inserts the gig record via Drizzle ORM.
5. `revalidatePath('/dashboard/gigs')` invalidates the Next.js cache.
6. On the gig detail page, the client can trigger "Find AI Matches."
7. A `POST /api/ai/match` request is sent with the `gigId`.
8. The API route rate-limits via Upstash Redis, fetches the gig description from Supabase, retrieves all freelancer profiles, sends the gig description and freelancer bios to HuggingFace's sentence similarity model, receives cosine similarity scores, ranks freelancers, and returns the top 5 matches.

**Example: Escrow Payment Flow**

1. Client accepts a proposal → `POST /api/proposals/[id]/accept` updates proposal status and sends a notification to the freelancer via the Socket.IO server.
2. Client clicks "Fund Escrow" → `POST /api/payments/create-order` creates a Razorpay order.
3. Razorpay checkout modal opens in the browser.
4. After payment, `POST /api/payments/verify` verifies the payment signature, inserts a `payments` record with `escrowStatus: 'held'`, and updates the gig status to `in_progress`.
5. As milestones are completed and approved, when all milestones reach `completed`, the escrow is released (`escrowStatus: 'released'`).

---

## 5. Project Structure

```
skillsphere/                                        # Monorepo root
├── .env                                            # Root environment variables (shared by all workspaces)
├── .gitignore                                      # Git ignore rules (excludes .env, node_modules, .next, etc.)
├── AGENTS.md                                       # AI agent system instructions (32KB specification document)
├── PLAN.md                                         # Master development ledger (milestones, squad status)
├── gemini.md                                       # Project constitution — data schemas, behavioral rules
├── findings.md                                     # Research discoveries and tech constraints
├── progress.md                                     # Development activity log
├── task_plan.md                                    # Phased task breakdown (5 phases)
├── package.json                                    # Root workspace manifest (npm workspaces)
├── package-lock.json                               # Lockfile (~478KB)
├── Nayoda - Full Stack Dev Internship (Project).pdf # Original project brief (PDF)
│
├── apps/
│   └── web/                                        # Next.js 16 Application
│       ├── .env                                    # Web-specific environment variables
│       ├── .gitignore                              # Web-specific ignore rules
│       ├── AGENTS.md                               # Web-specific agent instructions
│       ├── CLAUDE.md                               # Minimal agent marker file
│       ├── README.md                               # Default Next.js readme
│       ├── package.json                            # Web app dependencies (40+ packages)
│       ├── next.config.ts                          # Next.js config (React Compiler, Server Action body limit)
│       ├── drizzle.config.ts                       # Drizzle Kit config (schema path, migration output)
│       ├── tsconfig.json                           # TypeScript compiler options
│       ├── eslint.config.mjs                       # ESLint flat config (Core Web Vitals + TypeScript)
│       ├── postcss.config.mjs                      # PostCSS with @tailwindcss/postcss plugin
│       ├── components.json                         # shadcn/ui configuration (Base Nova style, Lucide icons)
│       ├── middleware.ts                            # Clerk auth middleware + RBAC route matcher
│       │
│       ├── app/                                    # Next.js App Router — all routes and layouts
│       │   ├── layout.tsx                          # Root layout (ClerkProvider, QueryProvider, Toaster, fonts)
│       │   ├── page.tsx                            # Root page — redirects to /dashboard
│       │   ├── globals.css                         # Global CSS — design tokens, animations, utility classes
│       │   ├── favicon.ico                         # App favicon
│       │   │
│       │   ├── (auth)/                             # Auth route group (public)
│       │   │   ├── layout.tsx                      # Glassmorphism centered card layout
│       │   │   ├── login/page.tsx                  # Clerk SignIn component
│       │   │   └── register/page.tsx               # Clerk SignUp component
│       │   │
│       │   ├── onboarding/                         # Post-registration role selection
│       │   │   └── page.tsx                        # Client vs Freelancer role picker
│       │   │
│       │   ├── (dashboard)/                        # Protected dashboard route group
│       │   │   ├── layout.tsx                      # Sidebar + Topbar persistent layout with auth gate
│       │   │   └── dashboard/
│       │   │       ├── page.tsx                    # Dashboard overview (KPI cards, revenue chart, activity feed)
│       │   │       ├── loading.tsx                 # Skeleton loading state
│       │   │       ├── error.tsx                   # Error boundary with retry button
│       │   │       ├── gigs/
│       │   │       │   ├── page.tsx                # Gig list with server-side data fetching
│       │   │       │   ├── client-page.tsx         # Client-side interactive gig table
│       │   │       │   └── [id]/page.tsx           # Gig detail (milestones, proposals, AI matching, chat)
│       │   │       ├── proposals/page.tsx          # Proposals management page
│       │   │       ├── messages/page.tsx           # Real-time chat interface
│       │   │       ├── payments/page.tsx           # Payment history and escrow status
│       │   │       ├── profile/page.tsx            # User profile editor with portfolio gallery
│       │   │       ├── reviews/page.tsx            # Reviews and reputation analytics
│       │   │       ├── search/page.tsx             # Advanced gig search engine
│       │   │       ├── analytics/page.tsx          # Freelancer analytics dashboard (charts)
│       │   │       ├── bookings/page.tsx           # Meeting scheduler and calendar
│       │   │       ├── settings/page.tsx           # Account settings
│       │   │       └── freelancers/
│       │   │           └── [id]/page.tsx           # Public freelancer profile view
│       │   │
│       │   ├── (admin)/                            # Admin route group
│       │   │   ├── layout.tsx                      # Admin sidebar layout
│       │   │   └── admin/
│       │   │       ├── page.tsx                    # Admin dashboard (platform stats, user list)
│       │   │       ├── users/page.tsx              # User management (suspend/activate)
│       │   │       └── disputes/page.tsx           # Dispute resolution interface
│       │   │
│       │   ├── actions/                            # Server Actions ("use server")
│       │   │   ├── onboarding.ts                   # User registration and profile creation
│       │   │   ├── gigs.ts                         # Create/delete gig actions
│       │   │   ├── profile.ts                      # Profile update, portfolio upload, avatar upload
│       │   │   └── chat.ts                         # Chat file attachment upload (Cloudinary)
│       │   │
│       │   └── api/                                # API Route Handlers
│       │       ├── gigs/
│       │       │   ├── route.ts                    # GET all gigs
│       │       │   └── [id]/milestones/route.ts    # POST create / PATCH update milestone
│       │       ├── proposals/
│       │       │   ├── route.ts                    # POST submit proposal (Zod validated)
│       │       │   └── [id]/
│       │       │       ├── accept/route.ts         # POST accept proposal + notify freelancer
│       │       │       └── decline/route.ts        # POST reject proposal
│       │       ├── payments/
│       │       │   ├── create-order/route.ts       # POST create Razorpay order
│       │       │   ├── verify/route.ts             # POST verify payment + fund escrow
│       │       │   └── razorpay-webhook/route.ts   # POST Razorpay webhook (HMAC verification)
│       │       ├── reviews/route.ts                # POST create review (verified gig completion)
│       │       ├── messages/
│       │       │   ├── route.ts                    # GET/POST chat messages
│       │       │   └── conversations/route.ts      # GET list of active conversations
│       │       ├── notifications/
│       │       │   ├── route.ts                    # GET user notifications
│       │       │   └── [id]/read/route.ts          # PATCH mark notification as read
│       │       ├── search/route.ts                 # POST search gigs (text, budget, location filters)
│       │       ├── ai/match/route.ts               # POST AI job matching (HuggingFace + Upstash rate limit)
│       │       ├── bookings/route.ts               # GET/POST/PUT bookings (meeting scheduler)
│       │       ├── disputes/route.ts               # POST raise dispute (Zod validated)
│       │       └── admin/
│       │           ├── users/[id]/suspend/route.ts # POST toggle user suspension
│       │           └── disputes/[id]/resolve/route.ts # POST resolve dispute (escrow release)
│       │
│       ├── components/                             # Reusable React components
│       │   ├── ui/                                 # shadcn/ui generated primitives
│       │   │   ├── button.tsx                      # Button variants (CVA)
│       │   │   ├── dialog.tsx                      # Modal dialog (Radix UI)
│       │   │   ├── input.tsx                       # Text input
│       │   │   ├── textarea.tsx                    # Multi-line input
│       │   │   └── sonner.tsx                      # Toast notification wrapper
│       │   ├── layout/
│       │   │   ├── sidebar.tsx                     # Collapsible navigation sidebar (expand-on-hover)
│       │   │   ├── topbar.tsx                      # Top bar (search, notifications, user button)
│       │   │   └── notification-bell.tsx           # Real-time notification dropdown (Socket.IO)
│       │   ├── gigs/
│       │   │   ├── create-gig-modal.tsx            # Gig creation form modal
│       │   │   ├── create-milestone-modal.tsx      # Milestone creation form modal
│       │   │   ├── columns.tsx                     # TanStack Table column definitions
│       │   │   ├── data-table.tsx                  # Generic data table wrapper
│       │   │   ├── ai-match-panel.tsx              # AI freelancer recommendation panel
│       │   │   ├── project-progress-tracker.tsx    # Milestone progress visualization
│       │   │   ├── raise-dispute-button.tsx        # Dispute trigger button
│       │   │   └── raise-dispute-modal.tsx         # Dispute form modal
│       │   ├── proposals/
│       │   │   ├── proposal-list.tsx               # Proposal cards with accept/decline actions
│       │   │   └── submit-proposal-modal.tsx       # Proposal submission form modal
│       │   ├── payments/
│       │   │   ├── fund-escrow-button.tsx          # Razorpay checkout trigger
│       │   │   └── download-csv-button.tsx         # Payment history CSV export
│       │   ├── chat/
│       │   │   └── chat-room.tsx                   # Full chat interface (Socket.IO + REST messages)
│       │   ├── reviews/
│       │   │   ├── leave-review-modal.tsx          # Review submission form modal
│       │   │   ├── review-card.tsx                 # Individual review display card
│       │   │   └── review-analytics.tsx            # Rating breakdown chart
│       │   ├── search/
│       │   │   └── search-engine.tsx               # Advanced search with filters
│       │   ├── profile/
│       │   │   ├── profile-header.tsx              # Profile display/edit with avatar upload
│       │   │   ├── portfolio-gallery.tsx           # Image portfolio with upload (Cloudinary)
│       │   │   ├── skills-section.tsx              # Skills tag display
│       │   │   └── pricing-card.tsx                # Hourly rate display card
│       │   ├── dashboard/
│       │   │   └── revenue-chart.tsx               # Recharts revenue/earnings line chart
│       │   ├── bookings/
│       │   │   └── book-meeting-modal.tsx          # Meeting scheduling form modal
│       │   └── admin/
│       │       ├── admin-sidebar.tsx               # Admin navigation sidebar
│       │       ├── suspend-user-button.tsx         # User suspension toggle button
│       │       └── resolve-dispute-actions.tsx     # Dispute resolution action buttons
│       │
│       ├── lib/                                    # Shared logic and configuration
│       │   ├── db/
│       │   │   ├── index.ts                        # Drizzle client initialization (singleton pattern)
│       │   │   └── schema/index.ts                 # All 11 Drizzle table definitions
│       │   ├── providers/
│       │   │   └── query-provider.tsx              # TanStack Query client provider
│       │   ├── queries/
│       │   │   └── gigs.ts                         # Client-side query function for fetching gigs
│       │   ├── notifications.ts                    # Server-side notification helper (DB insert + Socket push)
│       │   └── utils.ts                            # cn() utility (clsx + tailwind-merge)
│       │
│       ├── scripts/
│       │   └── debug-gigs.ts                       # Debug script for inspecting gig data
│       │
│       └── public/                                 # Static assets
│           ├── file.svg, globe.svg, next.svg       # Default Next.js SVGs
│           ├── vercel.svg, window.svg              # Default Next.js SVGs
│           └── (no custom static assets)
│
├── server/                                         # Standalone Express + Socket.IO Server
│   ├── index.ts                                    # Server entry — WebSocket event handlers, REST notify endpoint
│   ├── package.json                                # Server dependencies (Express, Socket.IO, cors, dotenv)
│   └── tsconfig.json                               # Server TypeScript config (CommonJS, ES2022 target)
│
├── packages/
│   └── shared/                                     # Shared library
│       ├── index.ts                                # Exported Zod schemas and TypeScript types
│       ├── package.json                            # Shared package manifest (Zod dependency)
│       └── tsconfig.json                           # Shared TypeScript config
│
├── architecture/                                   # Architecture documentation directory
│   └── .gitkeep                                    # Placeholder (no SOPs written yet)
│
├── tools/                                          # Deterministic execution scripts
│   ├── .gitkeep                                    # Placeholder
│   └── verify_env.js                               # DNS resolution test for HuggingFace API connectivity
│
├── scratch/                                        # Developer debugging scripts (not committed)
│   ├── check_gig_status.ts                         # Inspect all gigs in the database
│   ├── check_payments.ts                           # Inspect payments, freelancers, and clients
│   └── check_proposals.ts                          # Inspect proposals for a specific gig
│
└── Reference Images/                               # Design reference screenshots (not committed)
    ├── image.png, image copy.png, image copy 2.png # UI mockup references
```

---

## 6. Core Features & Modules

### Module 1: Multi-Role Authentication System

**What it does:** Handles user registration, login, session management, and role-based access control via Clerk.

**Key files:**
- `middleware.ts` — Clerk middleware that protects all non-public routes and enforces RBAC for admin routes
- `(auth)/login/page.tsx` — Embeds Clerk's `<SignIn>` component
- `(auth)/register/page.tsx` — Embeds Clerk's `<SignUp>` component
- `onboarding/page.tsx` — Post-registration role picker (Client vs Freelancer)
- `actions/onboarding.ts` — Server Action that creates the user record in Supabase and the corresponding role-specific profile (client or freelancer table)

**Implementation decisions:**
- RBAC enforcement for admin routes is defined in middleware but **temporarily disabled** for MVP demo purposes (any authenticated user can access `/admin`).
- Clerk's `clerkId` is stored in the `users` table as a bridge between Clerk sessions and internal database UUIDs.
- The onboarding flow creates minimal default data (e.g., `location: 'Remote'`, `skills: ['General']`) that the user can update later.

---

### Module 2: AI-Powered Job Matching

**What it does:** When a client opens a gig, they can request AI-powered freelancer recommendations. The system sends the gig description and all freelancer bios to HuggingFace's `all-MiniLM-L6-v2` sentence-transformer model, which returns cosine similarity scores. Freelancers are ranked by match percentage.

**Key files:**
- `api/ai/match/route.ts` — Core matching endpoint (rate-limited via Upstash Redis)
- `components/gigs/ai-match-panel.tsx` — Frontend panel displaying ranked recommendations

**Implementation decisions:**
- The system gracefully degrades if the HuggingFace API is unavailable — it falls back to sorting by reputation score and assigns descending mock percentages.
- Rate limiting is set to 20 requests/minute per user to control API costs.
- Only the top 5 matches are returned to the client.

---

### Module 3: Freelancer Professional Profiles

**What it does:** Freelancers can build rich profiles including a bio, skills list, hourly rate, location, portfolio gallery (with Cloudinary image uploads), and a computed reputation score.

**Key files:**
- `dashboard/profile/page.tsx` — Profile page with edit mode
- `components/profile/profile-header.tsx` — Editable profile header with avatar upload
- `components/profile/portfolio-gallery.tsx` — Portfolio image grid with upload functionality
- `components/profile/skills-section.tsx` — Skills tag display
- `components/profile/pricing-card.tsx` — Hourly rate card
- `actions/profile.ts` — Server Actions for profile updates and Cloudinary uploads
- `dashboard/freelancers/[id]/page.tsx` — Public freelancer profile view

**Implementation decisions:**
- Avatar and portfolio images are uploaded as base64 strings to Cloudinary via Server Actions (body size limit increased to 10MB in `next.config.ts`).
- The reputation score is stored as an integer in the database and computed from review data.

---

### Module 4: Gig / Project Marketplace

**What it does:** Clients create gigs (job postings) with a title, description, budget, and location. Gigs have a lifecycle: `draft → open → in_progress → completed → cancelled | disputed`.

**Key files:**
- `dashboard/gigs/page.tsx` — Server-side gig list page
- `dashboard/gigs/client-page.tsx` — Client-side interactive data table (TanStack Table)
- `dashboard/gigs/[id]/page.tsx` — Gig detail page (milestones, proposals, AI matching, chat, escrow)
- `components/gigs/create-gig-modal.tsx` — Gig creation form modal
- `components/gigs/columns.tsx` — TanStack Table column definitions
- `components/gigs/data-table.tsx` — Generic data table component
- `actions/gigs.ts` — Server Actions for creating and deleting gigs
- `api/gigs/route.ts` — GET all gigs API

**Implementation decisions:**
- Gig deletion performs a manual cascade delete of all child records (proposals, reviews, messages, payments, disputes) because foreign key `ON DELETE CASCADE` was not configured at the Drizzle schema level.
- The gig creation flow auto-creates a user and client profile if they don't exist (development convenience).

---

### Module 5: Proposal & Bidding System

**What it does:** Freelancers submit proposals (bids) on open gigs. Clients can accept or decline proposals. Accepting a proposal triggers a notification to the freelancer and sets the stage for escrow funding.

**Key files:**
- `dashboard/proposals/page.tsx` — Proposals management page
- `components/proposals/proposal-list.tsx` — Proposal cards with accept/decline actions
- `components/proposals/submit-proposal-modal.tsx` — Proposal submission form
- `api/proposals/route.ts` — POST submit proposal (Zod validated, duplicate check)
- `api/proposals/[id]/accept/route.ts` — Accept proposal + send notification
- `api/proposals/[id]/decline/route.ts` — Reject proposal

**Implementation decisions:**
- Duplicate proposal detection prevents a freelancer from submitting more than one proposal per gig.
- Proposals are validated with Zod: `bidAmount > 0`, `deliveryDays > 0`, `description` between 20–1000 characters.
- When a proposal is accepted, the gig status remains `open` until the client funds the escrow.

---

### Module 6: Real-Time Chat + Collaboration

**What it does:** Once a proposal is accepted, the client and freelancer can chat in real time via Socket.IO. Messages are persisted in the database and loaded on page refresh.

**Key files:**
- `dashboard/messages/page.tsx` — Chat interface with conversation list
- `components/chat/chat-room.tsx` — Full chat UI (message bubbles, typing indicators, file upload)
- `api/messages/route.ts` — GET/POST chat messages
- `api/messages/conversations/route.ts` — GET active conversations list
- `actions/chat.ts` — Cloudinary file upload for chat attachments
- `server/index.ts` — Socket.IO event handlers (`join_room`, `send_message`, `typing_start`, `typing_stop`)

**Implementation decisions:**
- Messages are stored in the `messages` table via REST API and broadcast in real time via Socket.IO.
- The conversation list is derived from accepted proposals — only parties with an accepted proposal can chat about a gig.
- The receiver is automatically determined: if the sender is the client, the receiver is the assigned freelancer, and vice versa.

---

### Module 7: Secure Payment System (Razorpay Escrow)

**What it does:** Implements milestone-based escrow payments via Razorpay. The client pays into escrow, funds are held until milestone approval, then released to the freelancer.

**Key files:**
- `dashboard/payments/page.tsx` — Payment history page
- `components/payments/fund-escrow-button.tsx` — Razorpay checkout trigger component
- `components/payments/download-csv-button.tsx` — CSV export of payment history
- `api/payments/create-order/route.ts` — Create Razorpay order
- `api/payments/verify/route.ts` — Verify payment and insert escrow record
- `api/payments/razorpay-webhook/route.ts` — Webhook handler with HMAC signature verification

**Implementation decisions:**
- In development, if Razorpay keys are set to `'dummy'`, a mock order is returned so developers can test the UI flow without live API calls.
- The verify endpoint requires an accepted proposal before allowing escrow funding.
- Escrow release is triggered when all milestones are completed (via the milestone API).

---

### Module 8: Smart Reputation & Review System

**What it does:** Verified reviews can only be submitted for completed gigs. Reviews include a rating (1–5), a comment, and a verification flag. The freelancer's reputation score is computed from review data.

**Key files:**
- `dashboard/reviews/page.tsx` — Reviews display with analytics
- `components/reviews/leave-review-modal.tsx` — Review submission form
- `components/reviews/review-card.tsx` — Individual review card
- `components/reviews/review-analytics.tsx` — Rating distribution chart
- `api/reviews/route.ts` — POST create review (authorization check, duplicate prevention)

**Implementation decisions:**
- Reviews are gated to completed gigs only.
- Duplicate review detection prevents the same user from reviewing the same gig twice.
- The `isVerified` flag is set to `true` by default since reviews are only allowed for completed gigs.

---

### Module 9: Admin Dashboard

**What it does:** Platform-wide control panel showing user counts, gig statistics, revenue metrics, and tools to suspend users and resolve disputes.

**Key files:**
- `(admin)/admin/page.tsx` — Admin overview with KPI cards and user list
- `(admin)/admin/users/page.tsx` — User management table
- `(admin)/admin/disputes/page.tsx` — Dispute resolution interface
- `components/admin/admin-sidebar.tsx` — Admin navigation sidebar
- `components/admin/suspend-user-button.tsx` — User suspension toggle
- `components/admin/resolve-dispute-actions.tsx` — Dispute resolution actions
- `api/admin/users/[id]/suspend/route.ts` — Toggle user suspension
- `api/admin/disputes/[id]/resolve/route.ts` — Resolve dispute (with escrow release)

**Implementation decisions:**
- Admin role verification is temporarily disabled in middleware for MVP demo purposes.
- Dispute resolution supports three outcomes: `resolved_client` (refund), `resolved_freelancer` (release to freelancer), `resolved_split` (partial refund).

---

### Module 10: Advanced Search Engine

**What it does:** Freelancers and clients can search for open gigs using text queries, budget range filters, and location filters.

**Key files:**
- `dashboard/search/page.tsx` — Search interface
- `components/search/search-engine.tsx` — Search form with filter controls
- `api/search/route.ts` — POST search endpoint with Drizzle `ilike` queries

**Implementation decisions:**
- Search uses PostgreSQL `ILIKE` pattern matching (case-insensitive) on gig title, description, and location columns.
- Results are limited to 50 and sorted by creation date descending.
- Only gigs with status `open` are included in search results.

---

### Module 11: Notification System

**What it does:** In-app push notifications via Socket.IO with database persistence. Notifications are triggered on key events (proposal accepted, milestone submitted, etc.).

**Key files:**
- `components/layout/notification-bell.tsx` — Notification dropdown in the topbar
- `lib/notifications.ts` — Server-side helper that inserts into the `notifications` table and pushes to the Socket.IO server
- `api/notifications/route.ts` — GET user notifications
- `api/notifications/[id]/read/route.ts` — PATCH mark as read
- `server/index.ts` — `/api/notify` REST endpoint that emits to user's private Socket room

**Implementation decisions:**
- Each user joins a private Socket.IO room identified by their Clerk ID on connection.
- The notification system is fire-and-forget: if the Socket.IO server is down, the notification is still persisted in the database and will be visible on next page load.

---

### Module 12: Freelancer Availability Scheduler

**What it does:** Clients can request meetings with freelancers by selecting time slots. Freelancers can confirm or cancel bookings. Confirmed bookings generate a (mock) Google Meet link.

**Key files:**
- `dashboard/bookings/page.tsx` — Meeting scheduler interface
- `components/bookings/book-meeting-modal.tsx` — Meeting request form
- `api/bookings/route.ts` — GET/POST/PUT bookings

**Implementation decisions:**
- Meeting links are mock-generated using `Math.random().toString(36)` — a real implementation would integrate with Google Calendar API.
- The `bookings` table tracks `freelancerId`, `clientId`, `startTime`, `endTime`, `status`, and `meetingLink`.

---

### Module 13: Dispute Resolution System

**What it does:** Either party can raise a dispute on a gig. The dispute marks the gig as `disputed` and creates a dispute record. Admins can resolve disputes, which triggers appropriate escrow actions.

**Key files:**
- `components/gigs/raise-dispute-button.tsx` — Trigger button
- `components/gigs/raise-dispute-modal.tsx` — Dispute form (reason + evidence URLs)
- `api/disputes/route.ts` — POST create dispute
- `api/admin/disputes/[id]/resolve/route.ts` — POST resolve dispute

**Implementation decisions:**
- Dispute creation validates with Zod: `reason` must be 20–2000 characters, `evidence` is an optional array of URLs.
- Resolution outcomes are: `resolved_client` (gig cancelled, refund), `resolved_freelancer` (gig completed, payment released), `resolved_split` (partial refund).

---

### Module 14: Project Progress Tracker

**What it does:** Milestones are stored as a JSON array within the `gigs` table. Freelancers can submit milestones for review, and clients can approve them. When all milestones are completed, the gig is auto-completed and the escrow is released.

**Key files:**
- `components/gigs/project-progress-tracker.tsx` — Milestone visualization component
- `components/gigs/create-milestone-modal.tsx` — Milestone creation form
- `api/gigs/[id]/milestones/route.ts` — POST create / PATCH update milestone status

**Implementation decisions:**
- Milestones use a JSON column rather than a separate table, simplifying queries but limiting relational integrity.
- Each milestone has an `id`, `title`, `amount`, `dueDate`, and `status` (`pending` → `submitted` → `completed`).
- Only the gig owner (client) can approve milestones; only the assigned freelancer can submit milestones for review.

---

### Module 15: Freelancer Analytics Dashboard

**What it does:** Data-driven analytics page showing profile views, earnings statistics, and monthly revenue trends using Recharts.

**Key files:**
- `dashboard/analytics/page.tsx` — Analytics page with charts and KPI cards
- `components/dashboard/revenue-chart.tsx` — Recharts revenue/earnings line chart

**Implementation decisions:**
- The revenue chart displays the last 6 months of payment data from the database.
- Analytics are rendered as a Server Component that fetches data directly from Supabase.

---

## 7. Configuration & Environment Setup

### Environment Variables

The project uses a `.env` file at the root and a duplicate in `apps/web/`. The following variables are required:

| Variable | Purpose | Required | Example Value |
|----------|---------|----------|---------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-side) | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side, read-only) | Yes | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side, full access) | Yes | `eyJhbGci...` |
| `CLERK_SECRET_KEY` | Clerk backend secret key | Yes | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend publishable key | Yes | `pk_test_...` |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret | No | `whsec_...` |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | Yes | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | Yes | `6wjnES...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | `dmrn5tkl3` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | `43723731...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | `zZo2xB8Q...` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | No* | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | No* | `gQAAAAAA...` |
| `HUGGINGFACE_API_KEY` | HuggingFace Inference API token | No* | `hf_...` |
| `RESEND_API_KEY` | Resend email API key | No | `re_eh3da...` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | Yes | `http://localhost:3001` |

\* Optional but recommended. Without Upstash, AI rate limiting is disabled. Without HuggingFace, AI matching falls back to reputation-based sorting.

### Configuration Files

| File | Purpose |
|------|---------|
| `.env` (root) | Shared environment variables loaded by both `server/` and `apps/web/` |
| `apps/web/.env` | Web-specific environment variables (loaded automatically by Next.js) |
| `apps/web/next.config.ts` | React Compiler enablement, Server Action body size limit (10MB) |
| `apps/web/drizzle.config.ts` | Drizzle Kit schema location and migration output path |
| `apps/web/tsconfig.json` | TypeScript compiler options (target ES2017, path aliases) |
| `apps/web/components.json` | shadcn/ui style configuration (Base Nova, neutral base, Lucide icons) |
| `apps/web/postcss.config.mjs` | PostCSS plugin chain (@tailwindcss/postcss) |
| `apps/web/eslint.config.mjs` | ESLint flat config (Next.js Core Web Vitals + TypeScript) |
| `server/tsconfig.json` | Server TypeScript config (CommonJS target for Express) |

### Security — What Must Never Be Committed

All `.env` files are excluded from version control via `.gitignore`. The following must never be committed:

- `DATABASE_URL` — Contains the database password
- `SUPABASE_SERVICE_ROLE_KEY` — Full database access bypass for RLS
- `CLERK_SECRET_KEY` — Allows impersonation of any user
- `RAZORPAY_KEY_SECRET` — Can create/capture payments
- `CLOUDINARY_API_SECRET` — Full Cloudinary account access
- `UPSTASH_REDIS_REST_TOKEN` — Full Redis access
- `HUGGINGFACE_API_KEY` — API billing key
- `RESEND_API_KEY` — Can send emails from the domain

---

## 8. Local Development Setup

### Prerequisites

Install the following tools before starting:

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Bundled with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |

Additionally, you will need active accounts and API keys for:

- [Supabase](https://supabase.com) — Create a project and obtain the connection string
- [Clerk](https://clerk.com) — Create an application and obtain publishable/secret keys
- [Razorpay](https://razorpay.com) — Create a test-mode account
- [Cloudinary](https://cloudinary.com) — Create a free account
- [Upstash](https://upstash.com) — Create a Redis database (optional)
- [HuggingFace](https://huggingface.co) — Create an API token (optional)

### Installation Steps

1. **Clone the repository:**

```bash
git clone https://github.com/Rohit7606/SkillSphere.git
cd SkillSphere
```

2. **Install all dependencies (root, web, server, shared):**

```bash
npm install
```

This command leverages npm workspaces to install dependencies for all three packages (`apps/web`, `server`, `packages/shared`) from a single root `package-lock.json`.

3. **Create environment files:**

```bash
# Copy the root .env template
cp .env.example .env

# Copy the web .env template
cp apps/web/.env.example apps/web/.env
```

If `.env.example` files don't exist, create `.env` files manually and populate them with the variables listed in Section 7.

4. **Set up the Supabase database:**

The database tables must be created in your Supabase project. You can do this by running the Drizzle migrations or by directly executing the SQL generated by Drizzle Kit:

```bash
cd apps/web
npx drizzle-kit push
```

This reads the schema from `lib/db/schema/index.ts` and pushes the table definitions to your Supabase PostgreSQL database.

5. **Verify the database connection:**

```bash
# From the project root
node -e "const pg = require('postgres'); const sql = pg(process.env.DATABASE_URL); sql\`SELECT 1\`.then(() => { console.log('Connected!'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"
```

### Running the Project

From the project root:

```bash
npm run dev
```

This uses `concurrently` to start both:
- **Next.js dev server** → `http://localhost:3000`
- **Socket.IO server** → `http://localhost:3001`

Alternatively, start them separately:

```bash
# Terminal 1 — Next.js
cd apps/web && npm run dev

# Terminal 2 — Socket.IO
cd server && npm run dev
```

### Running Tests

No automated test suite has been implemented yet. This is a known gap (see Section 11).

### Common Setup Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `DATABASE_URL is missing in environment variables` | `.env` file not created or `DATABASE_URL` not set | Create the `.env` file with a valid Supabase connection string |
| `Error: relation "users" does not exist` | Database tables not created | Run `npx drizzle-kit push` from `apps/web/` |
| `ClerkError: Publishable key not found` | Clerk keys not set in `.env` | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` |
| `ECONNREFUSED 127.0.0.1:3001` | Socket.IO server not running | Start the server with `npm run dev` from root or `cd server && npm run dev` |
| `npm ERR! code ERESOLVE` | Dependency conflicts | Delete `node_modules/` and `package-lock.json`, then run `npm install` again |
| `Error: Cannot find module 'ts-node'` | Server dev dependencies not installed | Run `npm install` from the project root (workspaces will install server deps) |
| `Cloudinary upload error` | Invalid Cloudinary credentials | Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

---

## 9. Key Design & Technical Decisions

### Why Next.js 16 App Router Over Pages Router

The App Router provides Server Components by default, enabling direct database access in page components without building separate API endpoints. This significantly reduces boilerplate for data fetching and eliminates the need for `getServerSideProps`. Server Actions further simplify form mutations.

### Why Drizzle ORM Over Prisma

Drizzle was chosen for its lightweight, TypeScript-first approach. Unlike Prisma, Drizzle does not require code generation or a separate client binary. The query builder API is closer to raw SQL, providing more control and transparency over generated queries. The trade-off is less built-in relation handling and no automatic migrations.

### Why Clerk Over Auth.js

Clerk provides a managed authentication solution with built-in UI components (`<SignIn>`, `<SignUp>`, `<UserButton>`), eliminating the need to design and maintain authentication forms. It handles OAuth, email verification, 2FA, and session management out of the box. The trade-off is vendor lock-in and a dependency on Clerk's infrastructure.

### Why Socket.IO in a Separate Express Server

Socket.IO cannot run natively inside Next.js API routes because Next.js uses serverless/edge functions that don't maintain persistent connections. A standalone Express server on port 3001 handles long-lived WebSocket connections, while Next.js communicates with it via HTTP POST to `/api/notify`.

### Why Milestones as JSON Instead of a Separate Table

Storing milestones as a JSON column within the `gigs` table simplifies CRUD operations — the entire milestone array is read and written atomically. The trade-off is that individual milestones cannot be queried or indexed independently, and there's no foreign key enforcement on milestone IDs.

### Why Razorpay Over Stripe

Razorpay was chosen as the primary payment gateway because the target market is India. Razorpay provides better INR support, lower transaction fees for Indian merchants, and native UPI integration. Stripe is referenced in the architecture document as an international fallback but has not been implemented.

### CSS Architecture: Bright Dashboard Mode

The design intentionally uses a **bright, light theme** (`--background: #EAEFFE`) rather than a dark mode. The `dark` class on `<html>` is overridden in `globals.css` to force the same light palette regardless of system preferences. This was a deliberate aesthetic choice to create a "professional SaaS dashboard" feel with a soft purple accent (`--accent-primary: #8B6CEF`).

### Database Connection Singleton Pattern

The Drizzle client uses a global variable (`globalForDb.postgresClient`) to prevent multiple connection pools during Next.js hot reloads in development. This is a standard pattern for ORMs in Next.js to avoid "too many connections" errors.

---

## 10. Security Considerations

### Secrets Management

- All sensitive credentials are stored in `.env` files that are excluded from version control via `.gitignore`.
- The `.gitignore` includes patterns for `*.env`, `.env`, `.env.local`, and all environment-specific variants.
- **Known Issue:** The current repository history contains committed `.env` files with live credentials (visible in git log). These credentials should be rotated immediately before any public deployment.

### Authentication & Authorization

- **Authentication** is handled entirely by Clerk. All protected routes pass through `clerkMiddleware()`, which enforces session validation before any route handler executes.
- **Authorization (RBAC)** is defined in middleware but **temporarily disabled** for admin routes during the MVP phase. The code is commented out with a note explaining the decision.
- Every API Route Handler independently verifies the user's identity via `auth()` from Clerk and resolves the internal database user before performing any operation.
- Ownership checks are performed for sensitive operations (e.g., only the gig owner can delete a gig, only the gig owner can accept proposals).

### Input Validation

- All user-facing API endpoints validate input with Zod schemas before processing.
- Proposals, disputes, and search queries all have defined Zod schemas with minimum/maximum length constraints.

### Payment Security

- The Razorpay webhook endpoint verifies the HMAC-SHA256 signature of incoming webhooks using the `RAZORPAY_WEBHOOK_SECRET`.
- The payment verify endpoint checks that the client owns the gig and that an accepted proposal exists before recording an escrow payment.

### Known Security Gaps

1. **Admin RBAC is disabled** — Any authenticated user can access `/admin` routes.
2. **No CSRF protection** — Server Actions and Route Handlers do not implement CSRF tokens (mitigated partially by Clerk's session cookies).
3. **No rate limiting on most endpoints** — Only the AI match endpoint is rate-limited via Upstash Redis.
4. **Committed credentials** — `.env` files with live API keys were committed in early git history. Keys should be rotated.
5. **CORS wildcard** — The Socket.IO server allows `origin: '*'` which should be restricted to the web app domain in production.

---

## 11. Known Issues & Limitations

### Bugs & Rough Edges

1. **Gig deletion cascade** — Foreign key `ON DELETE CASCADE` is not configured in the Drizzle schema, requiring manual deletion of child records in the `deleteGigAction` Server Action. If new related tables are added, the cascade logic must be updated manually.
2. **Admin role check disabled** — The middleware RBAC check for admin routes is commented out, meaning any logged-in user can access admin functionality.
3. **Razorpay signature verification not implemented** in `verify/route.ts` — The comment says "Optional: Verify Razorpay signature using crypto here in production" but the verification code is not present.
4. **Missing `users` import in `ai/match/route.ts`** — The route references `users` table in an `innerJoin` but imports it from the schema.

### Partially Implemented Features

1. **Email notifications (Resend/Nodemailer)** — The `RESEND_API_KEY` is configured but no email-sending logic has been implemented. Notifications are only in-app.
2. **Clerk webhook sync** (`user.created` event) — The architecture specifies syncing Clerk user creation to the Supabase `users` table via webhooks, but the onboarding flow uses a manual Server Action instead. `CLERK_WEBHOOK_SECRET` is empty.
3. **Video calls (WebRTC)** — Mentioned in the spec as Phase 2 but not implemented.
4. **Global search bar** — The topbar has a search input but it is not connected to any search functionality.
5. **Mobile navigation** — The mobile menu trigger button exists in the topbar but has no associated drawer/menu implementation.

### Performance Limitations

1. **N+1 query in conversations list** — The `conversations/route.ts` fetches the latest message for each conversation in a loop, which could be slow with many conversations.
2. **No pagination** — Most list endpoints (gigs, notifications, search results) have hard limits but no cursor or offset-based pagination.
3. **Full table scans** — The gigs API fetches all gigs without filtering by the current user's role or ownership.

### Platform Constraints

- The Socket.IO server must run alongside the Next.js server. On serverless platforms like Vercel, the Socket.IO server would need to be deployed separately (e.g., on Railway, Render, or a VPS).
- The `concurrently` dev script assumes both servers are on the same machine.

---

## 12. Development Timeline

Based on the git history and the `PLAN.md` ledger:

| Date/Phase | Milestone | Git Commit |
|-----------|-----------|------------|
| **Phase 1** | Blueprint & Data Schema — Reading spec, defining Zod schemas, populating `gemini.md`, `findings.md`, `task_plan.md` | Pre-initial commit |
| **Phase 2** | API Integrations — Verifying external service connectivity (Supabase, Clerk, Razorpay, Cloudinary, HuggingFace, Upstash) | Pre-initial commit |
| **Phase 3** | Architecture Setup — Monorepo scaffold (npm workspaces), Next.js 16 app creation, Express Socket.IO server, Drizzle ORM schema, Clerk middleware | Pre-initial commit |
| **Phase 4** | Core Modules — All 15 modules implemented (Auth, AI Matching, Profiles, Gig Marketplace, Proposals, Chat, Payments, Reviews, Admin, Search, Notifications, Scheduler, Disputes, Progress Tracker, Analytics) | Pre-initial commit |
| **Phase 5** | UI/UX Refinement — Senior Bar design standards, custom CSS tokens, glassmorphism auth layout, collapsible sidebar, premium dashboard header | Pre-initial commit |
| 2026-06-16 | Initial commit: full production-ready codebase pushed to Git | `076e6d2` |
| 2026-06-16 | Remove personal files and reference images | `1db3ef4` |
| 2026-06-16 | Clean repository of system scratchpad files | `5d6c5ce` |
| 2026-06-16 | Setup production gitignore and untrack agent metadata | `4b653ec` |
| 2026-06-18 | Payment update logic fix (from conversation history) | Post-initial commits |

The majority of development happened in a single intensive sprint prior to the initial commit. The git history shows a "big bang" commit pattern where the entire application was developed locally and then committed as a single production-ready snapshot.

---

## 13. Future Roadmap

### Short-Term Improvements (Next Steps)

1. **Re-enable admin RBAC** — Uncomment the role check in `middleware.ts` and configure Clerk metadata for admin users.
2. **Implement Razorpay signature verification** — Add `crypto.createHmac` verification in the `verify/route.ts` endpoint.
3. **Add foreign key cascades** — Update Drizzle schema to include `.onDelete('cascade')` on all foreign key references.
4. **Connect global search bar** — Wire the topbar search input to the existing `/api/search` endpoint.
5. **Add pagination** — Implement cursor-based or offset pagination for gigs, notifications, and search results.
6. **Rotate compromised credentials** — All API keys that were committed to git history must be rotated immediately.

### Medium-Term Feature Goals

1. **Clerk webhook integration** — Replace the manual onboarding flow with a `user.created` webhook that automatically syncs Clerk users to Supabase.
2. **Email notifications (Resend)** — Implement transactional emails for key events (proposal accepted, payment received, etc.).
3. **Mobile responsive navigation** — Build the mobile drawer menu.
4. **Automated testing** — Add unit tests for Server Actions and API routes, integration tests for the payment flow, and E2E tests with Playwright.
5. **Vercel deployment** — Deploy the Next.js app to Vercel and the Socket.IO server to Railway or Render.
6. **Production CORS** — Restrict Socket.IO CORS to the production domain.

### Long-Term Vision

1. **ElasticSearch integration** — Replace PostgreSQL `ILIKE` search with full-text search using ElasticSearch for better relevance and performance.
2. **Video calls (WebRTC)** — Integrate WebRTC video conferencing directly into the chat interface.
3. **Stripe integration** — Add Stripe as an international payment gateway alongside Razorpay.
4. **Advanced AI features** — Use Vercel AI SDK's streaming capabilities for real-time AI recommendations, auto-generated gig descriptions, and smart proposal suggestions.
5. **Supabase Realtime** — Replace or supplement Socket.IO with Supabase Realtime for presence and database change subscriptions.
6. **PostGIS location-based search** — Enable true geospatial queries for hyperlocal matching using Supabase's PostGIS extension.

---

## 14. Glossary

| Term | Definition |
|------|-----------|
| **Gig** | A job posting created by a client, describing work to be done, with a title, description, budget, and location |
| **Proposal** | A bid submitted by a freelancer on an open gig, including their price, timeline, and description of how they would complete the work |
| **Escrow** | A payment mechanism where funds are held by the platform (via Razorpay) until the client approves the work |
| **Milestone** | A discrete unit of work within a gig, with its own title, amount, due date, and completion status |
| **Reputation Score** | A computed numeric value representing a freelancer's overall quality, derived from review ratings, completion rate, and response rate |
| **RBAC** | Role-Based Access Control — restricting functionality based on the user's role (client, freelancer, admin) |
| **Clerk ID** | The unique identifier assigned to a user by Clerk's authentication system |
| **Server Action** | A Next.js feature that allows server-side functions to be called directly from client components using the `"use server"` directive |
| **Route Handler** | A Next.js feature that allows defining RESTful API endpoints as `route.ts` files within the `app/api/` directory |
| **Drizzle ORM** | A lightweight, type-safe Object-Relational Mapper for TypeScript that generates SQL queries from TypeScript code |
| **shadcn/ui** | A collection of reusable, accessible UI components built on Radix UI primitives and styled with Tailwind CSS |
| **TanStack Query** | A data-fetching and caching library for React that manages server state (formerly React Query) |
| **Socket.IO** | A library that enables real-time, bidirectional communication between web clients and servers via WebSockets |
| **Upstash Redis** | A serverless Redis service used for rate limiting and caching |
| **HuggingFace Inference API** | A hosted API for running machine learning models, used here for sentence similarity scoring |
| **Razorpay** | An Indian payment gateway that handles payment collection, order management, and webhook notifications |
| **Cloudinary** | A cloud-based media management service for image and file uploads, transformation, and delivery |

---

## 15. Appendix

### A. Raw Dependency List (apps/web)

**Production Dependencies:**

| Package | Version |
|---------|---------|
| @base-ui/react | ^1.5.0 |
| @clerk/nextjs | ^7.3.7 |
| @hookform/resolvers | ^5.2.2 |
| @tanstack/react-query | ^5.100.11 |
| @tanstack/react-table | ^8.21.3 |
| @upstash/ratelimit | ^2.0.8 |
| @upstash/redis | ^1.38.0 |
| ai (Vercel AI SDK) | ^6.0.185 |
| class-variance-authority | ^0.7.1 |
| cloudinary | ^2.10.0 |
| clsx | ^2.1.1 |
| date-fns | ^4.2.1 |
| drizzle-orm | ^0.45.2 |
| lucide-react | ^1.16.0 |
| next | 16.2.6 |
| next-themes | ^0.4.6 |
| postgres | ^3.4.9 |
| razorpay | ^2.9.6 |
| react | 19.2.4 |
| react-dom | 19.2.4 |
| react-hook-form | ^7.76.0 |
| recharts | ^3.8.1 |
| shadcn | ^4.7.0 |
| socket.io-client | ^4.8.3 |
| sonner | ^2.0.7 |
| tailwind-merge | ^3.6.0 |
| tw-animate-css | ^1.4.0 |
| zod | ^4.4.3 |
| zustand | ^5.0.13 |

**Dev Dependencies:**

| Package | Version |
|---------|---------|
| @tailwindcss/postcss | ^4 |
| @types/node | ^20 |
| @types/react | ^19 |
| @types/react-dom | ^19 |
| babel-plugin-react-compiler | 1.0.0 |
| dotenv | ^16.6.1 |
| drizzle-kit | ^0.31.10 |
| eslint | ^9 |
| eslint-config-next | 16.2.6 |
| tailwindcss | ^4 |
| typescript | ^5 |

### B. API Endpoint Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/gigs` | List all gigs | Required |
| POST | `/api/gigs/[id]/milestones` | Create a milestone | Required (Client owner) |
| PATCH | `/api/gigs/[id]/milestones` | Update milestone status | Required (Client or assigned Freelancer) |
| POST | `/api/proposals` | Submit a proposal | Required (Freelancer) |
| POST | `/api/proposals/[id]/accept` | Accept a proposal | Required (Client owner) |
| POST | `/api/proposals/[id]/decline` | Decline a proposal | Required (Client owner) |
| POST | `/api/payments/create-order` | Create Razorpay order | Required |
| POST | `/api/payments/verify` | Verify payment & fund escrow | Required (Client) |
| POST | `/api/payments/razorpay-webhook` | Handle Razorpay webhook | Signature verification |
| POST | `/api/reviews` | Create a review | Required (Gig participant) |
| GET | `/api/messages?gigId=` | Get messages for a gig | Required |
| POST | `/api/messages` | Send a message | Required |
| GET | `/api/messages/conversations` | List conversations | Required |
| GET | `/api/notifications` | Get user notifications | Required |
| PATCH | `/api/notifications/[id]/read` | Mark notification as read | Required |
| POST | `/api/search` | Search open gigs | None (public data) |
| POST | `/api/ai/match` | AI freelancer matching | Required (Rate limited) |
| GET | `/api/bookings` | List user bookings | Required |
| POST | `/api/bookings` | Create a booking | Required (Client) |
| PUT | `/api/bookings` | Confirm/cancel booking | Required |
| POST | `/api/disputes` | Raise a dispute | Required |
| POST | `/api/admin/users/[id]/suspend` | Toggle user suspension | Required (Admin*) |
| POST | `/api/admin/disputes/[id]/resolve` | Resolve a dispute | Required (Admin*) |

\* Admin role enforcement is currently disabled in middleware.

### C. Database Schema (11 Tables)

| Table | Primary Key | Foreign Keys | Purpose |
|-------|------------|-------------|---------|
| `users` | `id` (UUID) | — | Core user record (email, role, clerkId, status, avatarUrl) |
| `freelancers` | `id` (UUID) | `userId → users.id` | Freelancer profile (skills, bio, hourlyRate, location, portfolio, reputationScore) |
| `clients` | `id` (UUID) | `userId → users.id` | Client profile (company, location) |
| `gigs` | `id` (UUID) | `clientId → clients.id` | Job postings (title, description, budget, milestones JSON, status, location) |
| `proposals` | `id` (UUID) | `freelancerId → freelancers.id`, `gigId → gigs.id` | Freelancer bids (bidAmount, deliveryDays, description, status) |
| `reviews` | `id` (UUID) | `reviewerId → users.id`, `revieweeId → users.id`, `gigId → gigs.id` | Reviews (rating, comment, weightedScore, isVerified) |
| `messages` | `id` (UUID) | `senderId → users.id`, `receiverId → users.id`, `gigId → gigs.id` | Chat messages (content, fileUrl, readAt) |
| `payments` | `id` (UUID) | `gigId → gigs.id`, `clientId → clients.id`, `freelancerId → freelancers.id` | Payment records (amount, status, gateway, escrowStatus) |
| `notifications` | `id` (UUID) | `userId → users.id` | In-app notifications (type, payload JSON, readAt) |
| `disputes` | `id` (UUID) | `gigId → gigs.id`, `raisedBy → users.id`, `resolvedBy → users.id` | Disputes (reason, evidence JSON, status, resolvedBy) |
| `admin_logs` | `id` (UUID) | `adminId → users.id` | Audit log (action, targetType, targetId, metadata JSON) |
| `bookings` | `id` (UUID) | `freelancerId → freelancers.id`, `clientId → clients.id` | Meeting bookings (startTime, endTime, status, meetingLink, notes) |

### D. Standard API Response Shape

All API endpoints return responses in the following format:

```typescript
type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  meta?: { total?: number; page?: number; limit?: number };
};
```

### E. Socket.IO Events

| Event | Direction | Payload | Description |
|-------|----------|---------|-------------|
| `join_room` | Client → Server | `{ gigId: string }` | Join a gig conversation room |
| `send_message` | Client → Server | `{ gigId, senderId, content, fileUrl?, createdAt }` | Send a chat message |
| `receive_message` | Server → Client | Same as send_message | Broadcast received message to room |
| `typing_start` | Client → Server | `{ gigId, userId }` | Start typing indicator |
| `typing_stop` | Client → Server | `{ gigId, userId }` | Stop typing indicator |
| `new_notification` | Server → Client | Notification object | Push notification to specific user room |

### F. External Service Documentation Links

- **Next.js 16:** [nextjs.org/docs](https://nextjs.org/docs)
- **Clerk Authentication:** [clerk.com/docs](https://clerk.com/docs)
- **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Razorpay:** [razorpay.com/docs](https://razorpay.com/docs)
- **Cloudinary:** [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **HuggingFace Inference API:** [huggingface.co/docs/api-inference](https://huggingface.co/docs/api-inference)
- **Upstash Redis:** [upstash.com/docs/redis/overall/getstarted](https://upstash.com/docs/redis/overall/getstarted)
- **Socket.IO:** [socket.io/docs](https://socket.io/docs/v4)
- **TanStack Query:** [tanstack.com/query](https://tanstack.com/query/latest)
- **shadcn/ui:** [ui.shadcn.com](https://ui.shadcn.com)
- **Recharts:** [recharts.org](https://recharts.org)

---

*End of Master Project Report.*
