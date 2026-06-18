"use client";

import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { RaiseDisputeModal } from './raise-dispute-modal';

export function RaiseDisputeButton({ gigId }: { gigId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors backdrop-blur-sm shadow-inner"
      >
        <ShieldAlert className="h-4 w-4" />
        Raise Dispute
      </button>

      {isOpen && (
        <RaiseDisputeModal gigId={gigId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
