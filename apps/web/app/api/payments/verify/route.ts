import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { payments, gigs, clients, users, proposals } from '../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { gigId, paymentId, orderId, signature } = await req.json();

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    if (!client) return NextResponse.json({ error: 'Only clients can fund escrow' }, { status: 403 });

    // Ensure the client owns the gig
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig || gig.clientId !== client.id) {
      return NextResponse.json({ error: 'You do not own this gig' }, { status: 403 });
    }

    // Check if there is an accepted proposal to know the freelancerId
    const acceptedProposals = await db.select().from(proposals).where(and(eq(proposals.gigId, gigId), eq(proposals.status, 'accepted')));
    const freelancerId = acceptedProposals.length > 0 ? acceptedProposals[0].freelancerId : null;

    if (!freelancerId) {
      return NextResponse.json({ error: 'You must accept a proposal before funding the escrow' }, { status: 400 });
    }

    // Check if it's already funded
    const existingPayments = await db.select().from(payments).where(and(eq(payments.gigId, gigId), eq(payments.status, 'completed')));
    if (existingPayments.length > 0) {
      return NextResponse.json({ error: 'Escrow already funded' }, { status: 400 });
    }

    // Optional: Verify Razorpay signature using crypto here in production

    // Insert payment record
    await db.insert(payments).values({
      gigId,
      clientId: client.id,
      freelancerId,
      amount: gig.budget,
      status: 'completed',
      gateway: 'razorpay',
      escrowStatus: 'held',
    });

    // Update gig status
    await db.update(gigs).set({ status: 'in_progress' }).where(eq(gigs.id, gigId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[VERIFY_PAYMENT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
