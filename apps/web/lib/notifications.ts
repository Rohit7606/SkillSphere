import { db } from './db';
import { notifications, users } from './db/schema';
import { eq } from 'drizzle-orm';

export async function sendNotification({
  userId,
  type,
  message,
  link
}: {
  userId: string; // The internal Supabase UUID of the user
  type: string;
  message: string;
  link?: string;
}) {
  try {
    // 1. Insert into database
    const [newNotif] = await db.insert(notifications).values({
      userId,
      type,
      payload: { message, link }
    }).returning();

    // 2. Fetch the user's clerkId so we can push to socket server
    const [targetUser] = await db.select({ clerkId: users.clerkId }).from(users).where(eq(users.id, userId));

    if (targetUser?.clerkId) {
      // 3. Push to Express Socket server
      await fetch(process.env.NEXT_PUBLIC_SOCKET_URL ? `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/notify` : 'http://localhost:3001/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetClerkId: targetUser.clerkId,
          notification: newNotif
        })
      }).catch(err => console.warn('Failed to push realtime notification (is socket server running?)', err));
    }

    return newNotif;
  } catch (err) {
    console.error('Error sending notification:', err);
    return null;
  }
}
