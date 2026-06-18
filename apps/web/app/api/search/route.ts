import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { gigs, clients, users } from '../../../lib/db/schema';
import { eq, and, or, gte, lte, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().optional().default(""),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  location: z.string().optional().default(""),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, minBudget, maxBudget, location } = searchSchema.parse(body);

    let conditions = [eq(gigs.status, 'open')];

    // Filter by text search (Title or Description)
    if (query.trim() !== '') {
      conditions.push(
        or(
          ilike(gigs.title, `%${query}%`),
          ilike(gigs.description, `%${query}%`)
        ) as any
      );
    }

    // Filter by budget range
    if (minBudget !== undefined && minBudget > 0) {
      conditions.push(gte(gigs.budget, minBudget));
    }
    if (maxBudget !== undefined && maxBudget > 0) {
      conditions.push(lte(gigs.budget, maxBudget));
    }

    // Filter by location
    if (location.trim() !== '') {
      conditions.push(ilike(gigs.location, `%${location}%`));
    }

    // Execute query
    const results = await db
      .select({
        id: gigs.id,
        title: gigs.title,
        description: gigs.description,
        budget: gigs.budget,
        location: gigs.location,
        createdAt: gigs.createdAt,
        clientCompany: clients.company,
        clientEmail: users.email,
        clientName: users.name
      })
      .from(gigs)
      .leftJoin(clients, eq(clients.id, gigs.clientId))
      .leftJoin(users, eq(users.id, clients.userId))
      .where(and(...conditions))
      .orderBy(sql`${gigs.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({ data: results, error: null });
  } catch (error: any) {
    console.error('[SEARCH_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
