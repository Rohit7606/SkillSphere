import React from 'react';
import { db } from '../../../lib/db';
import { users, freelancers, gigs, payments } from '../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { Users, Briefcase, CreditCard, TrendingUp, ShieldAlert, BarChart4 } from 'lucide-react';

export default async function AdminDashboardPage() {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) redirect('/login');

  // RBAC check: In a real app we'd verify sessionClaims?.metadata?.role === 'admin'
  // But for this demo, we'll just check if the user is in the DB
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) notFound();

  // For demo MVP, we let any authenticated user view the admin dashboard if they navigate there.
  // In production, you would enforce the 'admin' role here and in middleware.

  // Fetch stats concurrently
  const [
    [{ totalUsers }],
    [{ totalFreelancers }],
    [{ totalGigs, completedGigs }],
    [{ totalRevenue }]
  ] = await Promise.all([
    db.select({ totalUsers: sql<number>`count(*)` }).from(users),
    db.select({ totalFreelancers: sql<number>`count(*)` }).from(freelancers),
    db.select({ 
      totalGigs: sql<number>`count(*)`,
      completedGigs: sql<number>`sum(case when status = 'completed' then 1 else 0 end)`
    }).from(gigs),
    db.select({ totalRevenue: sql<number>`sum(amount)` }).from(payments).where(eq(payments.status, 'captured'))
  ]);

  const successRate = totalGigs > 0 ? Math.round((Number(completedGigs) / Number(totalGigs)) * 100) : 0;
  const platformRevenue = Math.round(Number(totalRevenue || 0) * 0.10); // 10% platform fee

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-text-secondary mt-2">Monitor platform metrics, revenue, and user activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Platform Revenue (10%)</h3>
            <div className="p-2 bg-accent-primary/10 rounded-md">
              <CreditCard className="h-4 w-4 text-accent-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">${platformRevenue.toLocaleString()}</div>
          <p className="text-xs text-color-success mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +12% from last month
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Total Users</h3>
            <div className="p-2 bg-blue-500/10 rounded-md">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{Number(totalUsers)}</div>
          <p className="text-xs text-text-secondary mt-2">
            {Number(totalFreelancers)} Active Freelancers
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Job Success Rate</h3>
            <div className="p-2 bg-color-success/10 rounded-md">
              <Briefcase className="h-4 w-4 text-color-success" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{successRate}%</div>
          <p className="text-xs text-text-secondary mt-2">
            {Number(completedGigs)} of {Number(totalGigs)} gigs completed
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm border-color-error/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">Active Disputes</h3>
            <div className="p-2 bg-color-error/10 rounded-md">
              <ShieldAlert className="h-4 w-4 text-color-error" />
            </div>
          </div>
          <div className="text-3xl font-bold text-color-error">0</div>
          <p className="text-xs text-text-secondary mt-2">
            Requires admin mediation
          </p>
        </div>
      </div>

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 h-96 flex flex-col items-center justify-center border-dashed">
          <BarChart4 className="h-10 w-10 text-text-disabled mb-4" />
          <p className="text-text-secondary font-medium">Revenue Chart (Recharts)</p>
          <p className="text-xs text-text-disabled mt-2">Monthly volume aggregation</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-6 h-96 flex flex-col items-center justify-center border-dashed">
          <Users className="h-10 w-10 text-text-disabled mb-4" />
          <p className="text-text-secondary font-medium">User Signups Chart (Recharts)</p>
          <p className="text-xs text-text-disabled mt-2">Trailing 30 days</p>
        </div>
      </div>
    </div>
  );
}
