import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private chatService: ChatService) {}

  // Public method so resolver can emit unread count after GraphQL markChatAsRead
  emitUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unreadCount', { count });
  }

  handleConnection(client: Socket) {
    // Client connected
  }

  handleDisconnect(client: Socket) {
    // Remove user from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { userId: string; userType: 'visitor' | 'vendor' },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    
    // Join user-specific room
    client.join(`user:${data.userId}`);
    
    // Get initial unread count and return it
    const unreadCount = await this.chatService.getUnreadCount(data.userId, data.userType);
    
    return { success: true, unreadCount };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      senderId: string;
      senderType: 'visitor' | 'vendor';
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Determine which ID to use based on sender type
      const visitorSenderId = data.senderType === 'visitor' ? data.senderId : null;
      const vendorSenderId = data.senderType === 'vendor' ? data.senderId : null;

      // Save message to database
      const updatedChat = await this.chatService.sendMessage({
        chatId: data.chatId,
        content: data.content,
        visitorSenderId,
        vendorSenderId,
      });

      // Get the latest message
      const latestMessage = updatedChat.messages[updatedChat.messages.length - 1];

      // Emit to both users in the chat
      this.server.to(`chat:${data.chatId}`).emit('newMessage', {
        chatId: data.chatId,
        message: latestMessage,
        chat: updatedChat,
      });

      // Emit unread count updates
      const visitorUnreadCount = await this.chatService.getUnreadCount(
        updatedChat.visitorId,
        'visitor',
      );
      const vendorUnreadCount = await this.chatService.getUnreadCount(
        updatedChat.vendorId,
        'vendor',
      );

      this.server.to(`user:${updatedChat.visitorId}`).emit('unreadCount', {
        count: visitorUnreadCount,
      });
      this.server.to(`user:${updatedChat.vendorId}`).emit('unreadCount', {
        count: vendorUnreadCount,
      });

      return { success: true, message: latestMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat:${data.chatId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat:${data.chatId}`);
    return { success: true };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { chatId: string; userId: string; userType: 'visitor' | 'vendor' },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.chatId, data.userId, data.userType);

      // Emit updated unread count
      const unreadCount = await this.chatService.getUnreadCount(data.userId, data.userType);
      
      this.server.to(`user:${data.userId}`).emit('unreadCount', {
        count: unreadCount,
      });

      return { success: true, unreadCount };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(
    @MessageBody() data: { userId: string; userType: 'visitor' | 'vendor' },
  ) {
    try {
      const count = await this.chatService.getUnreadCount(data.userId, data.userType);
      return { success: true, count };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, error: error.message };
    }
  }

  // Method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
