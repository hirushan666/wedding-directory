"use client";

import { useQuery, useMutation } from "@apollo/client";
import {
  GET_CHAT_HISTORY,
  GET_OFFERING_DETAILS,
  GET_CHAT_VISITOR_DETAILS,
} from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { IoSend } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { useChatSocket } from "@/hooks/useChatSocket";
import Link from "next/link";
import Image from "next/image";
import { ChatWindowSkeleton } from "@/components/ui/shimmer";
import { formatCoupleName } from "@/utils/formatCoupleName";

interface Message {
  content: string;
  senderId?: string;
  senderType?: string;
  timestamp: string;
}

interface VendorChatWindowProps {
  chatId: string;
}

const VendorChatWindow = ({ chatId }: VendorChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialScrollRef = useRef(true);
  const { vendor } = useVendorAuth();

  const {
    connected,
    sendMessage: sendSocketMessage,
    joinChat,
    onNewMessage,
  } = useChatSocket(vendor?.id, "vendor");

  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { data, loading } = useQuery(GET_CHAT_HISTORY, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "network-only",
    onCompleted: (chatHistoryData) => {
      if (chatHistoryData?.getChatHistory?.messages) {
        setMessages(chatHistoryData.getChatHistory.messages);
      }
    },
  });

  const visitorId = data?.getChatHistory?.visitorId;
  const serviceId = data?.getChatHistory?.serviceId;

  const { data: visitorData } = useQuery(GET_CHAT_VISITOR_DETAILS, {
    variables: { id: visitorId },
    skip: !visitorId,
  });

  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: serviceId },
    skip: !serviceId,
  });

  const visitor = visitorData?.findVisitorById;
  const offering = offeringData?.findServiceById;
  const coupleName = formatCoupleName(visitor, "Wedding Couple");

  // Join chat room via WebSocket when connected
  useEffect(() => {
    if (chatId && connected) {
      joinChat(chatId);
    }
  }, [chatId, connected, joinChat]);

  // Mark as read as soon as we have chatId and vendorId
  useEffect(() => {
    if (!chatId || !vendor?.id) return;
    markChatAsRead({
      variables: { chatId, userId: vendor.id, userType: "vendor" },
    }).catch(console.error);
  }, [chatId, vendor?.id, markChatAsRead]);

  // Listen for real-time messages via WebSocket
  useEffect(() => {
    if (!chatId || !connected) return;

    const unsubscribe = onNewMessage?.((incomingData: any) => {
      if (incomingData.chatId === chatId) {
        setMessages(incomingData.chat.messages || []);
        if (vendor?.id) {
          markChatAsRead({
            variables: { chatId, userId: vendor.id, userType: "vendor" },
          }).catch(console.error);
        }
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [chatId, connected, onNewMessage, vendor?.id, markChatAsRead]);

  // Scroll only the message container to bottom without scrolling the whole page window
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    if (isInitialScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      if (messages.length > 0) {
        isInitialScrollRef.current = false;
      }
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !vendor?.id) return;

    const optimisticMsg: Message = {
      content: message.trim(),
      senderId: vendor.id,
      senderType: "vendor",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");

    try {
      await sendSocketMessage({
        chatId,
        content: optimisticMsg.content,
        senderId: vendor.id,
        senderType: "vendor",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m !== optimisticMsg));
    }
  };

  if (loading && messages.length === 0) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] min-h-[520px]">
      {/* Top Chat Header */}
      <div className="bg-white dark:bg-darkSurface border-b-2 border-orange/10 dark:border-zinc-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-orange/10 text-orange font-bold text-base sm:text-lg rounded-2xl flex-shrink-0 border border-orange/20 shadow-xs overflow-hidden relative">
            {visitor?.profile_pic_url ? (
              <Image
                src={visitor.profile_pic_url}
                alt={coupleName}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              coupleName[0]?.toUpperCase() || <FiUsers />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-title font-bold text-base sm:text-lg text-gray-900 dark:text-zinc-100 truncate leading-tight">
                {coupleName}
              </h2>
              {offering && (
                <Link
                  href={`/services/${offering.id}`}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-0.5 text-xs bg-orange/10 text-orange hover:bg-orange hover:text-white transition-colors font-semibold rounded-full border border-orange/20 truncate max-w-[220px]"
                >
                  <span>{offering.name}</span>
                  <span>&rarr;</span>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 font-body truncate mt-0.5">
              <span>
                {visitor?.email || ""}
                {visitor?.phone ? ` • ${visitor.phone}` : ""}
                {visitor?.city ? ` • ${visitor.city}` : ""}
                {offering?.category ? ` • ${offering.category}` : ""}
              </span>
            </div>
          </div>
        </div>

        {offering && (
          <Link
            href={`/services/${offering.id}`}
            className="sm:hidden px-3 py-1 text-xs bg-orange/10 text-orange font-semibold rounded-full border border-orange/20 flex-shrink-0"
          >
            {offering.name}
          </Link>
        )}
      </div>

      {/* Messages List Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#FFFDFD] to-[#FFF7F4] dark:from-[#141211] dark:to-[#1a1716]"
      >
        {messages.length === 0 ? (
          <div className="flex-1 h-full flex items-center justify-center p-8 text-center text-gray-400">
            <div className="max-w-xs p-6 bg-white dark:bg-darkSurface rounded-3xl border-2 border-orange/15 dark:border-zinc-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center mx-auto mb-3 text-xl">
                <FiUsers />
              </div>
              <p className="font-title font-semibold text-gray-800 dark:text-zinc-100 text-sm mb-1">
                Start of Conversation
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-body">
                Send a message to discuss dates, packages, and special
                requirements with {coupleName}.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg: Message, index: number) => {
            const isVendor = msg.senderType === "vendor";
            const isSystemOrPayment =
              msg.content.includes("Payment Note") ||
              msg.content.startsWith("📦");

            if (isSystemOrPayment) {
              return (
                <div key={index} className="flex justify-center my-3">
                  <div className="bg-[#FFF8F3] dark:bg-darkElevated border-2 border-orange/25 dark:border-orange/30 rounded-2xl p-4 max-w-[92%] sm:max-w-[75%] text-xs sm:text-sm text-gray-800 dark:text-zinc-200 shadow-xs">
                    <div className="font-semibold flex items-center gap-2 mb-1.5 text-orange">
                      <span className="text-base">📦</span>
                      <span className="font-title">
                        Booking Payment Notification
                      </span>
                    </div>
                    <p className="leading-relaxed font-body whitespace-pre-line text-gray-700 dark:text-zinc-300">
                      {msg.content.replace(/^📦\s*/, "")}
                    </p>
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 text-right font-body">
                      {formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`flex ${isVendor ? "justify-end" : "justify-start"}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] group flex flex-col ${
                    isVendor ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-xs text-sm font-body ${
                      isVendor
                        ? "bg-orange text-white rounded-br-xs"
                        : "bg-white dark:bg-darkElevated text-gray-800 dark:text-zinc-100 rounded-bl-xs border-2 border-orange/10 dark:border-zinc-700"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <span
                      className={`text-[10px] mt-1.5 block ${
                        isVendor
                          ? "text-white/80 text-right"
                          : "text-gray-400 dark:text-zinc-400 text-left"
                      }`}
                    >
                      {formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Bar */}
      <div className="border-t-2 border-orange/10 dark:border-zinc-800 bg-white dark:bg-darkSurface p-3.5 sm:p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="w-full">
          <div className="flex items-center gap-2 bg-lightYellow/40 dark:bg-darkElevated rounded-2xl px-4 py-2 border-2 border-orange/20 dark:border-zinc-700 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 focus-within:bg-white dark:focus-within:bg-darkElevated transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 font-body"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2.5 rounded-xl bg-orange text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange/90 active:scale-95 transition-all shadow-sm flex-shrink-0 cursor-pointer"
              title="Send message"
            >
              <IoSend className="text-sm" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorChatWindow;
