import { config } from 'dotenv';
import path from 'path';

// Try loading from apps/web/.env.local or apps/web/.env
config({ path: path.resolve(process.cwd(), 'apps/web/.env.local') });
if (!process.env.DATABASE_URL) {
  config({ path: path.resolve(process.cwd(), 'apps/web/.env') });
}
// Fallback to root .env
if (!process.env.DATABASE_URL) {
  config({ path: path.resolve(process.cwd(), '.env') });
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import crypto from 'crypto';
import * as schema from './apps/web/lib/db/schema';

if (!process.env.DATABASE_URL) {
  console.error("NO DATABASE_URL FOUND in environment!");
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting to seed gigs...");
  
  // 1. Find a client, or create one if none exists
  let clientsList = await db.select().from(schema.clients).limit(1);
  let clientId = clientsList.length > 0 ? clientsList[0].id : null;
  
  if (!clientId) {
    console.log("No client found. Creating a dummy client...");
    // Need a user first
    let usersList = await db.select().from(schema.users).limit(1);
    let userId = usersList.length > 0 ? usersList[0].id : null;
    
    if (!userId) {
       userId = crypto.randomUUID();
       await db.insert(schema.users).values({
         id: userId,
         email: 'dummyclient@example.com',
         role: 'client',
         clerkId: 'user_dummy_clerk_id_' + Date.now()
       });
    }
    
    clientId = crypto.randomUUID();
    await db.insert(schema.clients).values({
      id: clientId,
      userId: userId,
      company: 'Acme Corp Seeded',
      location: 'Remote'
    });
    console.log("Dummy client created: " + clientId);
  } else {
    console.log("Using existing client: " + clientId);
  }
  
  // 2. Generate multiple varied gigs
  const sampleGigs = [
    {
      title: "React Native Mobile App for E-commerce",
      description: "We are looking for an experienced React Native developer to build a mobile app for our existing e-commerce store. Needs to support iOS and Android.",
      budget: 85000,
      location: "Remote",
      status: "open"
    },
    {
      title: "UI/UX Designer for Fintech Dashboard",
      description: "Need a modern, sleek, and intuitive dashboard design for a new fintech startup. Deliverables must be in Figma with full design system.",
      budget: 45000,
      location: "New York",
      status: "open"
    },
    {
      title: "Python Backend Developer for AI API",
      description: "Looking for a Python expert with FastAPI experience to build the backend for our generative AI tool. Must know how to integrate with HuggingFace.",
      budget: 120000,
      location: "Remote",
      status: "open"
    },
    {
      title: "SEO Optimization for Local Business",
      description: "Need an SEO expert to optimize our plumbing business website. Target local keywords in Chennai and improve Google My Business ranking.",
      budget: 15000,
      location: "Chennai",
      status: "open"
    },
    {
      title: "Full Stack Next.js & Supabase Project",
      description: "We are building a SaaS platform. Need a full stack dev comfortable with Next.js App Router, Tailwind CSS, and Supabase auth/db.",
      budget: 95000,
      location: "Remote",
      status: "open"
    },
    {
      title: "Video Editor for YouTube Tech Channel",
      description: "Looking for a video editor who can edit 10-15 minute tech review videos. Style should be similar to MKBHD. Adobe Premiere or Final Cut.",
      budget: 20000,
      location: "Remote",
      status: "open"
    },
    {
      title: "Smart Contract Developer (Solidity)",
      description: "Need a web3 developer to write and audit a staking smart contract on Ethereum. High priority on security and gas optimization.",
      budget: 150000,
      location: "London",
      status: "open"
    },
    {
      title: "Flutter App Bug Fixing",
      description: "We have an existing Flutter application with a few UI glitches and performance issues on older Android devices. Need someone to patch it.",
      budget: 25000,
      location: "Remote",
      status: "open"
    }
  ];
  
  for (const gig of sampleGigs) {
    await db.insert(schema.gigs).values({
      id: crypto.randomUUID(),
      clientId: clientId,
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      location: gig.location,
      status: gig.status as any,
      milestones: []
    });
  }
  
  console.log(`Successfully seeded ${sampleGigs.length} gigs into the database!`);
  process.exit(0);
}

seed().catch(e => {
  console.error("Error seeding gigs:", e);
  process.exit(1);
});
