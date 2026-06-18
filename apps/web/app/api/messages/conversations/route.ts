import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { gigs, proposals, users, clients, freelancers, messages } from '../../../../lib/db/schema';
import { eq, or, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));

    let userGigs: any[] = [];

    if (dbUser.role === 'client' && client) {
      // Client's gigs with accepted proposals
      userGigs = await db.select({
        gigId: gigs.id,
        gigTitle: gigs.title,
        otherUserId: users.id,
        otherUserEmail: users.email,
        otherUserName: users.name
      }).from(gigs)
      .innerJoin(proposals, and(eq(proposals.gigId, gigs.id), eq(proposals.status, 'accepted')))
      .innerJoin(freelancers, eq(proposals.freelancerId, freelancers.id))
      .innerJoin(users, eq(freelancers.userId, users.id))
      .where(eq(gigs.clientId, client.id));
    } else if (dbUser.role === 'freelancer' && freelancer) {
      // Freelancer's accepted gigs
      userGigs = await db.select({
        gigId: gigs.id,
        gigTitle: gigs.title,
        otherUserId: users.id,
        otherUserEmail: users.email,
        otherUserName: users.name
      }).from(proposals)
      .innerJoin(gigs, eq(proposals.gigId, gigs.id))
      .innerJoin(clients, eq(gigs.clientId, clients.id))
      .innerJoin(users, eq(clients.userId, users.id))
      .where(and(eq(proposals.freelancerId, freelancer.id), eq(proposals.status, 'accepted')));
    }

    const conversations = [];

    for (const g of userGigs) {
      // Fetch latest message for the preview
      const [latestMsg] = await db.select()
        .from(messages)
        .where(eq(messages.gigId, g.gigId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      conversations.push({
        id: g.gigId,
        name: g.otherUserName || (g.otherUserEmail ? g.otherUserEmail.split('@')[0] : 'User'),
        gigTitle: g.gigTitle,
        initials: g.otherUserEmail ? g.otherUserEmail.charAt(0).toUpperCase() : 'U',
        color: 'from-indigo-500 to-purple-500',
        status: 'Online',
        lastMessageTime: latestMsg ? new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No messages',
        lastMessageText: latestMsg ? latestMsg.content : 'Start the conversation!',
        timestamp: latestMsg ? new Date(latestMsg.createdAt).getTime() : 0
      });
    }

    conversations.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ data: conversations, currentUserId: dbUser.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
