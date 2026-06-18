import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { notifications, users } from '../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, dbUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    return NextResponse.json({ data: userNotifications });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
