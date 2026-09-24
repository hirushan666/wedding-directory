import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuid } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { VisitorEntity } from "../../database/entities/visitor.entity";
import { VendorEntity } from "../../database/entities/vendor.entity";
import { ServiceEntity } from "../../database/entities/service.entity";
import { IChat } from "../../database/schemas/chat.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel("Chat") private chatModel: Model<IChat>,
    @InjectRepository(VisitorEntity)
    private visitorRepository: Repository<VisitorEntity>,
    @InjectRepository(VendorEntity)
    private vendorRepository: Repository<VendorEntity>,
    @InjectRepository(ServiceEntity)
    private serviceRepository: Repository<ServiceEntity>
  ) {}

  private async sendPushToVendor(
    chat: IChat,
    messageContent: string,
    visitorId?: string,
  ): Promise<void> {
    try {
      const vendor = await this.vendorRepository.findOne({
        where: { id: chat.vendorId },
      });
      const pushToken = vendor?.expoPushToken?.trim();
      if (!pushToken) {
        console.log(`[PushNotification] No expoPushToken found for vendor ${chat.vendorId}`);
        return;
      }

      const visitor = visitorId
        ? await this.visitorRepository.findOne({ where: { id: visitorId } })
        : null;
      const visitorName = [visitor?.visitor_fname, visitor?.partner_fname]
        .filter(Boolean)
        .join(' & ')
        .trim();

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          to: pushToken,
          sound: 'default',
          channelId: 'default',
          priority: 'high',
          title: visitorName ? `New message from ${visitorName}` : 'New message',
          body: messageContent.substring(0, 140),
          data: {
            type: 'chat_message',
            chatId: chat.chatId,
            visitorId: chat.visitorId,
            vendorId: chat.vendorId,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[PushNotification] Expo push returned status ${response.status} for vendor ${chat.vendorId}`);
      } else {
        console.log(`[PushNotification] Successfully sent chat push to vendor ${chat.vendorId}`);
      }
    } catch (error) {
      console.error('Failed to send vendor push notification:', error);
    }
  }

  async findOrCreateChat(
    serviceId: string,
    visitorId: string
  ): Promise<IChat> {
    let chat = await this.chatModel.findOne({ serviceId, visitorId });

    if (!chat) {
      const visitor = await this.visitorRepository.findOne({
        where: { id: visitorId },
      });

      const service = await this.serviceRepository.findOne({
        where: { id: serviceId },
        relations: ["vendor"],
      });

      const vendorId = service.vendor.id;
      // const vendor = await this.vendorRepository.findOne({
      //   where: { id: vendorId },
      // });

      chat = new this.chatModel({
        chatId: uuid(),
        serviceId,
        vendorId,
        visitorId,
        visitor: { id: visitor.id },
        vendor: { id: vendorId },
        service: { id: service.id },
        messages: [],
      });
      await chat.save();
    }
    return {
      ...chat.toObject(),
      visitor: { id: chat.visitorId },
      vendor: { id: chat.vendorId },
      service: { id: chat.serviceId },
    };
  }

  async getVendorChats(vendorId: string): Promise<IChat[]> {
    return this.chatModel
      .find({
        vendorId,
        $or: [{ serviceId: { $exists: true } }, { serviceId: { $ne: null } }],
      })
      .sort({ updatedAt: -1 });
  }

  async getVisitorChats(visitorId: string): Promise<IChat[]> {
    return this.chatModel
      .find({
        visitorId,
        $or: [{ serviceId: { $exists: true } }, { serviceId: { $ne: null } }],
      })
      .sort({ updatedAt: -1 });
  }

  async getServiceChats(serviceId: string): Promise<IChat[]> {
    return this.chatModel.find({ serviceId }).sort({ updatedAt: -1 });
  }

  async addMessage(
    chatId: string,
    message: {
      content: string;
      senderId: string;
      senderType: string;
      timestamp?: Date;
    }
  ): Promise<IChat> {
    return this.chatModel.findOneAndUpdate(
      { chatId },
      {
        $push: { messages: { ...message, id: uuid() } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );
  }

  async getChatHistory(chatId: string): Promise<IChat> {
    return this.chatModel.findOne({ chatId });
  }

  async sendMessage(data: {
    chatId: string;
    content: string;
    visitorSenderId?: string;
    vendorSenderId?: string;
  }): Promise<IChat> {
    const senderId = data.visitorSenderId || data.vendorSenderId;
    const message = {
      id: uuid(),
      content: data.content,
      senderId: senderId,
      senderType: data.visitorSenderId ? "visitor" : "vendor",
      timestamp: new Date(),
      readBy: [senderId], // Sender has read their own message
    };

    const updatedChat = await this.chatModel.findOneAndUpdate(
      { chatId: data.chatId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (updatedChat && data.visitorSenderId) {
      await this.sendPushToVendor(updatedChat, data.content, data.visitorSenderId);
    }

    return updatedChat;
  }

  async markMessagesAsRead(
    chatId: string,
    userId: string,
    userType: 'visitor' | 'vendor'
  ): Promise<void> {
    // Get the chat first
    const chat = await this.chatModel.findOne({ chatId });
    
    if (!chat) {
      throw new Error('Chat not found');
    }


    // Update readBy for all messages that don't already include this userId
    const updatedMessages = chat.messages.map(msg => {
      if (!msg.readBy) {
        msg.readBy = [];
      }
      if (!msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
      }
      return msg;
    });

    // Save the updated chat
    await this.chatModel.updateOne(
      { chatId },
      { $set: { messages: updatedMessages } }
    );
  }

  async getUnreadCount(userId: string, userType: 'visitor' | 'vendor'): Promise<number> {
    const field = userType === 'visitor' ? 'visitorId' : 'vendorId';
    
    const chats = await this.chatModel.find({
      [field]: userId
    });

    let unreadCount = 0;
    
    for (const chat of chats) {
      for (const message of chat.messages) {
        // Count messages not sent by this user and not read by them
        if (message.senderId !== userId && !message.readBy?.includes(userId)) {
          unreadCount++;
        }
      }
    }

    return unreadCount;
  }

  async getChatsWithUnreadCount(userId: string, userType: 'visitor' | 'vendor'): Promise<any[]> {
    const field = userType === 'visitor' ? 'visitorId' : 'vendorId';
    
    const chats = await this.chatModel.find({
      [field]: userId
    }).sort({ updatedAt: -1 });

    return chats.map(chat => {
      const unreadCount = chat.messages.filter(
        msg => msg.senderId !== userId && !msg.readBy?.includes(userId)
      ).length;

      return {
        ...chat.toObject(),
        unreadCount
      };
    });
  }
}
