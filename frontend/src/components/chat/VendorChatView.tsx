"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_VENDOR_CHAT } from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import VendorHeader from "@/components/shared/Headers/VendorHeader";
import Link from "next/link";
import { useChatSocket } from "@/hooks/useChatSocket";
import { formatDistanceToNow } from "date-fns";

const VendorChatView = () => {
  const params = useParams();
  const chatId = typeof params.chatId === 'string' ? params.chatId : '';
  const { vendor } = useVendorAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connected, sendMessage: sendSocketMessage, joinChat, onNewMessage } =
    useChatSocket(vendor?.id, 'vendor');

  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { loading } = useQuery(GET_VENDOR_CHAT, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      // GET_VENDOR_CHAT uses getChatHistory query
      if (data?.getChatHistory?.messages) {
        setMessages(data.getChatHistory.messages);
      }
      if (chatId) joinChat(chatId);
    }
  });

  // Mark as read as soon as both chatId and vendor.id are available
  // Using vendor?.id as dep so it retries when vendor context loads
  useEffect(() => {
    if (!chatId || !vendor?.id) return;
    console.log('VendorChatView: Marking chat as read, chatId:', chatId, 'vendorId:', vendor.id);
    markChatAsRead({
      variables: { chatId, userId: vendor.id, userType: 'vendor' }
    }).then((res) => {
      console.log('VendorChatView: markChatAsRead success:', res.data);
    }).catch((err) => {
      console.error('VendorChatView: markChatAsRead error:', err.message);
    });
  }, [chatId, vendor?.id]); // Re-runs when vendor loads

  // Listen for real-time new messages
  useEffect(() => {
    if (!chatId || !connected) return;

    const unsubscribe = onNewMessage?.((data: any) => {
      if (data.chatId === chatId) {
        setMessages(data.chat.messages || []);
        // Vendor is actively viewing this chat - mark as read immediately
        if (vendor?.id) {
          markChatAsRead({
            variables: { chatId, userId: vendor.id, userType: 'vendor' }
          }).catch(console.error);
        }
      }
    });

    return () => { unsubscribe?.(); };
  }, [chatId, connected, onNewMessage, vendor?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !vendor?.id) return;
    try {
      await sendSocketMessage({
        chatId,
        content: message,
        senderId: vendor.id,
        senderType: 'vendor'
      });
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading && messages.length === 0) return (
    <div className="min-h-screen bg-lightYellow">
      <VendorHeader />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-lightYellow">
      <VendorHeader />
      <div className="container mx-auto p-6">
        <Link href="/vendor-dashboard/chats" className="mb-4 inline-block">
          <span className="text-black hover:text-gray-600">
            &larr; Back to Conversations
          </span>
        </Link>

        <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: any, index: number) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.senderType === 'vendor' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                    msg.senderType === 'vendor'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${msg.senderType === 'vendor' ? 'text-white/70' : 'text-gray-400'}`}>
                    {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 p-2 border rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                disabled={!connected || !message.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorChatView;
