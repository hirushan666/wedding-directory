"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "@/graphql/mutations";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import { IoSend } from "react-icons/io5";
import { sanitizeInput } from "@/lib/sanitize";
import { getFriendlyErrorMessage } from "@/lib/errorUtils";
import { toast } from "react-hot-toast";

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
      const friendlyMsg = getFriendlyErrorMessage(error, "Failed to send message.");
      toast.error(friendlyMsg);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeInput(message, { maxLength: 1500, multiline: true });
    if (!sanitized) return;

    try {
      await sendMessage({
        variables: {
          chatId,
          content: sanitized,
          vendorSenderId: vendor?.id,
        },
      });
      setMessage("");
    } catch (error) {
      const friendlyMsg = getFriendlyErrorMessage(error, "Failed to send message.");
      toast.error(friendlyMsg);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-darkSurface p-3 sm:p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center gap-2 bg-gray-50/80 dark:bg-darkElevated rounded-2xl px-4 py-2 border border-gray-200 dark:border-zinc-700 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 focus-within:bg-white dark:focus-within:bg-darkElevated transition-all">
          <input
            type="text"
            value={message}
            maxLength={1500}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 font-body"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex-shrink-0 cursor-pointer"
            title="Send Message"
          >
            <IoSend className="text-sm" />
          </button>
        </div>
      </form>
    </div>
  );
}
