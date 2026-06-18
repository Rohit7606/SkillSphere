# Project Constitution

## Data Schemas (Supabase / Drizzle)
- **users**: `{ id: string, email: string, role: 'client'|'freelancer'|'admin', createdAt: Date, clerkId: string }`
- **freelancers**: `{ id: string, userId: string, skills: string[], bio: string, hourlyRate: number, location: string, reputationScore: number }`
- **clients**: `{ id: string, userId: string, company: string, location: string }`
- **gigs**: `{ id: string, clientId: string, title: string, description: string, budget: number, milestones: JSON[], status: 'draft'|'open'|'in_progress'|'completed'|'cancelled'|'disputed', location: string }`
- **proposals**: `{ id: string, freelancerId: string, gigId: string, bidAmount: number, deliveryDays: number, description: string, status: 'pending'|'accepted'|'rejected'|'withdrawn'|'countered' }`
- **reviews**: `{ id: string, reviewerId: string, revieweeId: string, gigId: string, rating: number, comment: string, weightedScore: number, isVerified: boolean }`
- **messages**: `{ id: string, senderId: string, receiverId: string, gigId: string, content: string, fileUrl: string, readAt: Date }`
- **payments**: `{ id: string, gigId: string, clientId: string, freelancerId: string, amount: number, status: string, gateway: string, escrowStatus: 'held'|'released' }`
- **notifications**: `{ id: string, userId: string, type: string, payload: JSON, readAt: Date }`
- **disputes**: `{ id: string, gigId: string, raisedBy: string, reason: string, evidence: string[], status: string, resolvedBy: string }`
- **adminLogs**: `{ id: string, adminId: string, action: string, targetType: string, targetId: string, metadata: JSON, createdAt: Date }`

## Behavioral Rules
- **Identity**: System Pilot (B.L.A.S.T. & A.N.T. 3-layer architecture).
- **Priority**: Reliability over speed. Deterministic business logic.
- **Data-First Rule**: Coding only begins once the "Payload" shape is confirmed.
- **Self-Annealing**: Analyze, Patch, Test, Update Architecture.
- **Tech Stack Rules**: Follow `AGENTS.md` strictly (Next.js 16, Node.js/TypeScript for tools, Supabase, Tailwind v4, shadcn/ui).
- **UI/UX Rules**: Follow the Senior Bar design standards (calm, clear, fast, single source of truth).
- **Deployment**: Vercel at the end of the project.

## Architectural Invariants
- **Layer 1: Architecture (`architecture/`)**: Technical SOPs in Markdown.
- **Layer 2: Navigation**: Reasoning and routing data.
- **Layer 3: Tools (`tools/`)**: Deterministic execution scripts written in **TypeScript/Node.js**.

## Maintenance Log
*(To be filled in Phase 5: Trigger)*
