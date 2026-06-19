"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, X, Loader2 } from 'lucide-react';
import { addDays, format, startOfToday } from 'date-fns';

export function BookMeetingModal({ freelancerId, freelancerName }: { freelancerId: string, freelancerName: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('09:00');
  const [notes, setNotes] = useState('');

  const today = startOfToday();
  const minDate = format(addDays(today, 1), 'yyyy-MM-dd'); // Book at least 1 day in advance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const startTime = new Date(`${date}T${time}:00`);
      // Default to 1 hour meeting
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          notes
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to request meeting');
      
      toast.success(`Meeting request sent to ${freelancerName}!`);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-semibold rounded-lg shadow-sm transition-all hover:shadow-md"
      >
        <Calendar className="h-4 w-4" />
        Request Meeting
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent-primary" />
                Book {freelancerName}
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-text-secondary hover:bg-surface-hover rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={minDate}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Time</label>
                  <select
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes / Agenda</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="What would you like to discuss?"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !date || !time}
                  className="px-4 py-2 text-sm font-medium bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
