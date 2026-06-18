"use client";

import React, { useState } from 'react';
import { Sparkles, UserCircle, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function AiMatchPanel({ gigId }: { gigId: string }) {
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[] | null>(null);

  const handleMatch = async () => {
    setIsMatching(true);
    setMatches(null);
    
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to find matches');
      }
      
      // Simulate slight delay for dramatic effect if it returns too fast
      setTimeout(() => {
        setMatches(json.data.recommendations || []);
        setIsMatching(false);
        toast.success("AI Matching complete!");
      }, 1500);

    } catch (err: any) {
      toast.error(err.message);
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden relative flex flex-col">
      {/* Decorative top border for AI components */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />
      
      <div className="p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-accent-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Job Matching</h3>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          Our HuggingFace semantic engine analyzes your gig description and finds the most compatible freelancers.
        </p>

        {!matches && !isMatching && (
          <div className="mt-4">
            <button 
              onClick={handleMatch}
              className="w-full flex items-center justify-center gap-2 bg-surface-hover border border-border hover:border-accent-primary text-foreground font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <Sparkles className="h-4 w-4 text-accent-primary" />
              Find Best Matches
            </button>
          </div>
        )}

        {isMatching && (
          <div className="mt-auto space-y-4">
            <div className="relative h-1 w-full bg-surface-hover rounded-full overflow-hidden">
               {/* Border Beam Animation defined in globals.css for AI states */}
               <div className="absolute inset-0 w-[200%] animate-beam" 
                    style={{ background: 'linear-gradient(90deg, transparent, #6366F1, transparent)' }} 
               />
            </div>
            <p className="text-sm text-center text-accent-primary animate-pulse font-medium">
              Analyzing gig semantics...
            </p>
            
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full skeleton-loader" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/2 rounded skeleton-loader" />
                    <div className="h-3 w-3/4 rounded skeleton-loader" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {matches && (
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Top Recommendations</h4>
            {matches.length === 0 ? (
              <p className="text-sm text-text-secondary">No freelancers found yet.</p>
            ) : (
              matches.map((freelancer, idx) => (
                <Link href={`/dashboard/freelancers/${freelancer.id}`} key={freelancer.id} className="block p-3 rounded-lg border border-border bg-background hover:border-accent-primary/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-surface-hover flex items-center justify-center border border-border">
                        <UserCircle className="h-6 w-6 text-text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{freelancer.name || (freelancer.email ? freelancer.email.split('@')[0] : `Freelancer ${freelancer.id.substring(0,4)}`)}</div>
                        <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                          <Star className="h-3 w-3 text-color-warning fill-color-warning" />
                          <span>{freelancer.reputationScore} Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs font-mono font-medium text-color-success">
                        {freelancer.matchScore}% Match
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-disabled group-hover:text-accent-primary mt-2 transition-colors" />
                    </div>
                  </div>
                  {freelancer.skills && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(freelancer.skills as string[]).slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-full bg-surface-hover text-[10px] text-text-secondary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
