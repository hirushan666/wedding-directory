"use client";

import { useQuery } from "@apollo/client";
import { GET_VENDOR_MESSAGES } from "@/graphql/queries";
import ChatList from "../../../components/chat/VendorChatList";
import { useVendorAuth } from "../../../contexts/VendorAuthContext";
import { ChatListSkeleton } from "@/components/ui/shimmer";

export default function ChatsPage() {
  const { vendor } = useVendorAuth();

  const { loading, error, data } = useQuery(GET_VENDOR_MESSAGES, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
    pollInterval: 5000,
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200/80 dark:bg-darkElevated/90 rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-gray-200/80 dark:bg-darkElevated/90 rounded-xl animate-pulse" />
        </div>
        <ChatListSkeleton count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-5 text-red-700 dark:text-red-300 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
          <p className="font-semibold text-sm">Error loading chats</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 font-title">
          My Conversations
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 font-body text-sm mt-1">
          Reply to couples inquiring about your wedding services and discuss booking packages.
        </p>
      </div>

      <ChatList chats={data?.getVendorChats || []} />
    </div>
  );
}
