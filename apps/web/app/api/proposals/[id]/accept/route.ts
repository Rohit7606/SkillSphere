import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '../../../../../lib/db';
import { proposals, gigs, users, clients, freelancers, payments } from '../../../../../lib/db/schema';
import { sendNotification } from '../../../../../lib/notifications';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve db user
    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Verify user is a client
    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    if (!client) {
      return NextResponse.json({ error: 'Only clients can accept proposals' }, { status: 403 });
    }

    // Get proposal
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Get gig and verify ownership
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, proposal.gigId));
    if (!gig || gig.clientId !== client.id) {
      return NextResponse.json({ error: 'You do not own this gig' }, { status: 403 });
    }

    if (gig.status !== 'open') {
      return NextResponse.json({ error: 'Gig is not open for new proposals' }, { status: 400 });
    }

    // Update proposal status to accepted
    await db.update(proposals)
      .set({ status: 'accepted' })
      .where(eq(proposals.id, proposal.id));

    // Gig status will be updated to 'in_progress' when the client funds the escrow via Razorpay

    // Reject all other proposals for this gig
    // Optional, but good practice
    // await db.update(proposals).set({ status: 'rejected' }).where(and(eq(proposals.gigId, gig.id), not(eq(proposals.id, proposal.id))));

    // Trigger Notification to Freelancer
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.id, proposal.freelancerId));
    if (freelancer) {
      await sendNotification({
        userId: freelancer.userId,
        type: 'proposal_accepted',
        message: `Congratulations! Your proposal for "${gig.title}" has been accepted.`,
        link: `/dashboard/gigs/${gig.id}`
      });
    }

    return NextResponse.json({ success: true, message: 'Proposal accepted' });
  } catch (error: any) {
    console.error('[PROPOSAL_ACCEPT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
