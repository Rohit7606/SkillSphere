import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '../../../../../lib/db';
import { proposals, gigs, users, clients } from '../../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found in database' }, { status: 404 });

    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    if (!client) return NextResponse.json({ error: 'Only clients can decline proposals' }, { status: 403 });

    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });

    const [gig] = await db.select().from(gigs).where(eq(gigs.id, proposal.gigId));
    if (!gig || gig.clientId !== client.id) return NextResponse.json({ error: 'You do not own this gig' }, { status: 403 });

    await db.update(proposals)
      .set({ status: 'rejected' })
      .where(eq(proposals.id, proposal.id));

    return NextResponse.json({ success: true, message: 'Proposal declined' });
  } catch (error: any) {
    console.error('[PROPOSAL_DECLINE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
