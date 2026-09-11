'use client';

import { useState } from 'react';
import request from '@/utils/request';

interface CheckoutProps {
  amount: number;
  packageId: string;
  visitorId: string;
  vendorId: string;
  offeringId: string;
  bookingDate?: string;
}

interface PayHerePaymentResponse {
  actionUrl: string;
  payment: Record<string, string | boolean>;
}

export default function CheckoutPage({
  amount,
  packageId,
  visitorId,
  vendorId,
  offeringId,
  bookingDate,
}: CheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const { data } = await request.post<PayHerePaymentResponse>('/api/payhere/create-payment', {
        amount,
        packageId,
        visitorId,
        vendorId,
        offeringId,
        bookingDate,
      });

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.actionUrl;

      Object.entries(data.payment).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-orange text-white py-2 px-4 rounded-md hover:bg-orange transition-colors disabled:bg-gray-400"
    >
      {loading ? 'Processing...' : 'Proceed to Payment'}
    </button>
  );
}
