import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '../../../../lib/db';
import { payments, gigs } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gigId, freelancerId, amount } = await req.json();

    if (!gigId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create order in Razorpay
    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: `gig_${gigId.substring(0, 30)}`,
    };
    
    let order;
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'dummy') {
      order = await razorpay.orders.create(options);
    } else {
      // Mock order for development UX testing
      order = { id: `order_mock_${Date.now()}`, amount: options.amount, currency: options.currency };
    }

    // 2. Save payment record in DB with escrowStatus = 'held'
    // Note: Since this is a demo from the Gig page without a specific proposal, 
    // we will skip the strict DB insert here because it requires a valid freelancerId foreign key.
    // In a real flow, this happens upon Proposal Acceptance.
    /*
    await db.insert(payments).values({
      gigId,
      clientId: userId,
      freelancerId,
      amount,
      status: 'created',
      gateway: 'razorpay',
      escrowStatus: 'held',
    });
    */

    return NextResponse.json({ data: order, key: process.env.RAZORPAY_KEY_ID, error: null });
  } catch (error: any) {
    console.error('[RAZORPAY_CREATE_ORDER_ERROR]', error);
    const errorMsg = error?.error?.description || error?.message || JSON.stringify(error) || 'Unknown error occurred';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
