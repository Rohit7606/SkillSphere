"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateMilestoneModal({ gigId }: { gigId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return toast.error('Please fill in required fields');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add milestone');

      toast.success('Milestone added successfully');
      setIsOpen(false);
      setTitle('');
      setAmount('');
      setDueDate('');
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
        className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Milestone
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
            
            <h2 className="text-xl font-bold text-foreground mb-6">Create New Milestone</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title *</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  placeholder="e.g. Initial Wireframes"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Amount (₹) *</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  placeholder="e.g. 5000"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Due Date (Optional)</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Milestone
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
