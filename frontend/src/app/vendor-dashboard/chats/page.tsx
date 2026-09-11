"use client";

import { useQuery } from "@apollo/client";
import { GET_VENDOR_MESSAGES } from "@/graphql/queries";
import ChatList from "../../../components/chat/VendorChatList";
import { useVendorAuth } from "../../../contexts/VendorAuthContext";
import Link from "next/link";
import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";

export default function ChatsPage() {
  const { vendor } = useVendorAuth();

  const { loading, error, data } = useQuery(GET_VENDOR_MESSAGES, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
    pollInterval: 5000,
  });

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <LoaderJelly />
          <p className="text-sm font-medium text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-5 text-red-700 rounded-2xl bg-red-50 border border-red-200">
          <p className="font-semibold text-sm">Error loading chats</p>
          <p className="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-title">
            My Conversations
          </h1>
          <p className="text-gray-500 font-body text-sm mt-1">
            Reply to couples inquiring about your wedding services and discuss booking packages.
          </p>
        </div>

        <Link
          href="/vendor-dashboard"
          className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-medium px-4 py-2.5 rounded-xl transition-all text-sm shadow-sm self-start sm:self-auto"
        >
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <ChatList chats={data?.getVendorChats || []} />
    </div>
  );
}
