# Findings

## Research, Discoveries, and Constraints
- The project is **SkillSphere**, an intelligent hyperlocal freelance ecosystem.
- Framework: Next.js 16 (App Router), React 19, TypeScript.
- Database: Supabase + Drizzle ORM.
- Styling: Tailwind CSS v4.0 + shadcn/ui.
- The platform uses HuggingFace embeddings (via Vercel AI SDK) for job matching.
- Real-time features use Socket.IO and Supabase Realtime.
- Payments handled via Razorpay / Stripe.
- Constraints from `AGENTS.md`: Must follow senior-level dashboard design, use TanStack Query for server state, Zustand for global UI state, and Zod + React Hook Form. RBAC must be server-side.
