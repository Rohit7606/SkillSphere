"use server";

import { db } from "../../lib/db";
import { users, freelancers, clients } from "../../lib/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function submitOnboarding(role: "client" | "freelancer", additionalData: any) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || `${userId}@example.com`;

  try {
    // Insert into users table
    const [newUser] = await db.insert(users).values({
      clerkId: userId,
      email,
      role,
      status: 'active'
    }).returning();

    // Create profile
    if (role === 'client') {
      await db.insert(clients).values({
        userId: newUser.id,
        company: additionalData.company || "Individual",
        location: additionalData.location || "Remote"
      });
    } else {
      await db.insert(freelancers).values({
        userId: newUser.id,
        skills: additionalData.skills || [],
        bio: additionalData.bio || "Hello, I am a freelancer.",
        hourlyRate: additionalData.hourlyRate || 0,
        location: additionalData.location || "Remote",
        reputationScore: 0
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Onboarding Error:", err);
    return { success: false, error: err.message };
  }
}
