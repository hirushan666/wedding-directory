import { useQuery, useMutation } from "@apollo/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { GET_OFFERING_DETAILS, GET_VISITOR_CHATS } from "@/graphql/queries";
import { MARK_CHAT_AS_READ } from "@/graphql/mutations";
import { FaStore } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { useAuth } from "@/contexts/VisitorAuthContext";
import LoaderJelly from "@/components/shared/Loaders/LoaderJelly";

interface Message {
  content: string;
  senderId?: string;
  senderType?: string;
  timestamp: string;
}

interface Chat {
  chatId: string;
  offeringId: string;
  vendorId: string;
  messages: Message[];
}

interface VisitorChatListProps {
  visitorId: string;
}

const ChatItem = ({ chat, visitorId }: { chat: Chat; visitorId: string }) => {
  const { visitor } = useAuth();
  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  const { data: offeringData } = useQuery(GET_OFFERING_DETAILS, {
    variables: { id: chat.offeringId },
    skip: !chat.offeringId,
  });

  const lastMessage = chat.messages[chat.messages.length - 1];
  const offering = offeringData?.findOfferingById;
  const vendor = offering?.vendor;

  const isPaymentNote =
    lastMessage?.content?.includes("Payment Note") ||
    lastMessage?.content?.startsWith("📦");

  const previewText = isPaymentNote
    ? "📦 Advance Booking Payment Confirmed"
    : lastMessage?.content || "No messages yet";

  return (
    <Link
      href={`/visitor-dashboard/chats/${visitorId}/${chat.chatId}`}
      className="flex items-center px-5 py-4 border-l-4 border-transparent hover:border-orange hover:bg-orange/5 transition-all group border-b border-gray-100 last:border-b-0"
      onClick={() => {
        if (visitor?.id) {
          markChatAsRead({
            variables: { chatId: chat.chatId, userId: visitor.id, userType: "visitor" },
          }).catch(console.error);
        }
      }}
    >
      <div className="w-12 h-12 flex items-center justify-center bg-orange/10 text-orange font-bold text-base rounded-full mr-4 flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
        {offering?.name ? offering.name[0].toUpperCase() : <FaStore />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-900 font-body text-sm truncate group-hover:text-orange transition-colors">
            {offering?.name || "Wedding Service"}
          </h3>
          {lastMessage && (
            <span className="text-[11px] text-gray-400 font-body flex-shrink-0">
              {formatDistanceToNow(new Date(lastMessage.timestamp), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
        <div className="flex items-center font-body gap-1.5 text-xs text-gray-500 mt-0.5">
          <IoLocationSharp className="text-orange shrink-0" />
          <span className="truncate">
            {vendor?.busname || "Vendor"}
            {vendor?.city ? ` • ${vendor.city}` : ""}
          </span>
        </div>
        <p
          className={`text-xs mt-1 truncate font-body ${
            isPaymentNote ? "text-amber-800 font-medium" : "text-gray-600"
          }`}
        >
          {previewText}
        </p>
      </div>
    </Link>
  );
};

const VisitorChatList = ({ visitorId }: VisitorChatListProps) => {
  const { data, loading } = useQuery(GET_VISITOR_CHATS, {
    variables: { visitorId },
    skip: !visitorId,
  });

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-3">
        <LoaderJelly />
        <p className="text-xs font-medium text-gray-400">Loading conversations...</p>
      </div>
    );
  }

  if (!data?.getVisitorChats || data.getVisitorChats.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 font-body">
        <FaStore className="text-3xl text-gray-300 mx-auto mb-3" />
        <p className="text-base font-semibold text-gray-800">No conversations yet</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          When you message a vendor from their service page or book a package, your conversations will appear here.
        </p>
        <Link
          href="/services"
          className="inline-block mt-4 text-xs font-semibold text-orange hover:underline"
        >
          Browse Wedding Services &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {data.getVisitorChats.map((chat: Chat) => (
        <ChatItem key={chat.chatId} chat={chat} visitorId={visitorId} />
      ))}
    </div>
  );
};

export default VisitorChatList;
