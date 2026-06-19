import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { db } from './apps/web/lib/db';
import { freelancers } from './apps/web/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("NO DATABASE_URL FOUND!");
    process.exit(1);
  }
  await db.update(freelancers)
    .set({ reputationScore: 150 })
    .where(eq(freelancers.id, '088519c2-15a0-4941-a64a-26aff7f770e9'));
  console.log("Updated reputationScore for freelancer");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
