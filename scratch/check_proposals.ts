import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env' });

import { db } from '../apps/web/lib/db';
import { proposals } from '../apps/web/lib/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const p = await db.select().from(proposals).where(eq(proposals.gigId, '75b11804-88a4-4ab2-aa62-c0b75e5c0923'));
  console.log('Proposals:', p);
}

main().catch(console.error).finally(() => process.exit(0));
