import React from 'react';
import { db } from '../../../../lib/db';
import { disputes, gigs, users } from '../../../../lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ResolveDisputeActions } from '../../../../components/admin/resolve-dispute-actions';

export default async function AdminDisputesPage() {
  const allDisputes = await db
    .select({
      id: disputes.id,
      reason: disputes.reason,
      status: disputes.status,
      createdAt: disputes.createdAt,
      gigTitle: gigs.title,
      raisedByEmail: users.email
    })
    .from(disputes)
    .leftJoin(gigs, eq(gigs.id, disputes.gigId))
    .leftJoin(users, eq(users.id, disputes.raisedBy))
    .orderBy(desc(disputes.createdAt));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-color-error" />
          Dispute Resolution
        </h1>
        <p className="text-text-secondary mt-1">Mediate conflicts and release held escrow funds.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-hover border-b border-border text-text-secondary uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Gig Title</th>
                <th className="px-6 py-4">Raised By</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {dispute.gigTitle}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {dispute.raisedByEmail}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={dispute.reason}>
                    {dispute.reason}
                  </td>
                  <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                    {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    {dispute.status === 'open' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-color-error/10 text-color-error border border-color-error/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-color-error animate-pulse"></span>
                        Requires Action
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-color-success/10 text-color-success">
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      {dispute.status === 'open' && (
                        <ResolveDisputeActions disputeId={dispute.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {allDisputes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    No active disputes found! 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
