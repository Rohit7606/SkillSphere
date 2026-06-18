"use client";

import React from 'react';
import { Star, ShieldCheck, UserCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  reviewerName?: string;
  gigTitle?: string;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 transition-all hover:border-accent-primary/50 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
            <UserCircle2 className="h-6 w-6 text-text-secondary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{review.reviewerName || 'Anonymous Client'}</h4>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
              <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
              {review.gigTitle && (
                <>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="truncate max-w-[150px]">{review.gigTitle}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {review.isVerified && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-color-success/10 text-color-success rounded-full text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Gig
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= review.rating 
                ? 'fill-accent-primary text-accent-primary' 
                : 'text-border'
            }`} 
          />
        ))}
      </div>

      <p className="text-text-secondary leading-relaxed text-sm">
        {review.comment}
      </p>
    </div>
  );
}
