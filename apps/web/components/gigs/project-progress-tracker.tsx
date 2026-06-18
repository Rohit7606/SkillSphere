"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, FileUp, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

import { CreateMilestoneModal } from './create-milestone-modal';

export function ProjectProgressTracker({ 
  gigId, 
  milestones, 
  isClient 
}: { 
  gigId: string, 
  milestones: any[], 
  isClient: boolean 
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // If there are no milestones, provide a fallback or setup state
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="h-5 w-5 text-accent-primary" />
          <h2 className="text-lg font-bold text-foreground">Project Progress</h2>
        </div>
        <p className="text-sm text-text-secondary">No milestones defined for this project.</p>
        {isClient && (
          <CreateMilestoneModal gigId={gigId} />
        )}
      </div>
    );
  }

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handleUpdateMilestone = async (milestoneId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status: newStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update milestone');

      toast.success('Milestone updated successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-accent-primary" />
          <h2 className="text-lg font-bold text-foreground">Project Progress</h2>
        </div>
        <div className="flex items-center gap-4">
          {progressPercent === 100 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-bold border border-success/20">
              Project Completed! 🎉
            </span>
          )}
          <span className="text-2xl font-bold text-foreground">{progressPercent}%</span>
        </div>
      </div>

      <div className="relative h-2 w-full bg-surface-hover rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-accent-primary transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, idx) => (
          <div key={milestone.id || idx} className="p-4 rounded-lg border border-border bg-background flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-foreground flex items-center gap-2">
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Clock className="h-4 w-4 text-text-secondary" />
                )}
                {milestone.title}
              </h3>
              {milestone.dueDate && (
                <p className="text-xs text-text-secondary mt-1">Due: {new Date(milestone.dueDate).toISOString().split('T')[0]}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium bg-surface-hover px-3 py-1 rounded-full border border-border">
                ₹{milestone.amount}
              </div>
              
              {!isClient && milestone.status === 'pending' && (
                <button 
                  disabled={isUpdating}
                  onClick={() => handleUpdateMilestone(milestone.id, 'submitted')}
                  className="flex items-center gap-1 px-3 py-1 bg-accent-primary text-white rounded-md text-sm font-medium hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
                >
                  <FileUp className="h-4 w-4" /> Submit
                </button>
              )}

              {isClient && milestone.status === 'submitted' && (
                <button 
                  disabled={isUpdating}
                  onClick={() => handleUpdateMilestone(milestone.id, 'completed')}
                  className="flex items-center gap-1 px-3 py-1 bg-success text-white rounded-md text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
              )}

              {milestone.status === 'submitted' && !isClient && (
                <span className="text-xs text-color-warning font-medium bg-color-warning/10 px-2 py-1 rounded-full border border-color-warning/20">
                  Awaiting Approval
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isClient && (
        <div className="pt-4 border-t border-border">
          <CreateMilestoneModal gigId={gigId} />
        </div>
      )}
    </div>
  );
}
