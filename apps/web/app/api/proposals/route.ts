import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '../../../lib/db';
import { proposals, freelancers, users, gigs } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const proposalSchema = z.object({
  gigId: z.string().uuid(),
  bidAmount: z.number().positive(),
  deliveryDays: z.number().positive().int(),
  description: z.string().min(20).max(1000),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve db user
    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Verify user is a freelancer
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
    if (!freelancer) {
      return NextResponse.json({ error: 'Only freelancers can submit proposals' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = proposalSchema.parse(body);

    // Verify gig exists and is open
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, validatedData.gigId));
    if (!gig || gig.status !== 'open') {
      return NextResponse.json({ error: 'Gig is not available for bidding' }, { status: 400 });
    }

    // Check if freelancer already submitted a proposal
    const existingProposals = await db
      .select()
      .from(proposals)
      .where(and(
        eq(proposals.gigId, validatedData.gigId), 
        eq(proposals.freelancerId, freelancer.id)
      ));
      
    if (existingProposals.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a proposal for this gig' }, { status: 400 });
    }

    // Insert proposal
    const [newProposal] = await db.insert(proposals).values({
      gigId: validatedData.gigId,
      freelancerId: freelancer.id,
      bidAmount: validatedData.bidAmount,
      deliveryDays: validatedData.deliveryDays,
      description: validatedData.description,
      status: 'pending',
    }).returning();

    return NextResponse.json({ data: newProposal, error: null }, { status: 201 });
  } catch (error: any) {
    console.error('[PROPOSAL_SUBMIT_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
