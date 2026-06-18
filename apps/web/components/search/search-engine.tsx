"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, DollarSign, Loader2, SlidersHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GigResult {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  createdAt: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientName: string | null;
}

export function SearchEngine() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minBudget, setMinBudget] = useState<number | "">("");
  const [maxBudget, setMaxBudget] = useState<number | "">("");
  
  const [results, setResults] = useState<GigResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location,
          minBudget: minBudget === "" ? undefined : minBudget,
          maxBudget: maxBudget === "" ? undefined : maxBudget,
        })
      });
      const json = await res.json();
      if (res.ok) {
        setResults(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-72 shrink-0 space-y-6">
        <div className="bg-surface border border-border rounded-xl p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <SlidersHorizontal className="h-5 w-5 text-foreground" />
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
          </div>
          
          <form onSubmit={fetchResults} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                <input 
                  type="text" 
                  placeholder="e.g. Remote, New York"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Budget Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-accent-primary"
                />
                <span className="text-text-disabled">-</span>
                <input 
                  type="number" 
                  placeholder="Max"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-accent-primary text-white font-medium py-2 rounded-md hover:bg-accent-hover transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </div>

      {/* Main Search Area */}
      <div className="flex-1 space-y-6">
        <form onSubmit={fetchResults} className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-text-disabled" />
          <input 
            type="text" 
            placeholder="Search gigs by title, skills, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-shadow text-lg"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bg-accent-primary text-white px-6 py-1.5 rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            Search
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-semibold text-foreground">
              {isLoading ? 'Searching...' : `Found ${results.length} gigs`}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-accent-primary animate-spin" />
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div className="text-center py-16 bg-surface border border-border border-dashed rounded-xl">
              <Search className="h-12 w-12 text-text-disabled mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No gigs found</h3>
              <p className="text-text-secondary mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((gig) => (
                <Link key={gig.id} href={`/dashboard/gigs/${gig.id}`}>
                  <div className="bg-surface border border-border hover:border-accent-primary/50 transition-colors rounded-xl p-6 group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent-primary transition-colors">
                        {gig.title}
                      </h3>
                      <div className="font-mono font-bold text-foreground bg-background px-3 py-1 rounded-full text-sm border border-border">
                        ₹{gig.budget}
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-sm line-clamp-2 mb-4 leading-relaxed">
                      {gig.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-text-disabled font-medium">
                      <span className="flex items-center gap-1.5 bg-surface-hover px-2.5 py-1 rounded-md text-text-secondary">
                        <MapPin className="h-3.5 w-3.5" />
                        {gig.location || 'Remote'}
                      </span>
                      <span>
                        Posted by {gig.clientCompany || gig.clientName || (gig.clientEmail ? gig.clientEmail.split('@')[0] : 'User')}
                      </span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
