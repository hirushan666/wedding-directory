"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import VisitorChatList from "@/components/chat/VisitorChatList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FiMessageSquare, FiArrowLeft } from "react-icons/fi";

const ChatPage = () => {
  const { visitorId } = useParams() as { visitorId: string };

  return (
    <div className="w-full space-y-6">
      {/* Hero Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <Link
              href="/visitor-dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:text-orange dark:hover:text-orange bg-orange/5 dark:bg-darkElevated hover:bg-orange/15 dark:hover:bg-orange/15 border border-orange/20 dark:border-zinc-800 transition-all duration-200 active:scale-95 group w-fit"
            >
              <FiArrowLeft className="text-base sm:text-sm transition-transform group-hover:-translate-x-1 text-orange" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 dark:text-zinc-100">
                My Conversations
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-body">
                Connect directly with wedding vendors in real-time, get quotes, and manage bookings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversations Card */}
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 shadow-sm overflow-hidden">
        <VisitorChatList visitorId={visitorId} />
      </div>
    </div>
  );
};

export default ChatPage;
