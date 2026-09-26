"use client";

import { useQuery } from "@apollo/client";
import { GET_VENDOR_MESSAGES } from "@/graphql/queries";
import ChatList from "@/components/chat/VendorChatList";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { ChatListSkeleton } from "@/components/ui/shimmer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FiMessageSquare } from "react-icons/fi";

export default function ChatsPage() {
  const { vendor } = useVendorAuth();

  const { loading, error, data } = useQuery(GET_VENDOR_MESSAGES, {
    variables: { vendorId: vendor?.id },
    skip: !vendor?.id,
    pollInterval: 5000,
  });

  return (
    <div className="w-full space-y-6">
      {/* Hero Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/vendor-dashboard" },
              { label: "Chats", href: "/vendor-dashboard/chats" },
            ]}
          />
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shrink-0 border border-orange/20 shadow-xs">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                My Conversations
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
                Reply to couples inquiring about your wedding services, send quotes, and discuss bookings in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States or Conversations List */}
      {loading ? (
        <ChatListSkeleton count={5} />
      ) : error ? (
        <div className="p-6 text-red-700 dark:text-red-300 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 font-body">
          <p className="font-semibold text-sm">Error loading conversations</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error.message}</p>
        </div>
      ) : (
        <ChatList chats={data?.getVendorChats || []} />
      )}
    </div>
  );
}
