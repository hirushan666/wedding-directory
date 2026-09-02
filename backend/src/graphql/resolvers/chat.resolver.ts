import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { ChatService } from "../../modules/chat/chat.service";
import { ChatType } from "../../database/types/chatTypes";
import { CreateChatInput } from "../inputs/createChat.input";
import { ChatGateway } from "../../modules/chat/chat.gateway";

@Resolver()
export class ChatResolver {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  // Keep your existing queries
  @Query(() => [ChatType])
  async getVendorChats(@Args("vendorId") vendorId: string) {
    return this.chatService.getVendorChats(vendorId);
  }

  @Query(() => [ChatType])
  async getOfferingChats(@Args("offeringId") offeringId: string) {
    return this.chatService.getOfferingChats(offeringId);
  }

  @Query(() => [ChatType])
  async getVisitorChats(@Args("visitorId") visitorId: string) {
    return this.chatService.getVisitorChats(visitorId);
  }

  @Query(() => ChatType)
  async getChatHistory(@Args("chatId") chatId: string) {
    return this.chatService.getChatHistory(chatId);
  }
  @Query(() => ChatType)
  async getChat(
    @Args("visitorId") visitorId: string,
    @Args("offeringId") offeringId: string
  ) {
    return this.chatService.findOrCreateChat(offeringId, visitorId);
  }

  
  @Mutation(() => ChatType)
  async createChat(@Args('createChatInput') createChatInput: CreateChatInput) {
    return this.chatService.findOrCreateChat(
      createChatInput.offeringId,
      createChatInput.visitorId
    );
  }

  @Mutation(() => ChatType)
  async sendQuoteMessage(
    @Args("chatId") chatId: string,
    @Args("content") content: string,
    @Args("visitorSenderId", { nullable: true }) visitorSenderId?: string,
    @Args("vendorSenderId", { nullable: true }) vendorSenderId?: string
  ) {
    const updatedChat = await this.chatService.sendMessage({
      chatId,
      content,
      visitorSenderId,
      vendorSenderId,
    });

    if (updatedChat?.chatId) {
      const latestMessage = updatedChat.messages?.[updatedChat.messages.length - 1];
      this.chatGateway.server.to(`chat:${updatedChat.chatId}`).emit('newMessage', {
        chatId: updatedChat.chatId,
        message: latestMessage,
        chat: updatedChat,
      });

      const [visitorUnreadCount, vendorUnreadCount] = await Promise.all([
        this.chatService.getUnreadCount(updatedChat.visitorId, 'visitor'),
        this.chatService.getUnreadCount(updatedChat.vendorId, 'vendor'),
      ]);

      this.chatGateway.server.to(`user:${updatedChat.visitorId}`).emit('unreadCount', {
        count: visitorUnreadCount,
      });
      this.chatGateway.server.to(`user:${updatedChat.vendorId}`).emit('unreadCount', {
        count: vendorUnreadCount,
      });
    }

    return updatedChat;
  }

  @Query(() => Number)
  async getUnreadMessageCount(
    @Args("userId") userId: string,
    @Args("userType") userType: string
  ) {
    return this.chatService.getUnreadCount(userId, userType as 'visitor' | 'vendor');
  }

  @Mutation(() => Boolean)
  async markChatAsRead(
    @Args("chatId") chatId: string,
    @Args("userId") userId: string,
    @Args("userType") userType: string
  ) {
    await this.chatService.markMessagesAsRead(chatId, userId, userType as 'visitor' | 'vendor');
    
    // Get updated unread count and emit via WebSocket so badge updates
    const unreadCount = await this.chatService.getUnreadCount(userId, userType as 'visitor' | 'vendor');
    console.log(`markChatAsRead: ${userType} ${userId} - new unread count: ${unreadCount}`);
    this.chatGateway.emitUnreadCount(userId, unreadCount);
    
    return true;
  }
}
