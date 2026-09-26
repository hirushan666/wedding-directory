"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_CHAT_VISITOR_DETAILS,
  GET_OFFERING_DETAILS,
} from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import {
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiMessageSquare,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useState } from "react";
import { formatCoupleName } from "@/utils/formatCoupleName";

interface Message {
  content: string;
  senderId?: string;
  senderType?: string;
  timestamp: string;
}

interface Chat {
  chatId: string;
  visitorId: string;
  serviceId: string;
  messages: Message[];
}

interface ChatListProps {
  chats: Chat[];
}

// Single chat row inside an offering group
const ChatRow = ({
  chat,
  searchQuery,
}: {
  chat: Chat;
  searchQuery: string;
}) => {
  const { vendor } = useVendorAuth();
  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { data: visitorData } = useQuery(GET_CHAT_VISITOR_DETAILS, {
    variables: { id: chat.visitorId },
    skip: !chat.visitorId,
  });

  const previewMessage = chat.messages[chat.messages.length - 1];
  const visitor = visitorData?.findVisitorById;

  const isPaymentNote =
    previewMessage?.content?.includes("Payment Note") ||
    previewMessage?.content?.startsWith("📦");

  const previewText = isPaymentNote
    ? "📦 Advance Booking Payment Confirmed"
    : previewMessage?.content || "No messages yet";

  if (!visitor) {
    return (
      <div className="animate-pulse flex items-center px-5 sm:px-6 py-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded-2xl mr-3.5 shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 dark:bg-zinc-700 rounded w-1/3"></div>
          <div className="h-2.5 bg-gray-200 dark:bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const coupleName = formatCoupleName(visitor, "Wedding Couple");

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    const matchesName = coupleName.toLowerCase().includes(q);
    const matchesEmail = (visitor.email || "").toLowerCase().includes(q);
    const matchesPhone = (visitor.phone || "").toLowerCase().includes(q);
    const matchesMessage = (previewMessage?.content || "")
      .toLowerCase()
      .includes(q);
    if (!matchesName && !matchesEmail && !matchesPhone && !matchesMessage) {
      return null;
    }
  }

  return (
    <Link
      href={`/vendor-dashboard/chats/${chat.chatId}`}
      className="flex items-center px-5 sm:px-6 py-4 sm:py-4.5 border-l-4 border-transparent hover:border-orange hover:bg-orange/[0.02] dark:hover:bg-darkElevated/50 transition-all group border-b border-orange/10 dark:border-zinc-800 last:border-b-0 gap-3.5 sm:gap-4"
      onClick={() => {
        if (vendor?.id) {
          markChatAsRead({
            variables: {
              chatId: chat.chatId,
              userId: vendor.id,
              userType: "vendor",
            },
          }).catch(console.error);
        }
      }}
    >
      {/* Couple Avatar */}
      <div className="w-12 h-12 flex items-center justify-center bg-orange/10 text-orange font-bold font-title text-base rounded-2xl shrink-0 group-hover:scale-105 transition-transform shadow-xs border border-orange/20 overflow-hidden relative">
        {visitor?.profile_pic_url ? (
          <Image
            src={visitor.profile_pic_url}
            alt={coupleName}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          coupleName[0]?.toUpperCase() || <FiUsers size={20} />
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Row 1: Couple Name & City badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 font-title text-sm sm:text-base truncate group-hover:text-orange dark:group-hover:text-orange transition-colors">
            {coupleName}
          </h3>
          {visitor?.city && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20 shrink-0">
              {visitor.city}
            </span>
          )}
        </div>

        {/* Row 2: Couple Contact Details */}
        <div className="flex items-center font-body gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
          <span className="truncate">
            {visitor.email}
            {visitor.phone ? ` • ${visitor.phone}` : ""}
          </span>
        </div>

        {/* Row 3: Last Message Preview */}
        <p
          className={`text-xs mt-1 truncate font-body ${
            isPaymentNote
              ? "text-amber-800 dark:text-amber-400 font-semibold"
              : "text-gray-600 dark:text-zinc-400"
          }`}
        >
          {previewText}
        </p>
      </div>

      {/* Right Meta Column: Timestamp & Action Arrow */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 ml-2 sm:ml-4 self-center">
        {previewMessage && (
          <span className="text-[11px] sm:text-xs text-gray-400 dark:text-zinc-500 font-body whitespace-nowrap">
            {formatDistanceToNow(new Date(previewMessage.timestamp), {
              addSuffix: true,
            })}
          </span>
        )}
        <div className="w-8 h-8 rounded-xl bg-orange/5 dark:bg-darkElevated text-orange/60 group-hover:bg-orange group-hover:text-white flex items-center justify-center transition-all shrink-0">
          <FiChevronRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
};

// Collapsible group for one offering
const OfferingGroup = ({
  serviceId,
  chats,
  searchQuery,
}: {
  serviceId: string;
  chats: Chat[];
  searchQuery: string;
}) => {
  const [open, setOpen] = useState(true);

  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: serviceId },
    skip: !serviceId,
  });

  const offeringName =
    offeringData?.findServiceById?.name || "Service Inquiries";

  return (
    <div className="bg-white dark:bg-darkSurface rounded-3xl shadow-sm border-2 border-orange/15 dark:border-zinc-800 overflow-hidden transition-all">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-orange/[0.03] dark:bg-darkElevated/60 hover:bg-orange/[0.06] dark:hover:bg-darkElevated transition-colors border-b border-orange/10 dark:border-zinc-800 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0 shadow-xs border border-orange/20">
            <FiMessageSquare size={18} />
          </div>
          <div className="text-left">
            <span className="font-title font-bold text-gray-900 dark:text-zinc-100 text-base">
              {offeringName}
            </span>
            <span className="ml-2.5 px-2.5 py-0.5 text-xs bg-orange/10 text-orange font-semibold rounded-full font-body border border-orange/20">
              {chats.length}{" "}
              {chats.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
        </div>
        {open ? (
          <FiChevronUp className="text-gray-400 dark:text-zinc-500 text-lg flex-shrink-0" />
        ) : (
          <FiChevronDown className="text-gray-400 dark:text-zinc-500 text-lg flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="divide-y divide-orange/10 dark:divide-zinc-800 bg-white dark:bg-darkSurface">
          {chats.map((chat) => (
            <ChatRow
              key={chat.chatId}
              chat={chat}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChatList({ chats }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (chats.length === 0) {
    return (
      <div className="bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/20 dark:border-zinc-800 p-12 sm:p-16 text-center space-y-4 font-body shadow-sm">
        <div className="w-16 h-16 rounded-full bg-orange/10 flex items-center justify-center text-orange mx-auto">
          <FiMessageSquare size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold font-title text-gray-800 dark:text-zinc-200">
            No Conversations Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
            When couples reach out or inquire about your wedding services, your
            direct conversations and inquiries will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Group chats by serviceId
  const grouped = chats.reduce<Record<string, Chat[]>>((acc, chat) => {
    const key = chat.serviceId || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(chat);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Search Header */}
      <div className="p-4 sm:p-5 border-2 border-orange/15 dark:border-zinc-800 bg-white dark:bg-darkSurface rounded-3xl shadow-sm">
        <div className="relative w-full">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations by couple name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-2.5 sm:py-3 text-xs sm:text-sm bg-orange/[0.02] dark:bg-darkElevated border-2 border-orange/15 dark:border-zinc-700 focus:border-orange rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-darkElevated text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 transition-all font-body"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-orange px-2 py-1 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grouped Services Conversations */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([serviceId, groupChats]) => (
          <OfferingGroup
            key={serviceId}
            serviceId={serviceId}
            chats={groupChats}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
