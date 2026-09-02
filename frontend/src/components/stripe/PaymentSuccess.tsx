import Link from 'next/link';
import request from '@/utils/request';
import { ReactElement } from 'react';

interface PageProps {
  searchParams: { order_id?: string; session_id?: string };
}

interface PayHerePaymentStatus {
  orderId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
}

export default async function PaymentSuccess({
  searchParams,
}: PageProps): Promise<ReactElement> {
  const orderId = searchParams.order_id || searchParams.session_id;

  if (!orderId) {
    return (
      <div className="min-h-screen bg-lightYellow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment</h1>
          <p className="text-gray-600">No valid payment reference was provided.</p>
        </div>
      </div>
    );
  }

  try {
    const { data: payment } = await request.get<PayHerePaymentStatus>(
      `/api/payhere/payment?order_id=${orderId}`
    );

    const isCompleted = payment.status === 'completed';
    const isFailed = payment.status === 'failed';

    return (
      <div className="min-h-screen bg-lightYellow flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1
            className={`text-2xl font-bold mb-4 ${
              isCompleted ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-orange'
            }`}
          >
            {isCompleted ? 'Payment Successful!' : isFailed ? 'Payment Failed' : 'Payment Pending'}
          </h1>

          <p className="text-gray-600 mb-3">
            Reference: <span className="font-semibold">{payment.orderId}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Amount: <span className="font-semibold">LKR {Number(payment.amount).toLocaleString()}</span>
          </p>

          {!isCompleted && !isFailed && (
            <p className="text-gray-500 text-sm mb-8">
              Your checkout returned successfully. Payment confirmation will update after PayHere notification is enabled.
            </p>
          )}

          <div className="flex flex-col space-y-4">
            <Link
              href="/visitor-dashboard"
              className="w-full bg-orange text-white py-2 px-4 rounded-md hover:bg-orange transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/visitor-dashboard/payments-history"
              className="w-full border-2 border-orange text-orange py-2 px-4 rounded-md hover:bg-orange hover:text-white transition-colors font-medium"
            >
              View My Payments
            </Link>
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-lightYellow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Not Found</h1>
          <p className="text-gray-600">We could not find this payment reference.</p>
        </div>
      </div>
    );
  }
}
