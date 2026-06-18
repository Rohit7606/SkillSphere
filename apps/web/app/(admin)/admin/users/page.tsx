import React from 'react';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/db/schema';
import { desc } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { SuspendUserButton } from '../../../../components/admin/suspend-user-button';
import { Search } from 'lucide-react';

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-text-secondary mt-1">View, manage, and moderate platform users.</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
          <input 
            type="text" 
            placeholder="Search users by email..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-sm focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-hover border-b border-border text-text-secondary uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-text-secondary bg-background px-2 py-1 rounded-md border border-border">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-color-success/10 text-color-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-color-success"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-color-error/10 text-color-error">
                        <span className="h-1.5 w-1.5 rounded-full bg-color-error"></span>
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end">
                    <SuspendUserButton userId={user.id} currentStatus={user.status} />
                  </td>
                </tr>
              ))}
              
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    No users found.
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
