"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_CHAT_VISITOR_DETAILS,
  GET_OFFERING_DETAILS,
} from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import { FaUserCircle } from "react-icons/fa";
import { FaInbox } from "react-icons/fa6";
import { FiChevronDown, FiChevronUp, FiMessageSquare } from "react-icons/fi";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useState } from "react";
import { formatCoupleName } from "@/utils/formatCoupleName";

interface Message {
  content: string;
  timestamp: string;
}

interface Chat {
  chatId: string;
  visitorId: string;
  offeringId: string;
  messages: Message[];
}

interface ChatListProps {
  chats: Chat[];
}

// Single chat row inside an offering group
const ChatRow = ({ chat }: { chat: Chat }) => {
  const { vendor } = useVendorAuth();
  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { data: visitorData } = useQuery(GET_CHAT_VISITOR_DETAILS, {
    variables: { id: chat.visitorId },
    skip: !chat.visitorId,
  });

  const previewMessage = chat.messages[chat.messages.length - 1];
  const visitor = visitorData?.findVisitorById;

  if (!visitor) {
    return (
      <div className="animate-pulse flex items-center px-5 py-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3.5"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const coupleName = formatCoupleName(visitor, "Wedding Couple");

  return (
    <Link
      href={`/vendor-dashboard/chats/${chat.chatId}`}
      className="flex items-center px-5 py-4 border-l-3 border-transparent hover:border-orange hover:bg-orange/5 transition-all group"
      onClick={() => {
        if (vendor?.id) {
          markChatAsRead({
            variables: { chatId: chat.chatId, userId: vendor.id, userType: "vendor" },
          }).catch(console.error);
        }
      }}
    >
      <div className="w-10 h-10 flex items-center justify-center bg-orange/10 text-orange font-bold text-sm rounded-full mr-3.5 flex-shrink-0 group-hover:scale-105 transition-transform">
        {coupleName[0]?.toUpperCase() || "C"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900 font-body text-sm truncate group-hover:text-orange transition-colors">
            {coupleName}
          </span>
          {previewMessage && (
            <span className="text-[11px] text-gray-400 font-body flex-shrink-0">
              {formatDistanceToNow(new Date(previewMessage.timestamp), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5 truncate font-body">
          {previewMessage?.content || "No messages yet"}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-body truncate">{visitor.email}</p>
      </div>
    </Link>
  );
};

// Collapsible group for one offering
const OfferingGroup = ({ offeringId, chats }: { offeringId: string; chats: Chat[] }) => {
  const [open, setOpen] = useState(true);

  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: offeringId },
    skip: !offeringId,
  });

  const offeringName = offeringData?.findOfferingById?.name || "Service Inquiries";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/70 hover:bg-gray-100/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
            <FiMessageSquare size={16} />
          </div>
          <div className="text-left">
            <span className="font-title font-bold text-gray-900 text-base">{offeringName}</span>
            <span className="ml-2 px-2.5 py-0.5 text-xs bg-orange/10 text-orange font-semibold rounded-full font-body">
              {chats.length} {chats.length === 1 ? "conversation" : "conversations"}
            </span>
          </div>
        </div>
        {open ? (
          <FiChevronUp className="text-gray-400 text-lg flex-shrink-0" />
        ) : (
          <FiChevronDown className="text-gray-400 text-lg flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="divide-y divide-gray-100 bg-white">
          {chats.map((chat) => (
            <ChatRow key={chat.chatId} chat={chat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChatList({ chats }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-3">
          <FaInbox size={26} />
        </div>
        <h3 className="font-title font-bold text-lg text-gray-900 mb-1">No conversations yet</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          When couples reach out or submit an inquiry on your service pages, your conversations will appear here.
        </p>
      </div>
    );
  }

  // Group chats by offeringId
  const grouped = chats.reduce<Record<string, Chat[]>>((acc, chat) => {
    const key = chat.offeringId || "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(chat);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([offeringId, groupChats]) => (
        <OfferingGroup key={offeringId} offeringId={offeringId} chats={groupChats} />
      ))}
    </div>
  );
}


