import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { notifications, users } from '../../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Mark as read
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, dbUser.id)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_READ_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
