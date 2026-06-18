import * as dotenv from 'dotenv';
dotenv.config({ path: './apps/web/.env' });

import { db } from '../apps/web/lib/db';
import { payments, gigs, freelancers, users, clients } from '../apps/web/lib/db/schema';

async function main() {
  const allPayments = await db.select().from(payments);
  console.log('Payments:', allPayments.length);
  
  const allFreelancers = await db.select().from(freelancers);
  console.log('Freelancers:', allFreelancers.length);

  const allClients = await db.select().from(clients);
  console.log('Clients:', allClients.length);
}

main().catch(console.error).finally(() => process.exit(0));
