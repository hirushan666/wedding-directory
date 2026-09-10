"use client";

import { useParams } from "next/navigation";
import VisitorChatWindow from "@/components/chat/VisitorChatWindow";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

const ChatDetailPage = () => {
  const { chatId, visitorId } = useParams() as {
    chatId: string;
    visitorId: string;
  };

  return (
    <div className="mx-auto p-6">
      <Link
        href={`/visitor-dashboard/chats/${visitorId}`}
        className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-gray-600 hover:text-orange transition-colors"
      >
        <IoArrowBack className="text-base" />
        <span className="font-body">Back to Conversations</span>
      </Link>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <VisitorChatWindow chatId={chatId} />
      </div>
    </div>
  );
};

export default ChatDetailPage;
