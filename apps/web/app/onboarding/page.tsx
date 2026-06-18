"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, UserSquare, Loader2, ArrowRight } from 'lucide-react';
import { submitOnboarding } from '../actions/onboarding';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!role) return;
    setIsSubmitting(true);
    
    // Pass minimal defaults; users can update their profiles later
    const data = role === 'client' 
      ? { company: 'Individual', location: 'Remote' }
      : { skills: ['General'], bio: 'Ready to work!', hourlyRate: 25, location: 'Remote' };
      
    const res = await submitOnboarding(role, data);
    
    if (res.success) {
      toast.success("Welcome to SkillSphere!");
      router.push('/dashboard');
    } else {
      toast.error(res.error || "Failed to complete onboarding");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center border-b border-border bg-surface-hover/30">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SkillSphere</h1>
          <p className="text-text-secondary">How would you like to use the platform?</p>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-6">
          <button 
            onClick={() => setRole('client')}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 hover:shadow-md ${
              role === 'client' 
                ? 'border-accent-primary bg-accent-primary/5' 
                : 'border-border bg-surface hover:border-accent-primary/50'
            }`}
          >
            <div className={`p-4 rounded-full ${role === 'client' ? 'bg-accent-primary text-white' : 'bg-surface-hover text-text-secondary'}`}>
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">I am a Client</h3>
              <p className="text-sm text-text-secondary">I want to post gigs, hire talent, and manage projects.</p>
            </div>
          </button>

          <button 
            onClick={() => setRole('freelancer')}
            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-4 hover:shadow-md ${
              role === 'freelancer' 
                ? 'border-accent-primary bg-accent-primary/5' 
                : 'border-border bg-surface hover:border-accent-primary/50'
            }`}
          >
            <div className={`p-4 rounded-full ${role === 'freelancer' ? 'bg-accent-primary text-white' : 'bg-surface-hover text-text-secondary'}`}>
              <UserSquare className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">I am a Freelancer</h3>
              <p className="text-sm text-text-secondary">I want to find gigs, submit proposals, and get paid.</p>
            </div>
          </button>
        </div>

        <div className="p-6 border-t border-border bg-surface-hover/30 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!role || isSubmitting}
            className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-accent-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
