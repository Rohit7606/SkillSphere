import React from 'react';
import { db } from '../../../../lib/db';
import { payments, users, clients, freelancers, gigs } from '../../../../lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck } from 'lucide-react';
import { DownloadCsvButton } from '../../../../components/payments/download-csv-button';

export default async function PaymentsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/login');

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) redirect('/onboarding');

  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));

  let fetchedPayments: any[] = [];
  let isClient = false;

  if (client) {
    isClient = true;
    fetchedPayments = await db.select().from(payments).where(eq(payments.clientId, client.id)).orderBy(desc(payments.id));
  } else if (freelancer) {
    fetchedPayments = await db.select().from(payments).where(eq(payments.freelancerId, freelancer.id)).orderBy(desc(payments.id));
  }

  const displayPayments = fetchedPayments;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent-primary via-[#7256D6] to-foreground p-10 shadow-2xl group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Animated Background Mesh/Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[50%] -right-[10%] w-[70%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
          <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[150%] bg-black/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000 pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-white" />
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-white drop-shadow-md">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            Financial Overview
          </h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg font-medium leading-relaxed">
            Manage your transactions, escrow funds, and active payment gateways securely.
          </p>
        </div>
          
          <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[200px] shadow-inner">
              <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Total {isClient ? 'Spent' : 'Earned'}</div>
              <div className="text-4xl font-black text-white flex items-center">
                ₹{displayPayments.filter(p => isClient ? true : p.escrowStatus === 'released').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
      </div>

      {/* Transaction List */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary">
          <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
          <DownloadCsvButton data={displayPayments} />
        </div>
        
        <div className="divide-y divide-border">
          {displayPayments.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">No transactions found.</div>
          ) : (
            displayPayments.map((payment: any, i: number) => (
              <div key={payment.id || i} className="p-6 flex items-center justify-between hover:bg-surface-hover/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    payment.type === 'credit' || !isClient ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {payment.type === 'credit' || !isClient ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-lg">{payment.gigTitle || "Milestone Payment"}</div>
                    <div className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(payment.date || payment.createdAt).toLocaleDateString()} &bull; Txn ID: {payment.id}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold text-xl ${
                    payment.type === 'credit' || !isClient ? 'text-success' : 'text-foreground'
                  }`}>
                    {payment.type === 'credit' || !isClient ? '+' : '-'}₹{payment.amount?.toLocaleString()}
                  </div>
                  <div className="mt-1">
                    {payment.escrowStatus === 'held' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <ShieldCheck className="h-3 w-3" /> In Escrow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        Released
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
