import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { gigs, freelancers } from '../../../../lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from '@clerk/nextjs/server';

// Initialize rate limiter: 20 req/min per user
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(20, '1 m'),
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized', data: null }, { status: 401 });
    }

    // Rate limiting check
    if (ratelimit) {
      const { success } = await ratelimit.limit(userId);
      if (!success) {
        return NextResponse.json({ error: 'Rate limit exceeded', data: null }, { status: 429 });
      }
    }

    const body = await req.json();
    const gigId = body.gigId;
    
    if (!gigId) {
      return NextResponse.json({ error: 'gigId is required', data: null }, { status: 400 });
    }

    // 1. Fetch gig description from DB
    const gigData = await db.select().from(gigs).where(eq(gigs.id, gigId)).limit(1);
    const gig = gigData[0];
    
    if (!gig) {
      return NextResponse.json({ error: 'Gig not found', data: null }, { status: 404 });
    }

    // Fetch available freelancers to rank
    const allFreelancers = await db.select({
      freelancer: freelancers,
      email: users.email,
      name: users.name
    })
    .from(freelancers)
    .innerJoin(users, eq(freelancers.userId, users.id))
    .limit(50);

    let matchedFreelancers = allFreelancers.map(f => ({
      ...f.freelancer,
      email: f.email,
      name: f.name,
      matchScore: 0
    }));

    // 2. Embed and compare using HuggingFace Sentence Similarity
    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (hfToken && allFreelancers.length > 0) {
      try {
        const sentences = allFreelancers.map(f => {
          const skillsText = Array.isArray(f.freelancer.skills) ? f.freelancer.skills.join(', ') : '';
          return `${f.freelancer.bio || ''} Skills: ${skillsText}`;
        });

        const hfRes = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: {
              source_sentence: `${gig.title}. ${gig.description}`,
              sentences: sentences
            }
          })
        });
        
        if (hfRes.ok) {
          const scores = await hfRes.json();
          // scores is an array of floats between 0 and 1
          if (Array.isArray(scores) && scores.length === allFreelancers.length) {
             matchedFreelancers = matchedFreelancers.map((f, i) => ({
               ...f,
               matchScore: Math.round(scores[i] * 100) // Percentage match
             }));
             // Sort by similarity score descending
             matchedFreelancers = matchedFreelancers.sort((a, b) => b.matchScore - a.matchScore);
          }
        } else {
          console.warn("HF API error, falling back to basic sorting");
          // Fallback: sort by reputation and assign mock descending scores
          matchedFreelancers = matchedFreelancers.sort((a, b) => b.reputationScore - a.reputationScore).map((f, i) => ({ ...f, matchScore: Math.max(50, 95 - i * 5) }));
        }
      } catch (hfError) {
         console.warn("HF API network error, falling back to basic sorting", hfError);
         matchedFreelancers = matchedFreelancers.sort((a, b) => b.reputationScore - a.reputationScore).map((f, i) => ({ ...f, matchScore: Math.max(50, 95 - i * 5) }));
      }
    } else {
      // Fallback if no token
      matchedFreelancers = matchedFreelancers.sort((a, b) => b.reputationScore - a.reputationScore).map((f, i) => ({ ...f, matchScore: Math.max(50, 95 - i * 5) }));
    }

    // Limit to top 5 recommendations
    const topMatches = matchedFreelancers.slice(0, 5);

    return NextResponse.json({ 
      data: { recommendations: topMatches },
      error: null 
    });
  } catch (error: any) {
    console.error('[AI_MATCH_ERROR]', error);
    return NextResponse.json({ error: error.message, data: null }, { status: 500 });
  }
}
