"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "@/graphql/mutations";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { IoSend } from "react-icons/io5";

interface MessageInputProps {
  chatId: string;
  onMessageSent?: (messages: any[]) => void;
}

export default function MessageInput({ chatId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { vendor } = useVendorAuth();

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      if (onMessageSent && data?.sendQuoteMessage?.messages) {
        onMessageSent(data.sendQuoteMessage.messages);
      }
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        variables: {
          chatId,
          content: message.trim(),
          vendorSenderId: vendor?.id,
        },
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white p-3 sm:p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="w-full">
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
            className="p-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex-shrink-0"
            title="Send Message"
          >
            <IoSend className="text-sm" />
          </button>
        </div>
      </form>
    </div>
  );
}
