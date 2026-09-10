"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from "@/contexts/VisitorAuthContext";
import LoaderHelix from "@/components/shared/Loaders/LoaderHelix";
import { useQuery } from '@apollo/client';
import { GET_VISITOR_PAYMENTS } from '@/graphql/queries';
import BottomNavigationBar from '@/components/visitor-dashboard/BottomNavigationBar';
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle2, Clock, AlertCircle, Receipt, Printer, X } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  bookingDate?: string;
  paymentReference?: string;
  gatewayPaymentId?: string;
  vendor?: {
    busname?: string;
    fname?: string;
    lname?: string;
  };
  package?: {
    name: string;
    offering?: {
      id: string;
      name: string;
    };
  };
}

const PaymentsHistoryPage = () => {
  const { visitor } = useAuth();
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const { data, loading, error } = useQuery(GET_VISITOR_PAYMENTS, {
    variables: { visitorId: visitor?.id },
    skip: !visitor?.id,
    fetchPolicy: 'cache-and-network',
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 size={12} />
            completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} />
            pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle size={12} />
            failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading && !data) return <LoaderHelix />;

  if (error) {
    return (
      <div className="py-6 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto text-center">
          Error loading payments: {error.message}
        </div>
      </div>
    );
  }

  const payments: Payment[] = data?.visitorPayments || [];

  return (
    <div className="py-4 px-2 md:py-6 md:px-4">
      {/* Header Card matching dashboard theme */}
      <div className="hidden md:block shadow-md bg-white p-4 rounded-lg mb-4 md:mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/visitor-dashboard" },
            { label: "Payments History", href: "/visitor-dashboard/payments-history" },
          ]}
        />
        <div>
          <h1 className="text-4xl md:text-3xl font-bold text-black font-title my-3">
            Payments History
          </h1>
          <p className="font-body text-xl text-black">
            Track all your wedding service payments.
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="mt-6 md:mt-8">
        {payments.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const serviceName = payment.package?.offering?.name || 'Wedding Service';
                    const offeringId = payment.package?.offering?.id;

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {offeringId ? (
                            <Link
                              href={`/services/${offeringId}`}
                              className="text-sm font-semibold text-gray-900 hover:text-orange transition-colors"
                            >
                              {serviceName}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              {serviceName}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {payment.package?.name || 'Standard'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {Number(payment.amount).toFixed(2)} LKR
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedReceipt(payment)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange hover:bg-orange/10 rounded-md transition"
                          >
                            <Receipt size={13} />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No payment history found</p>
          </div>
        )}
      </div>

      {/* Simple Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 font-title text-lg">
                Payment Receipt
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Service</span>
                <span className="font-semibold text-gray-900">
                  {selectedReceipt.package?.offering?.name || 'Wedding Service'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Package</span>
                <span className="text-gray-800">
                  {selectedReceipt.package?.name || 'Standard'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900">
                  {Number(selectedReceipt.amount).toFixed(2)} LKR
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono text-xs text-gray-700">
                  {selectedReceipt.paymentReference || selectedReceipt.id}
                </span>
              </div>

              {selectedReceipt.gatewayPaymentId && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">PayHere Payment ID</span>
                  <span className="font-mono text-xs text-gray-700">
                    {selectedReceipt.gatewayPaymentId}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-700">
                  {new Date(selectedReceipt.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-gray-500">Status</span>
                <span>{getStatusBadge(selectedReceipt.status)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-300 bg-white text-gray-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-100 transition"
              >
                <Printer size={14} /> Print
              </button>

              {selectedReceipt.paymentReference && (
                <Link
                  href={`/success?order_id=${selectedReceipt.paymentReference}`}
                  className="flex-1 inline-flex items-center justify-center bg-orange text-white py-2 px-3 rounded-lg text-xs font-medium hover:opacity-90 transition text-center"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavigationBar />
    </div>
  );
};

export default PaymentsHistoryPage;
