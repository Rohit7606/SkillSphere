import { NextResponse } from 'next/server';
import { db } from '../../../../../../lib/db';
import { disputes, gigs, users, payments } from '../../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { sendNotification } from '../../../../../../lib/notifications';

const resolveSchema = z.object({
  resolution: z.enum(['resolved_client', 'resolved_freelancer', 'resolved_split']),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [adminUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!adminUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { resolution } = resolveSchema.parse(body);

    const [dispute] = await db.select().from(disputes).where(eq(disputes.id, id));
    if (!dispute) return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });

    // Update dispute status
    await db.update(disputes)
      .set({ status: resolution, resolvedBy: adminUser.id })
      .where(eq(disputes.id, id));

    // Determine final gig status based on resolution
    const finalGigStatus = resolution === 'resolved_client' ? 'cancelled' : 'completed';
    await db.update(gigs).set({ status: finalGigStatus }).where(eq(gigs.id, dispute.gigId));

    // Release escrow depending on resolution
    const [payment] = await db.select().from(payments).where(eq(payments.gigId, dispute.gigId));
    if (payment) {
      if (resolution === 'resolved_client') {
        await db.update(payments).set({ status: 'refunded', escrowStatus: 'released' }).where(eq(payments.id, payment.id));
      } else if (resolution === 'resolved_freelancer') {
        await db.update(payments).set({ status: 'captured', escrowStatus: 'released' }).where(eq(payments.id, payment.id));
      } else if (resolution === 'resolved_split') {
        await db.update(payments).set({ status: 'partial_refund', escrowStatus: 'released' }).where(eq(payments.id, payment.id));
      }
    }

    return NextResponse.json({ success: true, resolution });
  } catch (error: any) {
    console.error('[DISPUTE_RESOLVE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
