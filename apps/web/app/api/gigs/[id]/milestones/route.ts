import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { gigs, users, clients, freelancers, proposals, payments } from '../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { sendNotification } from '../../../../../lib/notifications';

const updateSchema = z.object({
  milestoneId: z.string(),
  status: z.enum(['pending', 'submitted', 'completed']),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: gigId } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    const body = await req.json();
    const { milestoneId, status } = updateSchema.parse(body);

    const milestones = (gig.milestones || []) as any[];
    const milestoneIndex = milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    // Validate access (only client can approve, freelancer can submit)
    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));

    const isClient = client?.id === gig.clientId;
    let isAssignedFreelancer = false;
    
    if (freelancer) {
      const acceptedProposals = await db.select().from(proposals).where(and(eq(proposals.gigId, gig.id), eq(proposals.status, 'accepted')));
      if (acceptedProposals.some(p => p.freelancerId === freelancer.id)) {
        isAssignedFreelancer = true;
      }
    }

    if (!isClient && !isAssignedFreelancer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status === 'completed' && !isClient) {
      return NextResponse.json({ error: 'Only clients can approve milestones' }, { status: 403 });
    }

    // Update milestone
    milestones[milestoneIndex].status = status;
    
    // Check if all milestones are completed to auto-complete gig
    const allCompleted = milestones.every(m => m.status === 'completed');
    const newGigStatus = allCompleted ? 'completed' : gig.status;

    await db.update(gigs).set({
      milestones,
      status: newGigStatus
    }).where(eq(gigs.id, gigId));

    if (newGigStatus === 'completed') {
      await db.update(payments)
        .set({ escrowStatus: 'released' })
        .where(eq(payments.gigId, gigId));
    }

    // Send Notification
    if (status === 'submitted' && client) {
      await sendNotification({
        userId: client.userId,
        type: 'milestone_submitted',
        message: `A milestone for "${gig.title}" has been submitted for approval.`,
        link: `/dashboard/gigs/${gig.id}`
      });
    } else if (status === 'completed' && isAssignedFreelancer) {
       // We would need the freelancer's userId, this is slightly complex since we don't have it locally in this scope if client is the one updating it
       // Assuming we have it or will resolve it
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error: any) {
    console.error('[MILESTONE_UPDATE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: gigId } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    if (!client || client.id !== gig.clientId) {
      return NextResponse.json({ error: 'Only the client who owns this gig can add milestones' }, { status: 403 });
    }

    const body = await req.json();
    const newMilestone = {
      id: crypto.randomUUID(),
      title: body.title,
      amount: body.amount,
      dueDate: body.dueDate,
      status: 'pending'
    };

    const milestones = (gig.milestones || []) as any[];
    milestones.push(newMilestone);

    await db.update(gigs).set({ milestones }).where(eq(gigs.id, gigId));

    return NextResponse.json({ data: newMilestone }, { status: 201 });
  } catch (error: any) {
    console.error('[MILESTONE_CREATE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
