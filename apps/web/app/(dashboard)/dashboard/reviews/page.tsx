import React from 'react';
import { db } from '../../../../lib/db';
import { reviews, users, gigs, clients } from '../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { ReviewAnalytics } from '../../../../components/reviews/review-analytics';
import { ReviewCard, Review } from '../../../../components/reviews/review-card';

// Mock calculation for weighted score (recency * rating * completion)
function calculateWeightedScore(allReviews: any[]) {
  if (allReviews.length === 0) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  const now = new Date().getTime();
  
  allReviews.forEach(r => {
    // Recency weight (newer reviews weigh more)
    const ageInDays = (now - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.max(0.1, Math.exp(-ageInDays / 365)); // decays over a year
    
    // Completion rate weight (hardcoded 0.95 for MVP)
    const completionWeight = 0.95; 
    
    const weight = recencyWeight * completionWeight;
    
    // Scale 1-5 rating to 20-100 score
    const scoreVal = r.rating * 20;
    
    totalScore += (scoreVal * weight);
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? (totalScore / totalWeight) : 0;
}

export default async function ReviewsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  // Resolve internal database UUID from Clerk ID
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) notFound();

  const [clientRole] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
  const isClientRole = !!clientRole;

  // Fetch all reviews where the user is the reviewee
  const userReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerified: reviews.isVerified,
      createdAt: reviews.createdAt,
      reviewerName: users.email, // using email as fallback name
      gigTitle: gigs.title,
    })
    .from(reviews)
    .leftJoin(users, eq(users.id, reviews.reviewerId))
    .leftJoin(gigs, eq(gigs.id, reviews.gigId))
    .where(eq(reviews.revieweeId, dbUser.id))
    .orderBy(desc(reviews.createdAt));

  // Compute stats
  const totalReviews = userReviews.length;
  const breakdown: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  userReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      breakdown[r.rating]++;
    }
  });

  const reputationScore = calculateWeightedScore(userReviews);

  const displayReviews = userReviews;
  const displayBreakdown = breakdown;
  const displayTotal = totalReviews;
  const displayScore = reputationScore;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Star className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Star className="h-8 w-8 text-white" />
            </div>
            Reputation & Reviews
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Track your {isClientRole ? 'freelancer' : 'client'} feedback and trust metrics elegantly.
          </p>
        </div>
      </div>

      <ReviewAnalytics 
        reviews={displayReviews} 
        isClient={isClientRole}
      />

      <div>
        <h3 className="text-xl font-semibold text-foreground mb-6">Recent Reviews</h3>
        
        {displayReviews.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border border-dashed rounded-xl">
            <p className="text-text-secondary">
              {isClientRole ? "No reviews yet. Hire freelancers to start receiving feedback!" : "No reviews yet. Complete your first gig to earn reputation!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayReviews.map((review) => (
              <ReviewCard key={review.id} review={review as Review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
