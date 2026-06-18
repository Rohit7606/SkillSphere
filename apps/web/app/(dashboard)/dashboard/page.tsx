import React from 'react';
import { Briefcase, DollarSign, Star, MessageSquare, Home, ArrowUpRight } from 'lucide-react';
import { RevenueChart } from '../../../components/dashboard/revenue-chart';
import { db } from '../../../lib/db';
import { users, freelancers, proposals, payments, reviews, clients, gigs } from '../../../lib/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function DashboardOverview() {
  const { userId: clerkId } = await auth();
  
  // Real Data Fetching (The Builder)
  let activeGigsCount = 0;
  let activeGigsTrend = 0;
  let financialMetric = 0;
  let financialTrend = 0;
  let financialLabel = "Total Earnings";
  let stat3Value: number | string = 4.9;
  let stat3Label = "Reputation";
  let stat3Sub = "Based on 34 reviews";
  let stat3Badge: string | null = null;
  let pendingEscrow = 0;
  let isDbConnected = false;
  let isClient = false;
  
  // Real or mock recent activity
  let recentActivities: any[] = [];

  try {
    if (clerkId) {
      const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
      if (dbUser) {
        const [clientData] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
        const [freelancerData] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
        
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(now.getDate() - 60);

        if (clientData && !freelancerData) {
          isClient = true;
          financialLabel = "Total Spent";
          
          // Live Database Sync for Clients
          const clientPayments = await db.select().from(payments).where(eq(payments.clientId, clientData.id));
          financialMetric = clientPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
          pendingEscrow = clientPayments.filter(p => p.escrowStatus === 'held').reduce((acc, curr) => acc + (curr.amount || 0), 0);

          const currentMonthSpent = clientPayments.filter(p => new Date(p.createdAt || new Date()) >= thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const prevMonthSpent = clientPayments.filter(p => new Date(p.createdAt || new Date()) >= sixtyDaysAgo && new Date(p.createdAt || new Date()) < thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          financialTrend = prevMonthSpent === 0 ? (currentMonthSpent > 0 ? 100 : 0) : Math.round(((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100);

          const clientGigs = await db.select().from(gigs).where(and(eq(gigs.clientId, clientData.id), eq(gigs.status, 'in_progress')));
          activeGigsCount = clientGigs.length;

          const currentMonthGigs = clientGigs.filter(g => new Date(g.createdAt || new Date()) >= thirtyDaysAgo).length;
          const prevMonthGigs = clientGigs.filter(g => new Date(g.createdAt || new Date()) >= sixtyDaysAgo && new Date(g.createdAt || new Date()) < thirtyDaysAgo).length;
          activeGigsTrend = prevMonthGigs === 0 ? (currentMonthGigs > 0 ? 100 : 0) : Math.round(((currentMonthGigs - prevMonthGigs) / prevMonthGigs) * 100);

          stat3Label = "Freelancers Hired";
          const acceptedProposals = await db.select().from(proposals).innerJoin(gigs, eq(proposals.gigId, gigs.id)).where(and(eq(gigs.clientId, clientData.id), eq(proposals.status, 'accepted')));
          const uniqueFreelancers = new Set(acceptedProposals.map(p => p.proposals.freelancerId));
          stat3Value = uniqueFreelancers.size;
          stat3Sub = `Across ${activeGigsCount} projects`;
          
          const recentProposals = await db.select({ title: gigs.title, date: proposals.createdAt }).from(proposals).innerJoin(gigs, eq(proposals.gigId, gigs.id)).where(and(eq(gigs.clientId, clientData.id), eq(proposals.status, 'accepted'))).orderBy(desc(proposals.createdAt)).limit(3);
          const recentPaymentsList = await db.select({ status: payments.status, amount: payments.amount, date: payments.createdAt }).from(payments).where(eq(payments.clientId, clientData.id)).orderBy(desc(payments.createdAt)).limit(3);
          
          const acts: any[] = [];
          recentProposals.forEach(p => acts.push({ type: 'proposal', title: 'Proposal Accepted', desc: p.title, time: p.date, icon: Briefcase, colorClasses: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20 group-hover:text-accent-primary' }));
          recentPaymentsList.forEach(p => acts.push({ type: 'payment', title: `Payment ${p.status}`, desc: `₹${p.amount}`, time: p.date, icon: DollarSign, colorClasses: 'bg-success/10 text-success border-success/20 group-hover:text-success' }));
          
          acts.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
          recentActivities = acts.slice(0, 4).map(a => ({ ...a, time: new Date(a.time).toLocaleDateString() }));
          
          isDbConnected = true;
        } else if (freelancerData) {
          isDbConnected = true;
          
          // Live Database Sync for Freelancers
          const freelancerPayments = await db.select().from(payments).where(eq(payments.freelancerId, freelancerData.id));
          financialMetric = freelancerPayments.filter(p => p.escrowStatus === 'released').reduce((acc, curr) => acc + (curr.amount || 0), 0);
          pendingEscrow = freelancerPayments.filter(p => p.escrowStatus === 'held').reduce((acc, curr) => acc + (curr.amount || 0), 0);
          
          const currentMonthEarned = freelancerPayments.filter(p => p.escrowStatus === 'released' && new Date(p.createdAt || new Date()) >= thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          const prevMonthEarned = freelancerPayments.filter(p => p.escrowStatus === 'released' && new Date(p.createdAt || new Date()) >= sixtyDaysAgo && new Date(p.createdAt || new Date()) < thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
          financialTrend = prevMonthEarned === 0 ? (currentMonthEarned > 0 ? 100 : 0) : Math.round(((currentMonthEarned - prevMonthEarned) / prevMonthEarned) * 100);

          const freelancerProposals = await db.select().from(proposals).where(and(eq(proposals.freelancerId, freelancerData.id), eq(proposals.status, 'accepted')));
          activeGigsCount = freelancerProposals.length;

          const currentMonthProps = freelancerProposals.filter(p => new Date(p.createdAt || new Date()) >= thirtyDaysAgo).length;
          const prevMonthProps = freelancerProposals.filter(p => new Date(p.createdAt || new Date()) >= sixtyDaysAgo && new Date(p.createdAt || new Date()) < thirtyDaysAgo).length;
          activeGigsTrend = prevMonthProps === 0 ? (currentMonthProps > 0 ? 100 : 0) : Math.round(((currentMonthProps - prevMonthProps) / prevMonthProps) * 100);

          const freelancerReviews = await db.select().from(reviews).where(eq(reviews.revieweeId, dbUser.id));
          const reviewCount = freelancerReviews.length;
          const avgRating = reviewCount > 0 ? (freelancerReviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1) : "0.0";
          stat3Value = avgRating;
          stat3Sub = `Based on ${reviewCount} reviews`;
          if (reviewCount > 0 && Number(avgRating) >= 4.8) stat3Badge = "Top 5%";
          else if (reviewCount > 0 && Number(avgRating) >= 4.5) stat3Badge = "Top 10%";
          else stat3Badge = null;

          const recentProposals = await db.select({ title: gigs.title, date: proposals.createdAt }).from(proposals).innerJoin(gigs, eq(proposals.gigId, gigs.id)).where(and(eq(proposals.freelancerId, freelancerData.id), eq(proposals.status, 'accepted'))).orderBy(desc(proposals.createdAt)).limit(3);
          const recentPaymentsList = await db.select({ status: payments.status, amount: payments.amount, date: payments.createdAt }).from(payments).where(eq(payments.freelancerId, freelancerData.id)).orderBy(desc(payments.createdAt)).limit(3);
          const recentReviewsQuery = await db.select({ rating: reviews.rating, comment: reviews.comment, date: reviews.createdAt }).from(reviews).where(eq(reviews.revieweeId, dbUser.id)).orderBy(desc(reviews.createdAt)).limit(3);
          
          const acts: any[] = [];
          recentProposals.forEach(p => acts.push({ type: 'proposal', title: 'Proposal Accepted', desc: p.title, time: p.date, icon: Briefcase, colorClasses: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20 group-hover:text-accent-primary' }));
          recentPaymentsList.forEach(p => acts.push({ type: 'payment', title: `Payment ${p.status}`, desc: `₹${p.amount}`, time: p.date, icon: DollarSign, colorClasses: 'bg-success/10 text-success border-success/20 group-hover:text-success' }));
          recentReviewsQuery.forEach(r => acts.push({ type: 'review', title: `${r.rating}-Star Review`, desc: `"${(r.comment || '').substring(0, 20)}..."`, time: r.date, icon: Star, colorClasses: 'bg-surface-hover text-foreground border-border group-hover:text-foreground' }));
          
          acts.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
          recentActivities = acts.slice(0, 4).map(a => ({ ...a, time: new Date(a.time).toLocaleDateString() }));
        }
      }
    }
  } catch (error) {
    console.error("Dashboard DB fetch failed, using mock data:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <Home className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <Home className="h-8 w-8 text-white" />
            </div>
            Dashboard
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Welcome back! Track and manage your projects elegantly.
            {isDbConnected && <span className="block text-sm text-white/60 mt-1">Live data synced securely from Supabase.</span>}
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex items-center gap-3 w-full md:w-auto">
          <Link href="/dashboard/analytics" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all shadow-lg hover:-translate-y-0.5 text-sm flex items-center gap-2 backdrop-blur-md">
            Analytics
          </Link>
          <Link href="/dashboard/gigs" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all shadow-lg hover:-translate-y-0.5 text-sm flex items-center gap-2 backdrop-blur-md">
            View Projects
          </Link>
        </div>
      </div>

      {/* KPI Cards (The Design Lead) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI Card 1 */}
        <div className="bg-surface rounded-2xl p-7 hover:-translate-y-1 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-primary/5 rounded-full blur-xl group-hover:bg-accent-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Active Gigs</h3>
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              <Briefcase className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-end gap-3 relative z-10">
            <div className="text-5xl font-black text-foreground tracking-tighter">{activeGigsCount}</div>
            <p className={`text-sm font-bold flex items-center gap-1 mb-1.5 ${activeGigsTrend >= 0 ? 'text-success' : 'text-red-500'}`}>
              {activeGigsTrend >= 0 ? <ArrowUpRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4 rotate-90"/>} 
              {Math.abs(activeGigsTrend)}%
            </p>
          </div>
          <p className="text-sm text-text-disabled font-medium mt-2 relative z-10">Month over Month</p>
        </div>
        
        {/* KPI Card 2 */}
        <div className="bg-surface rounded-2xl p-7 hover:-translate-y-1 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{financialLabel}</h3>
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success border border-success/20">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-end gap-3 relative z-10">
            <div className="text-5xl font-black text-foreground tracking-tighter">₹{financialMetric.toLocaleString()}</div>
            <p className={`text-sm font-bold flex items-center gap-1 mb-1.5 ${financialTrend >= 0 ? 'text-success' : 'text-red-500'}`}>
              {financialTrend >= 0 ? <ArrowUpRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4 rotate-90"/>} 
              {Math.abs(financialTrend)}%
            </p>
          </div>
          <p className="text-sm text-text-disabled font-medium mt-2 relative z-10">Pending escrow: ₹{pendingEscrow.toLocaleString()}</p>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-surface rounded-2xl p-7 hover:-translate-y-1 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-warning/5 rounded-full blur-xl group-hover:bg-warning/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{stat3Label}</h3>
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10 text-warning border border-warning/20">
              <Star className="w-5 h-5 fill-warning/50" />
            </span>
          </div>
          <div className="mt-4 flex items-end gap-3 relative z-10">
            <div className="text-5xl font-black text-foreground tracking-tighter">{stat3Value}</div>
            {!isClient && stat3Badge && <p className="text-sm font-bold text-text-secondary bg-surface-hover px-2.5 py-0.5 rounded-full mb-1 border border-border">{stat3Badge}</p>}
          </div>
          <p className="text-sm text-text-disabled font-medium mt-2 relative z-10">{stat3Sub}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-4">
        {/* Main Chart Area */}
        <RevenueChart />

        {/* Sidebar Data Area */}
        <div className="md:col-span-1 xl:col-span-1 bg-surface rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col relative overflow-hidden">
          <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-background rounded-2xl border border-border border-dashed">
                <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-3">
                  <Star className="w-5 h-5 text-text-disabled" />
                </div>
                <p className="text-sm font-semibold text-foreground">No recent activity</p>
                <p className="text-xs text-text-secondary mt-1">When things happen, they will show up here.</p>
              </div>
            ) : recentActivities.map((act, i) => {
              const Icon = act.icon;
              // Map activity types to routes
              const routeMap: Record<string, string> = {
                'proposal': '/dashboard/proposals',
                'payment': '/dashboard/payments',
                'message': '/dashboard/messages',
                'review': '/dashboard/reviews'
              };
              
              return (
                <Link key={i} href={routeMap[act.type] || '/dashboard'} className="flex items-start gap-4 group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-110 transition-transform ${act.colorClasses.split(' ').slice(0,3).join(' ')}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`font-bold text-foreground text-base transition-colors ${act.colorClasses.split(' ')[3]}`}>{act.title}</div>
                    <div className="text-sm text-text-secondary font-medium mt-0.5 line-clamp-1">{act.desc}</div>
                    <div className="text-xs text-text-disabled mt-1.5 font-bold uppercase tracking-wider">{act.time}</div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <Link href="/dashboard/analytics" className="w-full mt-4 py-3 rounded-xl border border-border bg-background text-foreground font-bold hover:bg-surface-hover transition-colors flex justify-center items-center">
            View All Activity
          </Link>
        </div>
      </div>
    </div>
  );
}
