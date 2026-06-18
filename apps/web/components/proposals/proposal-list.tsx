"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, Loader2, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Proposal {
  id: string;
  freelancerId: string;
  bidAmount: number;
  deliveryDays: number;
  description: string;
  status: string;
  createdAt: Date;
  freelancerEmail?: string;
  freelancerName?: string | null;
  gigTitle?: string;
}

interface ProposalListProps {
  proposals: Proposal[];
  isClient: boolean;
  gigId: string;
}

export function ProposalList({ proposals, isClient, gigId }: ProposalListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.freelancerEmail && p.freelancerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.gigTitle && p.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (statusFilter === 'All Statuses') return matchesSearch;
    return matchesSearch && p.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const handleAccept = async (proposalId: string) => {
    try {
      setProcessingId(proposalId);
      const res = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to accept proposal');
      
      toast.success('Proposal accepted! Opening escrow...');
      
      // If it returns a razorpay order, you can open checkout here.
      // For this step, we just reload to show status change
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (proposalId: string) => {
    try {
      setProcessingId(proposalId + '_decline');
      const res = await fetch(`/api/proposals/${proposalId}/decline`, {
        method: 'POST',
      });
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || 'Failed to decline proposal');
      
      toast.success('Proposal declined.');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center h-full flex items-center justify-center min-h-[300px]">
        <p className="text-text-secondary">{isClient ? "No proposals received yet." : "You haven't sent any proposals yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Interactive Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isClient ? "Search proposals by description or email..." : "Search proposals by description or gig title..."} 
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all shadow-sm hover:border-accent-primary/50"
          />
        </div>
        
        <div className="relative w-full sm:w-auto shrink-0">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto bg-surface border border-border rounded-xl pl-4 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/50 shadow-sm cursor-pointer hover:border-accent-primary/50 transition-colors"
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{isClient ? 'Received Proposals' : 'Sent Proposals'} ({filteredProposals.length})</h3>
      </div>
      
      {filteredProposals.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <Search className="h-8 w-8 text-text-disabled mb-3" />
          <p className="text-text-secondary font-medium">No proposals match your search.</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('All Statuses'); }} className="mt-4 text-sm text-accent-primary font-medium hover:underline">Clear Filters</button>
        </div>
      ) : (
      <div className="grid gap-6">
        {filteredProposals.map((p) => (
          <div key={p.id} className="group relative bg-surface rounded-[2rem] p-8 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(139,108,239,0.12)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            
            {/* Top Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
              
              <div className="flex items-center gap-5">
                {isClient ? (
                  <Link href={`/dashboard/freelancers/${p.freelancerId}`} className="flex items-center gap-5 hover:opacity-80 transition-opacity">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center border border-accent-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <span className="text-xl font-black text-accent-primary">
                        {p.freelancerName ? p.freelancerName.charAt(0).toUpperCase() : (p.freelancerEmail ? p.freelancerEmail.charAt(0).toUpperCase() : 'F')}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground tracking-tight hover:underline">
                        {p.freelancerName || (p.freelancerEmail ? p.freelancerEmail.split('@')[0] : 'Freelancer')}
                      </h4>
                      <div className="flex items-center gap-3 text-sm font-medium text-text-secondary mt-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover rounded-lg border border-border shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-accent-primary" /> {p.deliveryDays} Days
                        </span>
                        <span className="text-text-disabled">•</span>
                        <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-primary/5 flex items-center justify-center border border-accent-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <span className="text-xl font-black text-accent-primary">
                        {p.gigTitle ? p.gigTitle.charAt(0).toUpperCase() : 'G'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground tracking-tight">
                        {p.gigTitle || 'Gig Title'}
                      </h4>
                      <div className="flex items-center gap-3 text-sm font-medium text-text-secondary mt-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-hover rounded-lg border border-border shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-accent-primary" /> {p.deliveryDays} Days
                        </span>
                        <span className="text-text-disabled">•</span>
                        <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                <span className="text-4xl font-black text-foreground tracking-tighter">
                  ₹{p.bidAmount}
                </span>
                <div className="mt-1">
                  {p.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-yellow-500/10 text-yellow-600 rounded-xl border border-yellow-500/20">Pending</span>
                  ) : p.status === 'accepted' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-success/10 text-success rounded-xl border border-success/20">Accepted</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">Rejected</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description Bento Block */}
            <div className="mt-6 p-6 bg-background rounded-2xl border border-border shadow-inner relative z-10 group-hover:bg-accent-primary/[0.02] transition-colors duration-500">
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                {p.description}
              </p>
            </div>

            {isClient && p.status === 'pending' && (
              <div className="flex gap-4 mt-6 pt-6 border-t border-border/50 relative z-10">
                <button 
                  onClick={() => handleAccept(p.id)}
                  disabled={processingId !== null}
                  className="flex-1 bg-foreground hover:bg-accent-primary text-white font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  {processingId === p.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Accept & Fund Escrow
                </button>
                <button 
                  onClick={() => handleDecline(p.id)}
                  disabled={processingId !== null}
                  className="flex-1 bg-surface-hover hover:bg-color-error/10 border border-border hover:border-color-error/30 hover:text-color-error text-text-secondary font-bold py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === p.id + '_decline' ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
