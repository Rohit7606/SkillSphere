import React from 'react';
import { db } from '../../../../lib/db';
import { users, clients } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { GigsClientPage } from './client-page';

export default async function GigsPageWrapper() {
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) notFound();

  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
  const isClientRole = !!client;

  return <GigsClientPage isClientRole={isClientRole} />;
}
