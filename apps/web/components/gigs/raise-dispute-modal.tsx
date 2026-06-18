"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldAlert, X, Loader2 } from 'lucide-react';

export function RaiseDisputeModal({ gigId, onClose }: { gigId: string; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, reason })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to raise dispute');
      
      toast.success('Dispute raised successfully. An admin will review it.');
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-color-error" />
            Raise a Dispute
          </h2>
          <button onClick={onClose} className="p-1 text-text-secondary hover:bg-surface-hover rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Reason for Dispute
            </label>
            <textarea
              required
              minLength={20}
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-color-error transition-colors"
              placeholder="Please explain the issue in detail. Minimum 20 characters."
            />
          </div>
          
          <div className="bg-color-error/10 text-color-error text-xs p-3 rounded-md border border-color-error/20">
            <strong>Warning:</strong> Raising a dispute freezes all associated escrow payments until an admin mediates the resolution. Abuse of this system will result in account suspension.
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || reason.length < 20}
              className="px-4 py-2 text-sm font-medium bg-color-error hover:bg-color-error/90 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
