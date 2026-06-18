"use client";

import React from 'react';
import { Star } from 'lucide-react';

export function ReviewAnalytics({ reviews, isClient }: { reviews: any[], isClient?: boolean }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[2rem] p-12 text-center shadow-sm">
        <Star className="h-12 w-12 text-border mx-auto mb-4" />
        <h4 className="text-xl font-bold text-foreground">No Reviews Yet</h4>
        <p className="text-text-secondary mt-2">
          {isClient ? "Hire freelancers to start receiving feedback." : "Complete gigs to start receiving feedback from clients."}
        </p>
      </div>
    );
  }

  // Calculate rating breakdown and average
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;
  
  reviews.forEach(r => {
    const rating = Math.floor(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (ratingCounts[rating] !== undefined) ratingCounts[rating]++;
    totalRating += r.rating;
  });

  const averageRating = (totalRating / reviews.length).toFixed(1);

  return (
    <div className="bg-surface border border-border rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Side: Massive Score */}
        <div className="flex flex-col items-center justify-center text-center md:w-1/3">
          <h2 className="text-7xl font-black text-foreground tracking-tighter mb-2">{averageRating}</h2>
          <div className="flex gap-1.5 text-accent-primary mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-6 w-6 ${parseFloat(averageRating) >= star ? 'fill-accent-primary' : 'fill-border text-border'}`} 
              />
            ))}
          </div>
          <p className="text-text-secondary font-medium text-sm">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Right Side: Progress Bars */}
        <div className="flex-1 w-full space-y-4">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingCounts[rating as keyof typeof ratingCounts];
            const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={rating} className="flex items-center gap-4 group">
                <div className="flex items-center gap-1.5 w-8 text-sm font-semibold text-text-secondary group-hover:text-foreground transition-colors">
                  {rating} <Star className="h-3.5 w-3.5 fill-current" />
                </div>
                
                {/* The Track (Empty Bar) */}
                <div className="flex-1 h-3 bg-border/50 rounded-full overflow-hidden relative">
                  {/* The Fill */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                
                <div className="w-10 text-right text-sm font-medium text-text-secondary">
                  {percent}%
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
