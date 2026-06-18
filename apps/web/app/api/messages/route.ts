import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { messages, gigs, proposals, users, clients, freelancers } from '../../../lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gigId = searchParams.get('gigId');
    if (!gigId) return NextResponse.json({ error: 'Missing gigId' }, { status: 400 });

    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const chatMessages = await db.select({
      id: messages.id,
      senderId: users.clerkId,
      content: messages.content,
      fileUrl: messages.fileUrl,
      createdAt: messages.createdAt
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.gigId, gigId))
    .orderBy(asc(messages.createdAt));

    return NextResponse.json({ data: chatMessages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { gigId, content, fileUrl } = await req.json();
    const { userId: clerkId } = await auth();
    
    if (!clerkId || !gigId || !content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [sender] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!sender) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    
    const [clientRecord] = await db.select().from(clients).where(eq(clients.id, gig.clientId));
    const gigClientUserId = clientRecord?.userId;

    const [acceptedProposal] = await db.select().from(proposals).where(and(eq(proposals.gigId, gigId), eq(proposals.status, 'accepted')));
    
    let gigFreelancerUserId = null;
    if (acceptedProposal) {
      const [freelancerRecord] = await db.select().from(freelancers).where(eq(freelancers.id, acceptedProposal.freelancerId));
      gigFreelancerUserId = freelancerRecord?.userId;
    }

    const receiverId = sender.id === gigClientUserId ? (gigFreelancerUserId || sender.id) : gigClientUserId;

    if (!receiverId) {
      return NextResponse.json({ error: 'Cannot determine receiver' }, { status: 400 });
    }

    const [newMessage] = await db.insert(messages).values({
      senderId: sender.id,
      receiverId: receiverId,
      gigId,
      content,
      fileUrl
    }).returning();

    // Map DB ID so optimistic UI can eventually match it if needed
    return NextResponse.json({ data: newMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
