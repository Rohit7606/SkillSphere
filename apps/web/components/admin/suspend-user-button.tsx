"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Ban, CheckCircle2, Loader2 } from 'lucide-react';

export function SuspendUserButton({ userId, currentStatus }: { userId: string, currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isSuspended = currentStatus === 'suspended';

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      
      toast.success(`User has been ${json.newStatus}.`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50
        ${isSuspended 
          ? 'bg-color-success/10 text-color-success hover:bg-color-success/20' 
          : 'bg-color-error/10 text-color-error hover:bg-color-error/20'}`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isSuspended ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Ban className="h-3.5 w-3.5" />
      )}
      {isSuspended ? 'Reactivate' : 'Suspend'}
    </button>
  );
}
