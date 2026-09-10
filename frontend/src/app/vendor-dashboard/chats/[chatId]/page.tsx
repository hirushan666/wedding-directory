"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_VENDOR_CHAT, GET_CHAT_VISITOR_DETAILS } from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import MessageList from "../../../../components/chat/MessageList";
import MessageInput from "../../../../components/chat/MessageInput";
import ChatHeader from "../../../../components/chat/chatHeader";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";

import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";

export default function ChatPage() {
  const { chatId } = useParams();
  const chatIdStr = chatId as string;
  const { vendor } = useVendorAuth();
  const [messages, setMessages] = useState<any[]>([]);

  const { connected, joinChat, onNewMessage } = useChatSocket(vendor?.id, 'vendor');
  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
  } = useQuery(GET_VENDOR_CHAT, {
    variables: { chatId: chatIdStr },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.getChatHistory?.messages) {
        setMessages(data.getChatHistory.messages);
      }
    }
  });

  // Join chat room once socket is connected
  useEffect(() => {
    if (chatIdStr && connected) {
      joinChat(chatIdStr);
    }
  }, [chatIdStr, connected]);

  const { data: visitorData, loading: visitorLoading } = useQuery(
    GET_CHAT_VISITOR_DETAILS,
    {
      variables: { id: chatData?.getChatHistory?.visitorId },
      skip: !chatData?.getChatHistory?.visitorId,
    }
  );

  // Mark as read as soon as chatId and vendor.id are both available
  useEffect(() => {
    if (!chatIdStr || !vendor?.id) return;
    markChatAsRead({
      variables: { chatId: chatIdStr, userId: vendor.id, userType: 'vendor' }
    }).catch((err) => console.error('ChatPage: markChatAsRead error:', err.message));
  }, [chatIdStr, vendor?.id]);

  // Listen for real-time messages and mark as read when they arrive
  useEffect(() => {
    if (!chatIdStr || !connected) return;

    const unsubscribe = onNewMessage?.((data: any) => {
      if (data.chatId === chatIdStr) {
        setMessages(data.chat.messages || []);
        if (vendor?.id) {
          markChatAsRead({
            variables: { chatId: chatIdStr, userId: vendor.id, userType: 'vendor' }
          }).catch(console.error);
        }
      }
    });

    return () => { unsubscribe?.(); };
  }, [chatIdStr, connected, onNewMessage, vendor?.id]);

  if (chatLoading || visitorLoading)
    return (
      <div className="flex-grow flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <LoaderJelly />
          <p className="text-sm font-medium text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );

  if (chatError)
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-5 text-red-700 rounded-2xl bg-red-50 border border-red-200">
          <p className="font-semibold text-sm">Error loading chat</p>
          <p className="text-xs text-red-600 mt-1">{chatError.message}</p>
          <Link
            href="/vendor-dashboard/chats"
            className="inline-flex items-center gap-1.5 text-xs text-orange font-semibold mt-3 hover:underline"
          >
            <IoArrowBack size={14} /> Back to Conversations
          </Link>
        </div>
      </div>
    );

  const visitor = visitorData?.findVisitorById;
  const offeringId = chatData?.getChatHistory?.offeringId;

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-4xl flex-grow flex flex-col">
      {/* Top Back Nav */}
      <div className="mb-3">
        <Link
          href="/vendor-dashboard/chats"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-orange transition-colors"
        >
          <IoArrowBack size={16} />
          <span>Back to Conversations</span>
        </Link>
      </div>

      {/* Main Responsive Chat Card Window */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-210px)] min-h-[500px] flex-grow">
        {visitor && <ChatHeader visitor={visitor} offeringId={offeringId} />}
        <MessageList messages={messages} />
        <MessageInput chatId={chatIdStr} onMessageSent={setMessages} />
      </div>
    </div>
  );
}
