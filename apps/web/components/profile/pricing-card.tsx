"use client";

import React, { useState, useEffect } from 'react';

export function PricingCard({ initialRate }: { initialRate: number }) {
  const [rate, setRate] = useState(initialRate);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.hourlyRate) {
        setRate(Number(e.detail.hourlyRate));
      }
    };
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);

  return (
    <div className="bg-surface border border-border rounded-[2rem] p-6 sm:p-8 flex-1 flex flex-col justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-success/5 to-accent-primary/5 rounded-full blur-2xl group-hover:bg-success/10 transition-colors pointer-events-none"></div>

      <h3 className="text-xl font-bold text-foreground mb-6 relative z-10">Pricing</h3>
      
      <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4 relative z-10">
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Hourly Rate</span>
        <span className="font-semibold text-xl text-foreground">₹{rate}<span className="text-sm text-text-secondary font-normal">/hr</span></span>
      </div>
      
      <div className="flex justify-between items-center relative z-10">
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Availability</span>
        <span className="font-bold text-success bg-success/10 px-3 py-1 rounded-full text-sm border border-success/20">Full-Time</span>
      </div>
    </div>
  );
}
