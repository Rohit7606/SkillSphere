import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { bookings, users, clients, freelancers } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));

    let fetchedBookings: any[] = [];
    const isClient = !!client && !freelancer;

    if (isClient) {
      fetchedBookings = await db.select({
        id: bookings.id,
        status: bookings.status,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        meetingLink: bookings.meetingLink,
        notes: bookings.notes,
        otherUserEmail: users.email,
        otherUserName: users.name,
      }).from(bookings)
      .innerJoin(freelancers, eq(bookings.freelancerId, freelancers.id))
      .innerJoin(users, eq(freelancers.userId, users.id))
      .where(eq(bookings.clientId, client.id));
    } else if (freelancer && !client) {
      fetchedBookings = await db.select({
        id: bookings.id,
        status: bookings.status,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        meetingLink: bookings.meetingLink,
        notes: bookings.notes,
        otherUserEmail: users.email,
        otherUserName: users.name,
      }).from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .innerJoin(users, eq(clients.userId, users.id))
      .where(eq(bookings.freelancerId, freelancer.id));
    }

    const formattedBookings = fetchedBookings.map(b => ({
      id: b.id,
      status: b.status,
      startTime: b.startTime,
      clientName: b.otherUserName || (b.otherUserEmail ? b.otherUserEmail.split('@')[0] : 'User'),
      type: isClient ? 'Meeting with Freelancer' : 'Meeting with Client',
      notes: b.notes || 'No notes provided.',
      meetingLink: b.meetingLink
    }));

    return NextResponse.json({ data: formattedBookings, isClient });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, action } = await req.json();
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = action === 'confirm' ? 'confirmed' : 'cancelled';
    const meetingLink = action === 'confirm' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : null;

    const [updated] = await db.update(bookings)
      .set({ status, meetingLink })
      .where(eq(bookings.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch(error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { freelancerId, startTime, endTime, notes } = await req.json();
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    if (!client) return NextResponse.json({ error: 'Only clients can request meetings' }, { status: 403 });

    const [newBooking] = await db.insert(bookings).values({
      clientId: client.id,
      freelancerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
      status: 'pending'
    }).returning();

    return NextResponse.json({ data: newBooking }, { status: 201 });
  } catch(error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
