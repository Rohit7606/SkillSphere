import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: 'apps/web/.env' });
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

async function main() {
  const result = await client`SELECT g.id as gig_id, g.title, g."clientId" as gig_client_id, c.id as client_id, c."userId" as client_user_id, u.id as user_id, u.email FROM gigs g JOIN clients c ON g."clientId" = c.id JOIN users u ON c."userId" = u.id`;
  console.log(result);
  process.exit(0);
}
main();
