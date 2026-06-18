"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Loader2, Send } from 'lucide-react';

interface SubmitProposalModalProps {
  gigId: string;
  gigBudget: number;
}

export function SubmitProposalModal({ gigId, gigBudget }: SubmitProposalModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bidAmount, setBidAmount] = useState(gigBudget);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId,
          bidAmount: Number(bidAmount),
          deliveryDays: Number(deliveryDays),
          description
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit proposal');
      }

      toast.success('Proposal submitted successfully!');
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex-1 bg-accent-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
        <Send className="h-4 w-4" />
        Submit Proposal
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-xl bg-card border-2 border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Submit Proposal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Bid Amount (₹)</label>
              <input 
                type="number" 
                required
                min={1}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Delivery Time (Days)</label>
              <input 
                type="number" 
                required
                min={1}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cover Letter / Proposal</label>
            <textarea 
              required
              rows={6}
              placeholder="Why are you the best fit for this project? (Min 20 characters)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
            />
            <p className="text-xs text-text-secondary font-medium text-right">{description.length}/1000</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 text-foreground hover:bg-muted rounded-md transition-colors font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || description.length < 20}
              className="bg-accent-primary text-white px-6 py-2.5 rounded-md font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Bid
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
