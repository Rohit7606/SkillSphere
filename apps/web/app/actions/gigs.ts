"use server";

import { db } from "../../lib/db";
import { gigs, users, clients, proposals, reviews, messages, payments, disputes } from "../../lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createGigAction(data: { title: string; description: string; budget: number; location: string }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Find or create the user in the database based on Clerk ID
    let dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1).then(res => res[0]);
    
    if (!dbUser) {
      // Auto-create user for development purposes if they don't exist yet
      [dbUser] = await db.insert(users).values({
        email: `${userId}@example.com`, // Dummy email
        role: "client",
        clerkId: userId,
      }).returning();
    }

    // 2. Find or create the client profile
    let dbClient = await db.select().from(clients).where(eq(clients.userId, dbUser.id)).limit(1).then(res => res[0]);
    
    if (!dbClient) {
      [dbClient] = await db.insert(clients).values({
        userId: dbUser.id,
        company: "My Company",
        location: data.location || "Remote",
      }).returning();
    }

    // 3. Insert the Gig using the correct Client UUID
    const [newGig] = await db.insert(gigs).values({
      clientId: dbClient.id,
      title: data.title,
      description: data.description,
      budget: data.budget,
      location: data.location || "Remote",
      status: "open",
      milestones: [],
    }).returning();

    // Invalidate the cache for the gigs page so TanStack query refetches or Next.js revalidates
    revalidatePath("/dashboard/gigs");

    return { success: true, data: newGig };
  } catch (error: any) {
    console.error("Create Gig Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGigAction(gigId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1).then(res => res[0]);
    if (!dbUser) return { success: false, error: "User not found" };

    const dbClient = await db.select().from(clients).where(eq(clients.userId, dbUser.id)).limit(1).then(res => res[0]);
    if (!dbClient) return { success: false, error: "Client profile not found" };

    // Delete the gig where id matches and clientId matches (security check)
    // First we must import `and` from drizzle-orm, but since eq is imported, we can just delete and verify.
    // Wait, let's just delete by gigId and clientId.
    // Instead of importing 'and', we can use .where(eq(gigs.id, gigId)).
    // A more secure way without 'and' is to fetch the gig first.
    const existingGig = await db.select().from(gigs).where(eq(gigs.id, gigId)).limit(1).then(res => res[0]);
    
    if (!existingGig || existingGig.clientId !== dbClient.id) {
       return { success: false, error: "Gig not found or unauthorized" };
    }

    // Perform manual cascade delete of all child tables
    await db.delete(proposals).where(eq(proposals.gigId, gigId));
    await db.delete(reviews).where(eq(reviews.gigId, gigId));
    await db.delete(messages).where(eq(messages.gigId, gigId));
    await db.delete(payments).where(eq(payments.gigId, gigId));
    await db.delete(disputes).where(eq(disputes.gigId, gigId));

    // Finally delete the parent gig
    await db.delete(gigs).where(eq(gigs.id, gigId));

    revalidatePath("/dashboard/gigs");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Gig Error:", error);
    return { success: false, error: error.message };
  }
}
