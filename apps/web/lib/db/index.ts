import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables');
}

// Global connection variable to prevent multiple instances during hot reloads in development
const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

const client = globalForDb.postgresClient ?? postgres(connectionString, { prepare: false, max: 10 });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
