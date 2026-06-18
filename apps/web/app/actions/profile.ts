"use server";
import { db } from '../../lib/db';
import { users, freelancers, clients } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

export async function updateProfile(data: { bio: string | null; location: string | null; hourlyRate: number; displayName?: string }) {
  const dbUser = await getDbUser();
  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  const [client] = await db.select().from(clients).where(eq(clients.userId, dbUser.id));
  
  if (data.displayName) {
    await db.update(users).set({ name: data.displayName }).where(eq(users.id, dbUser.id));
  }
  
  if (client && !freelancer) {
    await db.update(clients).set({ 
      location: data.location 
    }).where(eq(clients.id, client.id));
  } else {
    if (freelancer) {
      await db.update(freelancers).set({ 
        bio: data.bio, 
        location: data.location, 
        hourlyRate: data.hourlyRate 
      }).where(eq(freelancers.id, freelancer.id));
    } else {
      await db.insert(freelancers).values({
        userId: dbUser.id,
        bio: data.bio,
        location: data.location,
        hourlyRate: data.hourlyRate,
        skills: [],
        reputationScore: 0
      });
    }
  }
  revalidatePath('/dashboard', 'layout');
}

export async function uploadPortfolioImage(formData: FormData) {
  const dbUser = await getDbUser();
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const tech = formData.get('tech') as string;
  
  if (!file || !title) throw new Error("Missing fields");
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
  
  const uploadResponse = await cloudinary.uploader.upload(base64Image, { folder: 'skillsphere/portfolio' });
  
  const [freelancer] = await db.select().from(freelancers).where(eq(freelancers.userId, dbUser.id));
  
  const newItem = {
    id: Date.now(),
    title,
    tech,
    image: uploadResponse.secure_url
  };
  
  if (freelancer) {
    const currentPortfolio = freelancer.portfolio || [];
    await db.update(freelancers).set({ portfolio: [newItem, ...currentPortfolio] }).where(eq(freelancers.id, freelancer.id));
  } else {
    await db.insert(freelancers).values({
      userId: dbUser.id,
      portfolio: [newItem],
      skills: [],
      reputationScore: 0
    });
  }
  revalidatePath('/dashboard/profile');
  return newItem;
}

export async function uploadAvatar(formData: FormData) {
  const dbUser = await getDbUser();
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file");
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
  
  const uploadResponse = await cloudinary.uploader.upload(base64Image, { folder: 'skillsphere/avatars' });
  const url = uploadResponse.secure_url;
  
  await db.update(users).set({ avatarUrl: url }).where(eq(users.id, dbUser.id));
  revalidatePath('/dashboard/profile');
  return url;
}
