"use client";

import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FundEscrowProps {
  gigId: string;
  budget: number;
}

export function FundEscrowButton({ gigId, budget }: FundEscrowProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // Hit our backend to create an order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, amount: budget })
      });
      
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error || 'Failed to create payment order');
      }

      const orderData = json.data;
      const rzpKey = json.key;

      // Configure Razorpay checkout
      const options = {
        key: rzpKey || "rzp_test_dummykey", // Extracted from backend
        amount: orderData.amount, // in paise
        currency: orderData.currency,
        name: "SkillSphere Escrow",
        description: `Funding Gig #${gigId.substring(0,6)}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gigId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              })
            });
            const data = await verifyRes.json();
            if (data.success) {
              toast.success(`Payment Successful! Escrow funded.`);
              window.location.reload();
            } else {
              toast.error(data.error || 'Verification failed');
            }
          } catch (e) {
            toast.error('An error occurred during verification');
          }
        },
        prefill: {
          name: "Client Account",
          email: "client@example.com",
        },
        theme: {
          color: "#6366F1", // matches our accent-primary
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      
      paymentObject.open();

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-color-success/10 rounded-full">
          <ShieldCheck className="h-6 w-6 text-color-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Secure Escrow Protection</h3>
          <p className="text-sm text-text-secondary max-w-md mt-1">
            Funds are held safely in escrow and only released when you approve the final deliverables. 
          </p>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end gap-2">
        <span className="text-2xl font-mono font-bold text-foreground">
          ₹{budget}
        </span>
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex items-center gap-2 bg-accent-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Fund Escrow
        </button>
      </div>
    </div>
  );
}
