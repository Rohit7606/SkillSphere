import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { users, freelancers } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) return NextResponse.json({ error: 'User not found', clerkId }, { status: 404 });

  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  
  return NextResponse.json({
    clerkId,
    dbUserId: dbUser.id,
    dbUserEmail: dbUser.email,
    freelancerId: freelancer?.id || null,
    currentSkills: freelancer?.skills || [],
  });
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { skills } = await req.json();
  
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) return NextResponse.json({ error: 'User not found', clerkId }, { status: 404 });

  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  
  if (!freelancer) {
    return NextResponse.json({ error: 'No freelancer profile found for this user', dbUserId: dbUser.id }, { status: 404 });
  }

  console.log(`[SKILLS API] Updating skills for freelancer ${freelancer.id} (user: ${dbUser.email}):`, skills);
  
  const [updated] = await db.update(freelancers)
    .set({ skills })
    .where(eq(freelancers.id, freelancer.id))
    .returning();
    
  console.log(`[SKILLS API] Updated successfully. New skills:`, updated.skills);
  
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/profile');
  
  return NextResponse.json({ 
    success: true, 
    updatedSkills: updated.skills,
    freelancerId: freelancer.id,
  });
}
