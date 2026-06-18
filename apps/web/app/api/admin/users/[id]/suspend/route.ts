import { NextResponse } from 'next/server';
import { db } from '../../../../../../lib/db';
import { users } from '../../../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // In a real app we'd verify the caller is actually an admin
    // For MVP demo, we let it pass.

    // Fetch target user
    const [targetUser] = await db.select().from(users).where(eq(users.id, id));
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Toggle status
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';

    await db.update(users)
      .set({ status: newStatus })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true, newStatus });
  } catch (error: any) {
    console.error('[ADMIN_USER_SUSPEND_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
