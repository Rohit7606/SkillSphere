import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { gigs } from '../../../lib/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    const allGigs = await db.select().from(gigs).orderBy(desc(gigs.id));
    return NextResponse.json({ data: allGigs, error: null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, data: null }, { status: 500 });
  }
}
