"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveReviewModalProps {
  gigId: string;
  revieweeId: string;
}

export function LeaveReviewModal({ gigId, revieweeId }: LeaveReviewModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Please write a review comment');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, revieweeId, rating, comment }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit review');

      toast.success('Review submitted successfully!');
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2.5 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-primary/90 transition-all shadow-md shadow-accent-primary/20 hover:-translate-y-0.5 flex items-center gap-2"
      >
        <Star className="h-4 w-4 fill-current" /> Leave a Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-foreground mb-6">Leave a Review</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3 text-center">Tap to Rate</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-border fill-transparent'
                        } transition-colors duration-200`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Your Review</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[120px] resize-y"
                  placeholder="Share your experience working on this gig..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl hover:bg-foreground/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className="h-5 w-5 fill-current" />}
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
