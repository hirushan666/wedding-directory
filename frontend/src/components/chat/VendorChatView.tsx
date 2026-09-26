"use client";

import { useParams } from "next/navigation";
import VendorChatWindow from "./VendorChatWindow";

const VendorChatView = () => {
  const params = useParams();
  const chatId = typeof params.chatId === "string" ? params.chatId : "";

  if (!chatId) return null;

  return <VendorChatWindow chatId={chatId} />;
};

export default VendorChatView;
