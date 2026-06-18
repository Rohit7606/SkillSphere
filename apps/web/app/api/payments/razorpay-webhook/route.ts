import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '../../../../lib/db';
import { payments } from '../../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const eventType = body.event;
    
    // In a real application, you might map the webhook payment ID to your internal gig/payment record
    // For now, this is the scaffold structure
    if (eventType === 'payment.captured') {
      console.log('Payment captured:', body.payload.payment.entity);
      // await db.update(payments).set({ status: 'captured' }).where(eq(...));
    } else if (eventType === 'payment.failed') {
      console.log('Payment failed:', body.payload.payment.entity);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[RAZORPAY_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
