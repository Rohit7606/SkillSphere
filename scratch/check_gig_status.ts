import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env' });

import { db } from '../apps/web/lib/db';
import { gigs } from '../apps/web/lib/db/schema';

async function main() {
  const allGigs = await db.select().from(gigs);
  console.log('Gigs:');
  allGigs.forEach(g => {
    console.log(`ID: ${g.id}, Status: ${g.status}, Milestones:`, JSON.stringify(g.milestones));
  });
}

main().catch(console.error).finally(() => process.exit(0));
