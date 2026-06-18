import React from 'react';
import { db } from '../../../../lib/db';
import { users, freelancers, proposals, payments, reviews, clients, gigs } from '../../../../lib/db/schema';
import { eq, sum, count, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { BarChart, Wallet, FileText, Star, TrendingUp } from 'lucide-react';
import { RevenueChart } from '../../../../components/dashboard/revenue-chart';
import { ReviewAnalytics } from '../../../../components/reviews/review-analytics';
import Link from 'next/link';

export default async function AnalyticsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/login');

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) redirect('/onboarding');

  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));

  if (!freelancer && !client) {
    return (
      <div className="p-8 text-center space-y-4">
        <BarChart className="h-12 w-12 text-text-disabled mx-auto" />
        <h2 className="text-xl font-bold">Analytics not available</h2>
        <p className="text-text-secondary">Please complete your profile to view analytics.</p>
      </div>
    );
  }

  // --- CLIENT VIEW ---
  if (client && !freelancer) {
    let [{ totalSpent }] = await db.select({ totalSpent: sum(payments.amount) })
      .from(payments).where(eq(payments.clientId, client.id));
      
    let [{ activeGigs }] = await db.select({ activeGigs: count() })
      .from(gigs).where(and(eq(gigs.clientId, client.id), eq(gigs.status, 'in_progress')));

    const clientPayments = await db.select({
      freelancerId: payments.freelancerId,
      amount: payments.amount,
      freelancerEmail: users.email,
      freelancerName: users.name,
    }).from(payments)
    .innerJoin(freelancers, eq(freelancers.id, payments.freelancerId))
    .innerJoin(users, eq(users.id, freelancers.userId))
    .where(eq(payments.clientId, client.id));

    const topHiresMap = new Map<string, { name: string, amount: number, initials: string, color: string }>();
    const colors = ['from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-teal-500'];
    let colorIdx = 0;
    
    for (const p of clientPayments) {
      const existing = topHiresMap.get(p.freelancerId) || { 
        name: p.freelancerName || (p.freelancerEmail ? p.freelancerEmail.split('@')[0] : 'Freelancer'), 
        amount: 0, 
        initials: p.freelancerName ? p.freelancerName.charAt(0).toUpperCase() : (p.freelancerEmail ? p.freelancerEmail.charAt(0).toUpperCase() : 'F'),
        color: colors[colorIdx++ % colors.length]
      };
      existing.amount += (p.amount || 0);
      topHiresMap.set(p.freelancerId, existing);
    }
    const topHires = Array.from(topHiresMap.values()).sort((a, b) => b.amount - a.amount).slice(0, 5);
      
      return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Animated Background Mesh/Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
            <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
          </div>
          
          <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
            <BarChart className="w-96 h-96 text-white" />
          </div>
          
          <div className="relative z-10 w-full">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <BarChart className="h-8 w-8 text-white" />
              </div>
              Client Dashboard
            </h1>
            <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
              Overview of your spending and active projects.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Total Spent Card */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-accent-primary/30 transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
              <Wallet className="w-32 h-32 text-foreground" />
            </div>
            <div className="relative z-10 flex items-center gap-2 text-text-secondary font-semibold uppercase tracking-wider text-sm mb-2">
              <div className="p-2 bg-accent-primary/10 rounded-lg">
                <Wallet className="h-4 w-4 text-accent-primary" />
              </div>
              Total Spent
            </div>
            <div className="relative z-10 text-5xl font-black text-foreground tracking-tighter">
              ₹{Number(totalSpent || 0).toLocaleString()}
            </div>
          </div>
          
          {/* Active Gigs Card */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-accent-primary/30 transition-colors">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
              <FileText className="w-32 h-32 text-foreground" />
            </div>
            <div className="relative z-10 flex items-center gap-2 text-text-secondary font-semibold uppercase tracking-wider text-sm mb-2">
              <div className="p-2 bg-accent-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-accent-primary" />
              </div>
              Active Gigs
            </div>
            <div className="relative z-10 text-5xl font-black text-foreground tracking-tighter">
              {activeGigs}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <RevenueChart title="Spending Analytics" subtitle="Capital deployment velocity" isClient={true} />
          </div>
          
          <div className="lg:col-span-1 bg-surface border border-border rounded-[2rem] p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div>
                <h3 className="text-xl font-bold text-foreground mb-6">Top Hires</h3>
                <div className="space-y-4">
                  {topHires.length === 0 ? (
                    <div className="text-sm text-text-secondary">No hires yet.</div>
                  ) : topHires.map((hire, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-hover transition-colors border border-transparent hover:border-border cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${hire.color} flex items-center justify-center text-white font-bold`}>{hire.initials}</div>
                        <div>
                          <div className="font-semibold text-foreground">{hire.name}</div>
                          <div className="text-xs text-text-secondary">{hire.role}</div>
                        </div>
                      </div>
                      <div className="font-bold text-foreground">₹{hire.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
             </div>
             
             <Link href="/dashboard/gigs" className="w-full mt-6 py-3 rounded-xl border border-border bg-background text-foreground font-bold hover:bg-surface-hover transition-colors flex justify-center items-center">
               View Freelancer Roster
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- FREELANCER VIEW ---

  // Fetch Proposals count
  const [{ totalProposals }] = await db
    .select({ totalProposals: count() })
    .from(proposals)
    .where(eq(proposals.freelancerId, freelancer.id));

  // Fetch Earnings
  const freelancerPayments = await db.select().from(payments)
    .where(and(eq(payments.freelancerId, freelancer.id), eq(payments.escrowStatus, 'released')));
  
  const totalEarnings = freelancerPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const currentMonthEarned = freelancerPayments.filter(p => new Date(p.createdAt || new Date()) >= thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const prevMonthEarned = freelancerPayments.filter(p => new Date(p.createdAt || new Date()) >= sixtyDaysAgo && new Date(p.createdAt || new Date()) < thirtyDaysAgo).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const earningsTrend = prevMonthEarned === 0 ? (currentMonthEarned > 0 ? 100 : 0) : Math.round(((currentMonthEarned - prevMonthEarned) / prevMonthEarned) * 100);

  // Fetch Reviews info
  const allReviews = await db
    .select({
      rating: reviews.rating,
      comment: reviews.comment,
    })
    .from(reviews)
    .where(eq(reviews.revieweeId, dbUser.id));

  const averageRating = allReviews.length 
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length 
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <BarChart className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <BarChart className="h-8 w-8 text-white" />
            </div>
            Freelancer Analytics
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Track your performance, earnings, and client feedback.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {/* Total Earnings Card */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-accent-primary/30 transition-colors">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
            <Wallet className="w-32 h-32 text-foreground" />
          </div>
          <div className="relative z-10 flex items-center gap-2 text-text-secondary font-semibold uppercase tracking-wider text-sm mb-2">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <Wallet className="h-4 w-4 text-accent-primary" />
            </div>
            Total Earnings
          </div>
          <div className="relative z-10 text-5xl font-black text-foreground tracking-tighter">
            ₹{Number(totalEarnings || 0).toLocaleString()}
          </div>
          <div className={`relative z-10 text-xs font-semibold flex items-center gap-1.5 mt-auto pt-2 ${earningsTrend >= 0 ? 'text-success' : 'text-red-500'}`}>
            <div className={`p-1 rounded-full ${earningsTrend >= 0 ? 'bg-success/20' : 'bg-red-500/20'}`}>
              <TrendingUp className={`h-3 w-3 ${earningsTrend < 0 ? 'rotate-180' : ''}`} />
            </div>
            {earningsTrend >= 0 ? '+' : '-'}{Math.abs(earningsTrend)}% from last month
          </div>
        </div>

        {/* Proposals Sent Card */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-accent-primary/30 transition-colors">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none">
            <FileText className="w-32 h-32 text-foreground" />
          </div>
          <div className="relative z-10 flex items-center gap-2 text-text-secondary font-semibold uppercase tracking-wider text-sm mb-2">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <FileText className="h-4 w-4 text-accent-primary" />
            </div>
            Proposals Sent
          </div>
          <div className="relative z-10 text-5xl font-black text-foreground tracking-tighter">
            {totalProposals}
          </div>
          <div className="relative z-10 text-xs font-medium text-text-secondary mt-auto pt-2">
            Actively bidding
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-accent-primary/30 transition-colors">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <Star className="w-32 h-32 text-foreground" />
          </div>
          <div className="relative z-10 flex items-center gap-2 text-text-secondary font-semibold uppercase tracking-wider text-sm mb-2">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <Star className="h-4 w-4 text-accent-primary" />
            </div>
            Average Rating
          </div>
          <div className="relative z-10 text-5xl font-black text-foreground tracking-tighter flex items-end gap-1">
            {averageRating.toFixed(1)} <span className="text-2xl text-text-secondary font-bold mb-1.5">/ 5.0</span>
          </div>
          <div className="relative z-10 text-xs font-medium text-text-secondary mt-auto pt-2">
            From {allReviews.length} client reviews
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Mock Revenue Chart */}
          <RevenueChart title="Monthly Revenue" subtitle="Income velocity over the past 6 months" />
        </div>

        <div className="lg:col-span-1">
          {/* Review Analytics Breakdown */}
          <div className="h-96">
            <ReviewAnalytics reviews={allReviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
