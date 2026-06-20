# SkillSphere — Hyperlocal AI-Powered Freelance Ecosystem 🌐

<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/7a95b78c-e44d-431a-b7a8-f2626fed10cc" />

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_(Oxide)-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-v7.3.7-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-v2.9.6-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-all--MiniLM--L6--v2-FFD21F?style=for-the-badge&logo=huggingface)](https://huggingface.co)
[![Status](https://img.shields.io/badge/Status-Deployed-8B6CEF?style=for-the-badge)](https://skill-sphere-web-chi.vercel.app)

---

## Problem Statement

- **Manual, Keyword-Only Discovery:** Platforms like Upwork and Fiverr rely on basic keyword search, burying high-quality freelancers whose profiles are simply worded differently from the search query.
- **No Proximity-Aware Matching:** Global marketplaces treat a client in Chennai the same as one in Berlin, with no native way to prioritize local talent for time zone, pricing, or in-person needs.
- **Fragmented Collaboration Workflow:** Clients juggle Slack, Trello, Drive, and a separate payment app for every freelancer, multiplying coordination overhead and project failure risk.
- **Unprotected, Trust-Deficit Payments:** Freelancers risk non-payment after delivery while clients risk paying upfront for nothing, and neither side has a structured escrow to fall back on.
- **Opaque Reputation Systems:** Star ratings alone can't distinguish verified project completions from high-volume low-quality reviews, ranking inflated profiles above genuinely reliable freelancers.

There is a critical need for a **hyperlocal, AI-augmented freelance marketplace** that unifies intelligent matching, secure milestone-based escrow, real-time collaboration, and verified reputation into a single platform.

---

## Project Objective

**SkillSphere** is a full-stack intelligent freelance marketplace engineered to eliminate the friction between skilled professionals and the clients who need them, through AI-powered semantic matching, real-time collaboration tooling, and a dispute-protected escrow payment engine.

The platform aims to:

- **Semantic AI Matching:** Deploy HuggingFace's `all-MiniLM-L6-v2` sentence-transformer model to compute cosine similarity between gig descriptions and freelancer bios, returning ranked top-5 candidates with match percentages — replacing brittle keyword search with genuine relevance scoring.
- **Milestone-Based Escrow:** Implement a Razorpay-backed payment flow where client funds are held in escrow until milestone approval, protecting both parties and eliminating payment disputes at the contract level.
- **Real-Time Collaboration:** Provide Socket.IO-powered chat with typing indicators, file attachments via Cloudinary, and push notifications that keep all gig stakeholders aligned without leaving the platform.
- **Verified Reputation Engine:** Restrict reviews to completed gigs only, compute weighted reputation scores from verified ratings, and surface freelancer analytics dashboards so quality signals are trustworthy and actionable.
- **Unified Gig Lifecycle Management:** Cover the end-to-end workflow — gig creation → proposal bidding → escrow funding → milestone tracking → dispute resolution — within a single, role-aware dashboard for Clients, Freelancers, and Admins.
- **Hyperlocal Discovery:** Embed location as a first-class filter in both gig creation and the PostgreSQL `ILIKE` search engine, enabling clients to prioritize geographically proximate talent.

---

## Sustainable Development Goals (SDGs)

This project aligns with the following United Nations Sustainable Development Goals:

### SDG 8: Decent Work and Economic Growth
- **Target 8.3:** Milestone-based escrow lowers the risk barrier to freelance engagement, supporting micro-entrepreneurship for independent workers who lack institutional protections.
- **Target 8.10:** Razorpay integration (UPI, net banking, cards) brings gig economy earnings into the formal digital economy for Indian freelancers.

### SDG 10: Reduced Inequalities
- **Target 10.2:** Surfacing freelancers by semantic skill relevance rather than marketing spend or account age lets an individual with a well-written profile compete on equal footing with established users.

---

## Proposed Solution

SkillSphere uses a **'Unified Monorepo' Architecture**. Unlike traditional freelance platforms that bolt AI matching on as an afterthought, SkillSphere embeds semantic matching, real-time communication, and escrow payment as first-class, interdependent subsystems within a single npm workspace — eliminating integration seams that cause data inconsistencies on multi-service platforms.

### Architecture & Workflow:

*Three-package monorepo showing the Next.js web app, Express Socket.IO server, and shared Zod schema library communicating with Supabase, Clerk, Razorpay, Cloudinary, HuggingFace, and Upstash Redis.*

<img width="1536" height="1024" alt="Image" src="https://github.com/user-attachments/assets/9cf482ed-653b-4359-9a5b-93ec1c8ff45c" />

1. **User Registration & Role Selection:** User signs up via Clerk (`<SignUp>`, email or Google OAuth), then picks a role on the onboarding page. The `onboardingAction` Server Action creates a `users` row plus a `clients` or `freelancers` profile, keyed by Clerk ID.

2. **Gig Creation & Validation:** Client submits `CreateGigModal`, validated client-side by `Zod` via `React Hook Form`. The `createGigAction` Server Action authenticates with Clerk, inserts the gig via `Drizzle ORM`, and revalidates the cache.

3. **AI-Powered Freelancer Matching:** `POST /api/ai/match` (rate-limited 20/min via **Upstash Redis**) sends the gig description and freelancer bios to **HuggingFace's `all-MiniLM-L6-v2`**, ranks results by cosine similarity, and returns the top 5 to `AiMatchPanel`.
   - *Fallback:* If HuggingFace is unavailable, degrades to reputation-score sorting.

4. **Proposal & Acceptance Flow:** Freelancers find gigs via `ILIKE` search and submit `SubmitProposalModal` (Zod-validated, duplicate-checked). Client acceptance via `POST /api/proposals/[id]/accept` pushes a Socket.IO notification to the freelancer.

5. **Escrow Payment via Razorpay:** `POST /api/payments/create-order` opens Razorpay checkout; `POST /api/payments/verify` confirms payment, sets `escrowStatus: 'held'`, and moves the gig to `in_progress`. Webhooks are HMAC-SHA256 verified.

6. **Real-Time Chat & Milestone Tracking:** Parties join a Socket.IO room (`join_room`); messages persist to the `messages` table. `ProjectProgressTracker` visualizes milestones (`pending → submitted → completed`); final approval sets `escrowStatus: 'released'`.

7. **Dispute Resolution & Admin Oversight:** Either party can flag a gig `disputed` via `RaiseDisputeModal`. Admins resolve via `/admin/disputes` as `resolved_client`, `resolved_freelancer`, or `resolved_split`, alongside platform-wide KPIs and user suspension controls.

---

## 🛠️ Technologies Used

### Frontend Stack

- **Next.js 16.2.6:** React meta-framework providing the App Router, Server Components, Server Actions, and Route Handlers — the primary application shell.
- **React 19.2.4:** UI component library powering all interactive elements.
- **TypeScript ^5:** Static type safety enforced across the entire monorepo, from Drizzle schema definitions to API response shapes.
- **Tailwind CSS v4 (Oxide engine):** Utility-first styling engine with custom CSS design tokens; the bright `--background: #EAEFFE` palette and `--accent-primary: #8B6CEF` purple are defined as CSS variables in `globals.css`.
- **shadcn/ui (Base Nova) v4.7.0:** Pre-built, accessible Radix UI primitives configured with the Base Nova style and Lucide icons, providing dialogs, buttons, inputs, and dropdown menus throughout the dashboard.
- **TanStack Query v5.100.11:** Server-state management for async data fetching, caching, and mutation — primary data layer for client-side components.
- **TanStack Table v8.21.3:** Headless data grid powering the gig list with filtering, sorting, pagination, and row selection via `columns.tsx` and `data-table.tsx`.
- **Recharts v3.8.1:** Chart library rendering the revenue/earnings line chart on the analytics and admin dashboards.
- **React Hook Form v7.76.0:** Performant form state management for gig creation, proposal submission, dispute filing, and profile editing.
- **Zod v4.4.3:** Schema validation for all form inputs and API payloads; shared schemas live in `packages/shared`.
- **Zustand v5.0.13:** Lightweight global UI state store (available but minimally used; server state is preferred via TanStack Query).
- **Socket.IO Client v4.8.3:** Real-time WebSocket client connecting to the Express server for chat messages, typing indicators, and push notifications.
- **Sonner v2.0.7:** Toast notification system for success/error feedback across all user actions.
- **date-fns v4.2.1:** Date formatting and manipulation utilities for booking time slots and message timestamps.
- **Lucide React v1.16.0:** Icon library providing consistent iconography across the dashboard.
- **React Compiler (babel-plugin-react-compiler v1.0.0):** Automatic memoization enabled in `next.config.ts`, eliminating the need for manual `useMemo` and `useCallback` calls.

### Backend & Database Stack

- **Next.js Route Handlers 16.2.6:** RESTful API endpoints co-located with the frontend under `app/api/` — the primary HTTP API layer.
- **Next.js Server Actions 16.2.6:** `"use server"` functions handling form mutations (`createGigAction`, `onboardingAction`, `updateProfileAction`) with direct database access.
- **Express.js v4.19.2:** Standalone server on port 3001 hosting the Socket.IO instance for persistent WebSocket connections — required because Next.js serverless functions cannot hold long-lived connections.
- **Drizzle ORM v0.45.2:** Type-safe SQL query builder generating PostgreSQL queries from TypeScript table definitions in `lib/db/schema/index.ts`. Chosen over Prisma for its lightweight footprint and SQL-proximate API.
- **Drizzle Kit v0.31.10:** Migration tooling used via `npx drizzle-kit push` to synchronize schema definitions to Supabase.
- **postgres (porsager) v3.4.9:** PostgreSQL client driver used by Drizzle; initialized as a singleton via `globalForDb.postgresClient` to prevent connection pool exhaustion during Next.js hot reloads.
- **Supabase (PostgreSQL):** Primary hosted relational database storing all 11 application tables: `users`, `freelancers`, `clients`, `gigs`, `proposals`, `reviews`, `messages`, `payments`, `notifications`, `disputes`, `admin_logs`, and `bookings`.
- **Cloudinary:** Cloud-based media storage for avatar images, portfolio gallery uploads, and chat file attachments. Images are uploaded as base64 strings via Server Actions with a 10MB body size limit configured in `next.config.ts`.
- **Upstash Redis:** Serverless Redis powering a sliding window rate limiter (20 requests/minute/user) on the `POST /api/ai/match` endpoint to control HuggingFace API costs.

### Authentication

- **Clerk v7.3.7:** Managed authentication providing JWT sessions, Google OAuth, email verification, 2FA, and built-in `<SignIn>` / `<SignUp>` / `<UserButton>` components. `clerkMiddleware()` in `middleware.ts` protects all non-public routes. The `clerkId` is stored in the `users` table as the bridge between Clerk sessions and internal database UUIDs.

### Machine Learning / AI Engine

- **HuggingFace Inference API (`all-MiniLM-L6-v2`):** Sentence-transformer model computing cosine similarity between gig descriptions and freelancer profile bios. Returns ranked match percentages used by the `AiMatchPanel` component on the gig detail page.
- **Vercel AI SDK v6.0.185:** Imported and available for future `useChat` / `useCompletion` streaming patterns; not actively used in the MVP but scaffolded for the roadmap AI features.

### External API Integrations

- **Razorpay v2.9.6:** Indian payment gateway handling order creation, payment capture, and webhook delivery in test mode. Supports UPI, net banking, and card payments natively for the Indian market.
- **Socket.IO v4.8.3 (server):** WebSocket library managing gig-scoped chat rooms (`join_room`, `send_message`, `receive_message`, `typing_start`, `typing_stop`) and user-private notification rooms (`new_notification`).

### Security & Infrastructure

- **Clerk Middleware (RBAC):** Route protection defined in `middleware.ts` using Clerk's `clerkMiddleware()` with a public route matcher. Admin RBAC is defined but temporarily disabled for MVP demo.
- **HMAC-SHA256 Webhook Verification:** Razorpay webhook events on `POST /api/payments/razorpay-webhook` are verified against `RAZORPAY_WEBHOOK_SECRET` to prevent spoofed payment events.
- **Zod Input Validation:** All user-facing API endpoints validate incoming payloads with Zod schemas before processing, preventing malformed data from reaching the database layer.
- **npm Workspaces Monorepo:** Root `package.json` orchestrates three packages (`apps/web`, `server`, `packages/shared`) with a single lockfile, enforcing consistent dependency versions across the entire codebase.

---

## 📸 System Visuals

### 1. Gig Detail Page — AI Match Panel & Milestone Tracker

*The gig detail page combines the AI-powered freelancer recommendation panel, the milestone progress tracker with approve/submit controls, and the inline Socket.IO chat room — the operational core of an active engagement.*

<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/2db865b5-81ab-4719-8378-054c10344183" />
<!-- Add screenshot: /dashboard/gigs/[id] showing the AiMatchPanel with ranked freelancers, the ProjectProgressTracker with milestone statuses, and the ChatRoom component -->

### 2. Advanced Search Engine with Location & Budget Filters

*The search page exposes PostgreSQL ILIKE text search across gig title, description, and location, with budget range sliders and a location text filter — returning up to 50 open gigs sorted by creation date.*

<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/4c445a8f-b915-470e-9906-c9f62e4e1e4c" />
<!-- Add screenshot: /dashboard/search showing the SearchEngine component with active filters and a populated results grid -->

### 3. Freelancer Public Profile — Portfolio & Reputation

*The public freelancer profile page renders the portfolio gallery (Cloudinary-hosted images), computed reputation score, skills tag cloud, hourly rate pricing card, and verified review history — the trust signal surface visible to prospective clients before initiating contact.*

<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/fa051898-569f-4d52-bdf0-0b359a68bdd1" />
<!-- Add screenshot: /dashboard/freelancers/[id] showing the full public profile with portfolio images, reputation score, skills, and review cards -->


<details>
<summary>👤 Client Role — Full Page Gallery</summary>

### Client — Create Gig Modal
<!-- Add screenshot: CreateGigModal open on /dashboard/gigs, showing the form fields for title, description, budget, and location -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/1786957c-e921-4c29-93e8-9a4e7441d4cf" />

### Client — Proposals Management
<!-- Add screenshot: /dashboard/proposals showing incoming proposal cards with bid amounts, delivery days, and accept/decline action buttons -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/19804bc2-a3b0-46cd-9ea3-0225468fd1f8" />

### Client — Escrow Payment (Razorpay Checkout)
<!-- Add screenshot: Fund Escrow button triggering the Razorpay checkout modal overlay on the gig detail page -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/420a0628-5f9e-43d2-8767-2a9aced24496" />

### Client — Payment History
<!-- Add screenshot: /dashboard/payments showing the payment history table with escrow status badges and the CSV export button -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/2714fa57-4dcc-489c-8e44-e6aaf5dd22bd" />

### Client — Meeting Scheduler (Bookings)
<!-- Add screenshot: /dashboard/bookings showing the BookMeetingModal and the bookings list with status badges -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/86335e11-1a2e-489a-a9ee-9156cafbf8c2" />

</details>

<details>
<summary>💼 Freelancer Role — Full Page Gallery</summary>

### Freelancer — Profile Editor with Portfolio Upload
<!-- Add screenshot: /dashboard/profile in edit mode showing the profile header with avatar upload, skills section, hourly rate card, and portfolio gallery with Cloudinary upload controls -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/236e03dc-2fc3-4301-b628-14d353c6254f" />

### Freelancer — Submit Proposal Modal
<!-- Add screenshot: SubmitProposalModal open on a gig page, showing bid amount, delivery days, and description fields -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/ea024c33-3334-4e38-a2c0-309e5b738ebf" />

### Freelancer — Analytics Dashboard
<!-- Add screenshot: /dashboard/analytics showing the Recharts earnings chart, KPI cards for profile views and active gigs, and the revenue breakdown -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/a481695d-0080-4393-9e69-0d8eb6622806" />

### Freelancer — Real-Time Chat with File Attachments
<!-- Add screenshot: /dashboard/messages showing the ChatRoom component with message bubbles, typing indicator, and the file attachment upload button -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/d3587918-ca9e-45f6-9f29-4d0adb5e40f7" />

### Freelancer — Reviews & Reputation Analytics
<!-- Add screenshot: /dashboard/reviews showing review cards, the rating distribution chart (Recharts), and the verified badge on completed-gig reviews -->
<img width="1920" height="1280" alt="Image" src="https://github.com/user-attachments/assets/cd696385-6f93-4ea7-94c8-0b5cadc2774b" />

</details>

---

## 🚀 Live Deployment

#### Production URLs

- **Frontend Application:** [`https://skill-sphere-web-chi.vercel.app`](https://skill-sphere-web-chi.vercel.app)

#### Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SOCKET_URL=PLACEHOLDER_SOCKET_SERVER_URL

# Backend (.env)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
CLERK_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
HUGGINGFACE_API_KEY=hf_...
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

> The Socket.IO server (for real-time chat and notifications) requires a separate long-lived host (e.g., Railway or Render) since Vercel's serverless functions cannot maintain persistent WebSocket connections. Update `NEXT_PUBLIC_SOCKET_URL` once that deployment is finalized.

---

## 📊 Project Status

| Domain | Status | Notes |
|--------|--------|-------|
| Frontend (Next.js 16 App Router) | ✅ **Complete** | All 15 page routes, layouts, and components implemented |
| Backend (Route Handlers + Server Actions) | ✅ **Complete** | 23 API endpoints + 4 Server Actions covering all business operations |
| Real-Time Chat (Socket.IO) | ✅ **Stable** | Messages, typing indicators, and push notifications working in dev |
| Authentication (Clerk) | ✅ **Stable** | JWT sessions, Google OAuth, email verification, onboarding flow active |
| AI Matching (HuggingFace) | ✅ **Active** | `all-MiniLM-L6-v2` matching live; reputation-score fallback in place |
| Escrow Payments (Razorpay) | 🔄 **In Progress** | Test mode functional; payment signature verification pending |
| Production Deployment (Vercel) | ✅ **Production** | Frontend live at `skill-sphere-web-chi.vercel.app`; Socket.IO server deployment pending on a separate host (Railway/Render) |
---

## 🧠 ML Model Methodology

The AI matching engine is the technical centrepiece of SkillSphere's differentiation from conventional keyword-search marketplaces. Rather than matching on token overlap between a job description and a profile, the system computes **dense vector representations** of natural language text and measures their geometric similarity — capturing synonymy, domain context, and intent in a way that bag-of-words models cannot.

The design deliberately chose a **deterministic, score-ranked retrieval pattern** (rather than probabilistic generative AI) because it is auditable, latency-predictable, and cost-efficient at scale. Every match percentage the client sees corresponds to a real mathematical relationship between two text embeddings.

### Sentence Embedding via `all-MiniLM-L6-v2`

HuggingFace's `all-MiniLM-L6-v2` is a distilled sentence-transformer model producing 384-dimensional dense embeddings optimised for semantic similarity tasks. It was chosen for its balance of inference speed (small model size), embedding quality (competitive with much larger models on STS benchmarks), and zero-cost API access via HuggingFace's Inference API.

```python
# Conceptual representation of the embedding call
embedding_gig      = encode(gig.description)           # shape: [384]
embedding_profile  = encode(freelancer.bio + " " + freelancer.skills)  # shape: [384]
```

### Cosine Similarity Scoring

Cosine similarity measures the angle between two embedding vectors, making it scale-invariant — a short bio and a long description are compared fairly regardless of length.

```python
def cosine_similarity(vec_a, vec_b):
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    magnitude_a = sqrt(sum(a**2 for a in vec_a))
    magnitude_b = sqrt(sum(b**2 for b in vec_b))
    return dot_product / (magnitude_a * magnitude_b)  # returns [-1, 1]

# Converted to match percentage for UI display
match_pct = round(cosine_similarity(embedding_gig, embedding_profile) * 100, 1)
```

Variables: `vec_a` = gig description embedding, `vec_b` = freelancer profile embedding. The output range `[-1, 1]` is multiplied by 100 to yield a human-readable match percentage displayed in the `AiMatchPanel`.

### Rate Limiting via Upstash Redis Sliding Window

To prevent runaway API cost from the HuggingFace Inference API, every call to `POST /api/ai/match` is gated by an Upstash Redis sliding window limiter scoped to the authenticated user's Clerk ID.

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute per user
  analytics: true,
});

const { success } = await ratelimit.limit(userId); // userId = Clerk ID
if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
```

The 20 req/min threshold was set to allow rapid iterative testing while keeping projected monthly API costs within a free-tier envelope.

### Graceful Degradation Strategy

If the HuggingFace API is unavailable (network failure, API key missing, or model loading), the matching endpoint falls back to sorting freelancers by their stored `reputationScore` in descending order and assigning mock descending percentages. This ensures the `AiMatchPanel` always renders useful recommendations rather than an empty error state.

```typescript
// Fallback pseudocode in api/ai/match/route.ts
if (huggingFaceError) {
  const ranked = freelancers
    .sort((a, b) => b.reputationScore - a.reputationScore)
    .slice(0, 5)
    .map((f, i) => ({ ...f, matchPercentage: 95 - i * 5 })); // 95, 90, 85, 80, 75
  return NextResponse.json({ data: ranked });
}
```

---

## 🎯 Key Features

- ✅ **Semantic AI Freelancer Matching:** HuggingFace `all-MiniLM-L6-v2` computes cosine similarity between gig descriptions and freelancer profiles, returning ranked top-5 recommendations with match percentages — the platform's primary technical differentiator.
- ✅ **Milestone-Based Escrow Payments:** Razorpay-backed escrow holds client funds until milestone approval; three-outcome dispute resolution (`resolved_client`, `resolved_freelancer`, `resolved_split`) ensures fair handling of contested payments.
- ✅ **Real-Time Socket.IO Chat:** Bidirectional WebSocket messaging with typing indicators, Cloudinary file attachments, and message persistence — scoped to gig participants via room-based isolation.
- ✅ **Push Notification System:** In-app Socket.IO notifications for proposal acceptances, milestone submissions, and payment events, with PostgreSQL persistence ensuring delivery even when the Socket.IO server is temporarily down.
- ✅ **Role-Based Three-Panel Dashboard:** Distinct authenticated experiences for Client (gig management, escrow, hiring), Freelancer (proposals, analytics, portfolio), and Admin (user suspension, dispute arbitration, platform metrics).
- ✅ **Verified Reputation Engine:** Reviews restricted to completed gigs only; `isVerified` flag set automatically; rating distribution visualised via Recharts on the freelancer analytics page.
- ✅ **Advanced Search with Hyperlocal Filters:** PostgreSQL `ILIKE` full-text search across title, description, and location with budget range filtering — returning up to 50 open gigs sorted by recency.
- ✅ **Rich Freelancer Profiles:** Cloudinary-hosted portfolio galleries, skills tag clouds, hourly rate cards, and computed reputation scores visible on public `/freelancers/[id]` pages.
- ✅ **Meeting Scheduler (Bookings):** Clients request time slots with freelancers; confirmed bookings generate mock meeting links; `bookings` table tracks start/end time, status, and notes.
- ✅ **Type-Safe Full-Stack API:** Shared Zod schemas in `packages/shared` validate every API payload from form to database; Drizzle ORM provides TypeScript-native SQL queries with zero code generation.

---

<p align="center">
  <strong>Connecting the right talent to the right opportunity — intelligently, securely, locally.</strong><br>
  Built with ❤️ by Rohit!
</p>
