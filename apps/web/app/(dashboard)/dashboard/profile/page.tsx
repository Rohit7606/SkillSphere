import React from 'react';
import { db } from '../../../../lib/db';
import { users, freelancers, clients } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '../../../../components/profile/profile-header';
import { SkillsSection } from '../../../../components/profile/skills-section';
import { PortfolioGallery } from '../../../../components/profile/portfolio-gallery';
import { PricingCard } from '../../../../components/profile/pricing-card';

export default async function ProfilePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  // 1. Fetch user data
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) notFound();

  // 2. Fetch freelancer profile
  const [freelancerData] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const [clientData] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
  
  const isClient = !!clientData && !freelancerData;

  if (isClient) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ProfileHeader 
          user={{ email: dbUser.email, createdAt: dbUser.createdAt, avatarUrl: dbUser.avatarUrl, name: dbUser.name }} 
          freelancer={{
            bio: clientData.company ? `Company: ${clientData.company}` : 'Client account',
            hourlyRate: null,
            location: clientData.location,
            reputationScore: null
          }} 
        />
        <div className="bg-surface border border-border p-12 rounded-[2rem] text-center shadow-sm">
          <h2 className="text-2xl font-bold text-foreground">Client Workspace</h2>
          <p className="text-text-secondary mt-3 max-w-lg mx-auto">
            You are currently using SkillSphere as a Client. You can post gigs, hire top talent, and manage your projects from the Gigs tab.
          </p>
        </div>
      </div>
    );
  }

  const displayFreelancer = freelancerData || {
    id: 'pending',
    userId: dbUser.id,
    bio: 'No bio provided yet.',
    hourlyRate: 0,
    location: 'Unknown',
    reputationScore: 0,
    skills: [],
    portfolio: []
  };

  const portfolio = displayFreelancer.portfolio && displayFreelancer.portfolio.length > 0 
    ? displayFreelancer.portfolio 
    : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ProfileHeader 
        user={{ email: dbUser.email, createdAt: dbUser.createdAt, avatarUrl: dbUser.avatarUrl, name: dbUser.name }} 
        freelancer={displayFreelancer} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 flex flex-col gap-6">
          <SkillsSection skills={displayFreelancer.skills || []} />
          <PricingCard initialRate={displayFreelancer.hourlyRate || 0} />
        </div>

        <div className="md:col-span-2 h-full">
          <PortfolioGallery initialItems={portfolio} />
        </div>
      </div>
    </div>
  );
}
