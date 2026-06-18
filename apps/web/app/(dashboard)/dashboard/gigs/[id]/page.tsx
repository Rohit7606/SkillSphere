import React from 'react';
import { db } from '../../../../../lib/db';
import { gigs, proposals, users, freelancers, clients, payments } from '../../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { AiMatchPanel } from '../../../../../components/gigs/ai-match-panel';
import { ChatRoom } from '../../../../../components/chat/chat-room';
import { SubmitProposalModal } from '../../../../../components/proposals/submit-proposal-modal';
import { ProposalList } from '../../../../../components/proposals/proposal-list';
import { FundEscrowButton } from '../../../../../components/payments/fund-escrow-button';
import { RaiseDisputeButton } from '../../../../../components/gigs/raise-dispute-button';
import { ProjectProgressTracker } from '../../../../../components/gigs/project-progress-tracker';
import { LeaveReviewModal } from '../../../../../components/reviews/leave-review-modal';
import { Briefcase, DollarSign, Clock, MapPin, Calendar, FileText, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function GigDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const gigData = await db.select().from(gigs).where(eq(gigs.id, id)).limit(1);
  const gig = gigData[0];

  if (!gig) {
    notFound();
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  // Resolve db user
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) notFound();

  // Determine if the user is the client who owns this gig
  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
  const isGigOwner = client && gig.clientId === client.id;

  // Determine if the user has a freelancer profile
  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const isFreelancer = !!freelancer;

  const [gigClient] = await db.select().from(clients).where(eq(clients.id, gig.clientId));
  const clientUserId = gigClient?.userId;

  // Fetch proposals
  const gigProposals = await db
    .select({
      id: proposals.id,
      freelancerId: proposals.freelancerId,
      bidAmount: proposals.bidAmount,
      deliveryDays: proposals.deliveryDays,
      description: proposals.description,
      status: proposals.status,
      createdAt: proposals.createdAt,
      freelancerEmail: users.email,
      freelancerName: users.name,
      freelancerUserId: users.id
    })
    .from(proposals)
    .innerJoin(freelancers, eq(freelancers.id, proposals.freelancerId))
    .innerJoin(users, eq(users.id, freelancers.userId))
    .where(eq(proposals.gigId, id))
    .orderBy(desc(proposals.createdAt));

  // Check if escrow is already funded
  const gigPayments = await db.select().from(payments).where(eq(payments.gigId, id));
  const isFunded = gigPayments.some(p => p.status === 'completed');
  
  // Can only fund if there is an accepted proposal
  const hasAcceptedProposal = gigProposals.some(p => p.status === 'accepted');

  // Check if current user is the accepted freelancer
  const isAcceptedFreelancer = gigProposals.some(p => p.status === 'accepted' && p.freelancerEmail === dbUser.email);
  
  // A participant is either the client who owns the gig, or the freelancer who was hired
  const isParticipant = isGigOwner || isAcceptedFreelancer;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Briefcase className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Link href="/dashboard/gigs" className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 shadow-sm backdrop-blur-md hover:-translate-y-0.5">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest shadow-inner backdrop-blur-md">
                {gig.status.replace('_', ' ')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/90 text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                <MapPin className="h-4 w-4" />
                {gig.location || 'Remote'}
              </span>
              {['in_progress', 'completed', 'disputed'].includes(gig.status) && isParticipant && (
                <RaiseDisputeButton gigId={gig.id} />
              )}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
            {gig.title}
          </h1>
          
          <div className="bg-white/10 border border-white/20 p-6 rounded-2xl w-full backdrop-blur-md shadow-inner mb-8">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg font-medium">
              {gig.description}
            </p>
          </div>
          
          {/* Action buttons area */}
          {isFreelancer && !isGigOwner && gig.status === 'open' && (
            <div className="flex items-center">
              <SubmitProposalModal gigId={gig.id} gigBudget={gig.budget} />
            </div>
          )}
          {gig.status === 'completed' && isGigOwner && (
            <div className="flex items-center gap-4">
              <LeaveReviewModal 
                gigId={gig.id} 
                revieweeId={gigProposals.find(p => p.status === 'accepted')?.freelancerUserId || ''} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {isGigOwner && !isFunded && hasAcceptedProposal && gig.status !== 'completed' && <FundEscrowButton gigId={gig.id} budget={gig.budget} />}
          
          {['in_progress', 'completed', 'disputed'].includes(gig.status) && isParticipant && (
            <ProjectProgressTracker gigId={gig.id} milestones={gig.milestones as any[]} isClient={isGigOwner} />
          )}
          
          {/* Render proposals if owner, otherwise nothing or their own proposal */}
          <div className="flex-1 flex flex-col">
            {isGigOwner ? (
              <ProposalList proposals={gigProposals} isClient={true} gigId={gig.id} />
            ) : (
              gigProposals.filter(p => p.freelancerEmail === dbUser.email).length > 0 && (
                <ProposalList 
                  proposals={gigProposals.filter(p => p.freelancerEmail === dbUser.email)} 
                  isClient={false} 
                  gigId={gig.id} 
                />
              )
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* AI Match Panel Component */}
          {isGigOwner && <AiMatchPanel gigId={gig.id} />}
          
          {/* Real-time Socket.IO Chat */}
          {isParticipant && <ChatRoom gigId={gig.id} />}
        </div>
      </div>
    </div>
  );
}
