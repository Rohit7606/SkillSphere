"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, FileText, CheckCircle2, XCircle, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setBookings(json.data);
          setIsClient(json.isClient);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleAction = async (id: string, action: 'confirm' | 'decline') => {
    // Find the booking first to get the client name for the toast
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    // Trigger toast outside of setState to prevent React Strict Mode double-firing
    if (action === 'confirm') {
      toast.success(`Meeting with ${booking.clientName} confirmed!`);
    } else {
      toast.error(`Meeting with ${booking.clientName} declined.`);
    }

    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        if (action === 'confirm') {
          return {
            ...b,
            status: 'confirmed',
            meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(7)}`
          };
        } else {
          return {
            ...b,
            status: 'cancelled'
          };
        }
      }
      return b;
    }));

    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    }).catch(console.error);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Calendar className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            My Schedule
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Manage your upcoming meetings, availability, and video calls elegantly.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-surface border border-border rounded-[2rem] p-12 flex justify-center shadow-sm">
            <div className="h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookings.filter(b => b.status !== 'declined').length === 0 ? (
          <div className="bg-surface border border-border rounded-[2rem] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Calendar className="h-16 w-16 text-text-disabled mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground">No bookings found</h3>
            <p className="text-text-secondary mt-2">Your schedule is completely clear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.filter(b => b.status !== 'declined').sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((booking) => {
              const isPast = new Date(booking.startTime) < new Date();

              return (
                <div key={booking.id} className={`bg-surface border border-border rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group flex flex-col relative overflow-hidden hover:-translate-y-1 ${isPast ? 'opacity-60' : ''}`}>
                  
                  {/* Decorative Background Element */}
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-colors pointer-events-none"></div>

                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                      {/* Avatar Placeholder */}
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shrink-0 border-2 border-surface shadow-md">
                        <span className="text-white font-bold text-lg">{booking.clientName.charAt(0)}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-foreground">
                            {booking.clientName}
                          </h3>
                          {booking.status === 'pending' && <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 shadow-sm">Pending Request</span>}
                          {booking.status === 'confirmed' && !isPast && <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-success/10 text-success border border-success/20 shadow-sm">Confirmed</span>}
                          {isPast && <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-text-disabled/10 text-text-secondary border border-border shadow-sm">Completed</span>}
                        </div>
                        <p className="text-sm font-semibold text-accent-primary mb-3">
                          {booking.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 space-y-3 relative z-10 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3 text-text-secondary text-sm font-medium bg-background border border-border/50 rounded-xl px-4 py-3">
                      <Clock className="h-4 w-4 text-accent-primary" />
                      {format(new Date(booking.startTime), 'EEEE, MMMM do')}
                      <span className="text-border mx-1">|</span>
                      <span className="text-foreground">{format(new Date(booking.startTime), 'h:mm a')}</span>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-text-secondary bg-surface-hover rounded-xl px-4 py-3 border border-border/30 flex items-start gap-3 leading-relaxed">
                        <MessageCircle className="h-4 w-4 mt-0.5 text-text-disabled shrink-0" /> 
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto pt-6 flex items-center gap-3 relative z-10">
                    {booking.status === 'confirmed' && booking.meetingLink && !isPast && (
                      <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="w-full justify-center px-5 py-3 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group/btn">
                        <Video className="h-5 w-5 group-hover/btn:scale-110 transition-transform" /> Join Video Call
                      </a>
                    )}
                    
                    {booking.status === 'pending' && !isClient && (
                      <div className="flex gap-3 w-full">
                        <button onClick={() => handleAction(booking.id, 'confirm')} className="flex-1 px-5 py-3 bg-success hover:bg-success/90 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" /> Accept
                        </button>
                        <button onClick={() => handleAction(booking.id, 'decline')} className="flex-1 px-5 py-3 bg-surface-hover hover:bg-destructive hover:text-white text-destructive border border-border hover:border-destructive rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2">
                          <XCircle className="h-5 w-5" /> Decline
                        </button>
                      </div>
                    )}
                    {booking.status === 'pending' && isClient && (
                      <div className="w-full flex justify-center py-3 bg-surface-hover text-text-secondary rounded-xl text-sm font-bold border border-border">
                        Waiting for freelancer to confirm
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
