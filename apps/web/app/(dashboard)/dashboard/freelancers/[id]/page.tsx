import React from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { db } from '../../../../../lib/db';
import { freelancers, users, reviews } from '../../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PublicProfileBento } from '../../../../../components/profile/public-profile-bento';

export default async function FreelancerProfilePage({ params }: { params: { id: string } }) {
  noStore(); // Always fetch fresh data
  const { id } = await params;

  const freelancerData = await db
    .select({
      id: freelancers.id,
      userId: freelancers.userId,
      bio: freelancers.bio,
      skills: freelancers.skills,
      hourlyRate: freelancers.hourlyRate,
      location: freelancers.location,
      reputationScore: freelancers.reputationScore,
      portfolio: freelancers.portfolio,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(freelancers)
    .innerJoin(users, eq(users.id, freelancers.userId))
    .where(eq(freelancers.id, id))
    .limit(1);

  if (freelancerData.length === 0) notFound();
  const freelancer = freelancerData[0];

  const freelancerReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      reviewerName: users.name,
      reviewerAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.reviewerId))
    .where(eq(reviews.revieweeId, freelancer.userId))
    .orderBy(desc(reviews.createdAt))
    .limit(5);

  return (
    <div className="min-h-screen bg-slate-50/30 py-4">
      <PublicProfileBento freelancer={freelancer} reviews={freelancerReviews} />
    </div>
  );
}
