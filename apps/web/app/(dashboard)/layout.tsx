import React from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { Topbar } from '../../components/layout/topbar';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '../../lib/db';
import { users } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));
  
  if (!dbUser) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-accent-primary/20">
      
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <Topbar />

        {/* Scrollable Content Region */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 hide-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
