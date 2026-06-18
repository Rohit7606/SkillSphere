import React from 'react';
import { db } from '../../../../lib/db';
import { proposals, gigs, freelancers, users, clients } from '../../../../lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { ProposalList } from '../../../../components/proposals/proposal-list';
import { FileText, Search } from 'lucide-react';

export default async function ProposalsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/login');

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) redirect('/onboarding');

  // Determine role
  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));

  let fetchedProposals: any[] = [];
  let isClientView = false;

  if (freelancer && !client) {
    // Freelancer only: show sent proposals WITH GIG INFO
    fetchedProposals = await db.select({
      id: proposals.id,
      gigId: proposals.gigId,
      freelancerId: proposals.freelancerId,
      bidAmount: proposals.bidAmount,
      deliveryDays: proposals.deliveryDays,
      description: proposals.description,
      status: proposals.status,
      createdAt: proposals.createdAt,
      gigTitle: gigs.title,
    })
    .from(proposals)
    .leftJoin(gigs, eq(proposals.gigId, gigs.id))
    .where(eq(proposals.freelancerId, freelancer.id))
    .orderBy(desc(proposals.createdAt));
  } else if (client) {
    // Client: show proposals received for their gigs WITH FREELANCER EMAIL
    isClientView = true;
    const clientGigs = await db.select({ id: gigs.id }).from(gigs).where(eq(gigs.clientId, client.id));
    if (clientGigs.length > 0) {
      fetchedProposals = await db.select({
        id: proposals.id,
        gigId: proposals.gigId,
        freelancerId: proposals.freelancerId,
        bidAmount: proposals.bidAmount,
        deliveryDays: proposals.deliveryDays,
        description: proposals.description,
        status: proposals.status,
        createdAt: proposals.createdAt,
        freelancerEmail: users.email,
        freelancerName: users.name,
      })
      .from(proposals)
      .leftJoin(freelancers, eq(proposals.freelancerId, freelancers.id))
      .leftJoin(users, eq(freelancers.userId, users.id))
      .where(inArray(proposals.gigId, clientGigs.map(g => g.id)))
      .orderBy(desc(proposals.createdAt));
    }
  }

  const displayProposals = fetchedProposals;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000">
          <FileText className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <FileText className="h-8 w-8 text-white" />
              </div>
              {isClientView ? 'Received Proposals' : 'My Proposals'}
            </h1>
            <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
              {isClientView 
                ? 'Review, negotiate, and elegantly manage the bids submitted by top-tier freelancers.' 
                : 'Track the status of all your job applications and project bids in real-time.'}
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-inner">
             <div className="text-center px-4 border-r border-white/20">
               <div className="text-4xl font-black text-white">{displayProposals.length}</div>
               <div className="text-xs text-white/70 uppercase tracking-widest font-bold mt-1">{isClientView ? 'Total Received' : 'Total Sent'}</div>
             </div>
             <div className="text-center px-4">
               <div className="text-4xl font-black text-white">{displayProposals.filter((p: any) => p.status === 'accepted').length}</div>
               <div className="text-xs text-white/70 uppercase tracking-widest font-bold mt-1">Accepted</div>
             </div>
          </div>
        </div>
      </div>



      {/* Content */}
      <div className="w-full">
        <ProposalList proposals={displayProposals as any} isClient={isClientView} gigId={""} />
      </div>

    </div>
  );
}
