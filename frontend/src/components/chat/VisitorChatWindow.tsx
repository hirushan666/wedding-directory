"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_CHAT_HISTORY, GET_OFFERING_DETAILS } from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/VisitorAuthContext";
import { IoSend } from "react-icons/io5";
import { FaStore } from "react-icons/fa";
import { useChatSocket } from "@/hooks/useChatSocket";
import Link from "next/link";
import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";

interface Message {
  content: string;
  senderId?: string;
  senderType?: string;
  timestamp: string;
}

interface VisitorChatWindowProps {
  chatId: string;
}

const VisitorChatWindow = ({ chatId }: VisitorChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { visitor } = useAuth();

  const { connected, sendMessage: sendSocketMessage, joinChat, onNewMessage } =
    useChatSocket(visitor?.id, "visitor");

  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { data, loading } = useQuery(GET_CHAT_HISTORY, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.getChatHistory?.messages) {
        setMessages(data.getChatHistory.messages);
      }
    },
  });

  const offeringId = data?.getChatHistory?.offeringId;

  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: offeringId },
    skip: !offeringId,
  });

  const offering = offeringData?.findOfferingById;
  const vendor = offering?.vendor;

  // Join chat room via WebSocket when connected
  useEffect(() => {
    if (chatId && connected) {
      joinChat(chatId);
    }
  }, [chatId, connected, joinChat]);

  // Mark as read as soon as we have chatId and visitorId
  useEffect(() => {
    if (!chatId || !visitor?.id) return;
    markChatAsRead({
      variables: { chatId, userId: visitor.id, userType: "visitor" },
    }).catch(console.error);
  }, [chatId, visitor?.id, markChatAsRead]);

  // Listen for real-time messages via WebSocket
  useEffect(() => {
    if (!chatId || !connected) return;

    const unsubscribe = onNewMessage?.((incomingData: any) => {
      if (incomingData.chatId === chatId) {
        setMessages(incomingData.chat.messages || []);
        if (visitor?.id) {
          markChatAsRead({
            variables: { chatId, userId: visitor.id, userType: "visitor" },
          }).catch(console.error);
        }
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [chatId, connected, onNewMessage, visitor?.id, markChatAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !visitor?.id) return;

    const optimisticMsg: Message = {
      content: message.trim(),
      senderId: visitor.id,
      senderType: "visitor",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");

    try {
      await sendSocketMessage({
        chatId,
        content: optimisticMsg.content,
        senderId: visitor.id,
        senderType: "visitor",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m !== optimisticMsg));
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="h-[550px] flex flex-col items-center justify-center gap-3">
        <LoaderJelly />
        <p className="text-xs font-medium text-gray-400">Loading conversation...</p>
      </div>
    );
  }

  const vendorDisplayName = vendor?.busname || `${vendor?.fname || ""} ${vendor?.lname || ""}`.trim() || "Wedding Vendor";

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Top Chat Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-orange/10 text-orange font-bold text-sm sm:text-base rounded-full flex-shrink-0 shadow-xs">
            {vendorDisplayName[0]?.toUpperCase() || <FaStore />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-title font-bold text-base sm:text-lg text-gray-900 truncate leading-tight">
                {vendorDisplayName}
              </h2>
              {offering && (
                <Link
                  href={`/services/${offering.id}`}
                  className="hidden sm:inline-block px-2.5 py-0.5 text-xs bg-orange/10 text-orange hover:bg-orange hover:text-white transition-colors font-semibold rounded-full truncate max-w-[200px]"
                >
                  {offering.name} &rarr;
                </Link>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {vendor?.city ? `${vendor.city} • ` : ""}
              {offering?.category || "Wedding Service"}
            </p>
          </div>
        </div>

        {offering && (
          <Link
            href={`/services/${offering.id}`}
            className="sm:hidden px-2.5 py-0.5 text-[11px] bg-orange/10 text-orange font-semibold rounded-full flex-shrink-0"
          >
            {offering.name}
          </Link>
        )}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gray-50/40">
        {messages.length === 0 ? (
          <div className="flex-1 h-full flex items-center justify-center p-8 text-center text-gray-400">
            <div>
              <p className="font-title font-medium text-gray-600 text-sm mb-1">Start of Conversation</p>
              <p className="text-xs text-gray-400">Send a message to discuss your wedding plans with this vendor.</p>
            </div>
          </div>
        ) : (
          messages.map((msg: Message, index: number) => {
            const isVisitor = msg.senderType === "visitor";
            const isSystemOrPayment =
              msg.content.includes("Payment Note") || msg.content.startsWith("📦");

            if (isSystemOrPayment) {
              return (
                <div key={index} className="flex justify-center my-3">
                  <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 max-w-[90%] sm:max-w-[75%] text-xs sm:text-sm text-amber-900 shadow-xs">
                    <div className="font-semibold flex items-center gap-1.5 mb-1 text-orange">
                      <span>📦</span>
                      <span>Booking Payment Notification</span>
                    </div>
                    <p className="leading-relaxed font-body whitespace-pre-line text-gray-800">
                      {msg.content.replace(/^📦\s*/, "")}
                    </p>
                    <div className="text-[10px] text-amber-700/80 mt-1.5 text-right font-body">
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
                className={`flex items-end gap-2.5 ${
                  isVisitor ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Small Avatar badge */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 mb-0.5 shadow-xs ${
                    isVisitor
                      ? "bg-orange text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isVisitor ? "C" : "V"}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] group flex flex-col ${
                    isVisitor ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm font-body ${
                      isVisitor
                        ? "bg-orange text-white rounded-br-xs"
                        : "bg-white text-gray-800 rounded-bl-xs border border-gray-100"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <span
                      className={`text-[10px] mt-1 block ${
                        isVisitor ? "text-white/80 text-right" : "text-gray-400 text-left"
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
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="border-t border-gray-100 bg-white p-3 sm:p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="w-full">
          <div className="flex items-center gap-2 bg-gray-50/80 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 focus-within:bg-white transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400 font-body"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 rounded-xl bg-orange text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange/90 transition-colors shadow-sm"
              title="Send message"
            >
              <IoSend className="text-base" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorChatWindow;