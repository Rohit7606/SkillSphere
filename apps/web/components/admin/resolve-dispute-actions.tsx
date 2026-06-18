"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, DollarSign, RotateCcw, Divide } from 'lucide-react';

export function ResolveDisputeActions({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const handleResolve = async (resolution: string) => {
    setIsResolving(resolution);
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to resolve');
      
      toast.success('Dispute resolved successfully!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setIsResolving(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleResolve('resolved_client')}
        disabled={isResolving !== null}
        title="Refund Client"
        className="p-1.5 bg-surface-hover hover:bg-color-error/10 text-text-secondary hover:text-color-error rounded-md transition-colors disabled:opacity-50"
      >
        {isResolving === 'resolved_client' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
      </button>

      <button
        onClick={() => handleResolve('resolved_freelancer')}
        disabled={isResolving !== null}
        title="Release to Freelancer"
        className="p-1.5 bg-surface-hover hover:bg-color-success/10 text-text-secondary hover:text-color-success rounded-md transition-colors disabled:opacity-50"
      >
        {isResolving === 'resolved_freelancer' ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
      </button>

      <button
        onClick={() => handleResolve('resolved_split')}
        disabled={isResolving !== null}
        title="50/50 Split"
        className="p-1.5 bg-surface-hover hover:bg-accent-primary/10 text-text-secondary hover:text-accent-primary rounded-md transition-colors disabled:opacity-50"
      >
        {isResolving === 'resolved_split' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Divide className="h-4 w-4" />}
      </button>
    </div>
  );
}
