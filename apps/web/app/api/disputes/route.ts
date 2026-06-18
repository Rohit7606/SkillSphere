import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { disputes, gigs, users } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { sendNotification } from '../../../lib/notifications';

const disputeSchema = z.object({
  gigId: z.string().uuid(),
  reason: z.string().min(20).max(2000),
  evidence: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { gigId, reason, evidence } = disputeSchema.parse(body);

    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    // Mark gig as disputed
    await db.update(gigs).set({ status: 'disputed' }).where(eq(gigs.id, gigId));

    // Create dispute
    const [newDispute] = await db.insert(disputes).values({
      gigId,
      raisedBy: dbUser.id,
      reason,
      evidence: evidence || [],
      status: 'open'
    }).returning();

    // In a real app we would notify the admin here
    
    return NextResponse.json({ data: newDispute });
  } catch (error: any) {
    console.error('[DISPUTE_CREATE_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
