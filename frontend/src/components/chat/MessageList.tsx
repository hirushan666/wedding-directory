import { useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  content: string;
  senderType?: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 bg-gray-50/40">
        <div>
          <p className="font-title font-medium text-gray-600 text-sm mb-1">Start of Conversation</p>
          <p className="text-xs text-gray-400">Send a message to begin chatting with this couple.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-gray-50/40">
      {messages.map((message, index) => {
        const isVendor = message.senderType === "vendor";
        const isSystemOrPayment =
          message.content.includes("Payment Note") || message.content.startsWith("📦");

        if (isSystemOrPayment) {
          return (
            <div key={index} className="flex justify-center my-3">
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 max-w-[90%] sm:max-w-[75%] text-xs sm:text-sm text-amber-900 shadow-xs">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <span>📦</span>
                  <span>Booking Payment Notification</span>
                </div>
                <p className="leading-relaxed font-body whitespace-pre-line">{message.content.replace(/^📦\s*/, "")}</p>
                <div className="text-[10px] text-amber-700/80 mt-1.5 text-right font-body">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={index}
            className={`flex items-end gap-2.5 ${
              isVendor ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Small Avatar badge */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 mb-0.5 shadow-xs ${
                isVendor
                  ? "bg-orange text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {isVendor ? "V" : "C"}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[70%] group flex flex-col ${
                isVendor ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm font-body ${
                  isVendor
                    ? "bg-orange text-white rounded-br-xs"
                    : "bg-white text-gray-800 rounded-bl-xs border border-gray-100"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                <span
                  className={`text-[10px] mt-1 block ${
                    isVendor ? "text-white/80 text-right" : "text-gray-400 text-left"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
