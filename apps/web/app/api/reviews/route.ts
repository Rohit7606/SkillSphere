import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { reviews, users, gigs, proposals, clients } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { gigId, revieweeId, rating, comment } = await req.json();

    // Verify gig exists and is completed
    const [gig] = await db.select().from(gigs).where(eq(gigs.id, gigId));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    if (gig.status !== 'completed') return NextResponse.json({ error: 'Can only review completed gigs' }, { status: 400 });

    // Ensure the reviewer is part of the gig (client or the accepted freelancer)
    const [reviewerClient] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
    const [revieweeClient] = await db.select().from(clients).where(eq(clients.userId, revieweeId));
    
    const isClientReviewing = reviewerClient && reviewerClient.id === gig.clientId;
    const isFreelancerReviewing = revieweeClient && revieweeClient.id === gig.clientId;

    if (!isClientReviewing && !isFreelancerReviewing) {
      return NextResponse.json({ error: 'You are not authorized to review this gig' }, { status: 403 });
    }

    // Check if review already exists
    const existingReviews = await db.select().from(reviews).where(
      and(eq(reviews.gigId, gigId), eq(reviews.reviewerId, dbUser.id))
    );
    if (existingReviews.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this gig' }, { status: 400 });
    }

    const [newReview] = await db.insert(reviews).values({
      gigId,
      reviewerId: dbUser.id,
      revieweeId,
      rating,
      comment,
      isVerified: true
    }).returning();

    return NextResponse.json({ data: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('[REVIEW_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
