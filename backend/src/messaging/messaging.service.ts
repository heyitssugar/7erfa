import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagingService {
  private readonly connectedUsers = new Map<string, string[]>();

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleUserConnection(userId: string, socketId: string) {
    const userSockets = this.connectedUsers.get(userId) || [];
    this.connectedUsers.set(userId, [...userSockets, socketId]);
  }

  async handleUserDisconnection(userId: string, socketId: string) {
    const userSockets = this.connectedUsers.get(userId) || [];
    this.connectedUsers.set(
      userId,
      userSockets.filter((id) => id !== socketId),
    );

    if (this.connectedUsers.get(userId)?.length === 0) {
      this.connectedUsers.delete(userId);
    }
  }

  async getUserConversations(userId: string) {
    return this.conversationModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async createMessage(data: CreateMessageDto & { senderId: string }) {
    const conversation = await this.conversationModel
      .findById(data.conversationId)
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = new this.messageModel({
      ...data,
      readBy: [data.senderId], // Initialize readBy with sender
    });
    await message.save();

    // Update conversation's lastMessageAt
    await this.conversationModel.findByIdAndUpdate(data.conversationId, {
      lastMessageAt: new Date(),
    });

    // Send notifications to offline participants
    const offlineParticipants = conversation.participants.filter(
      (participantId) => !this.connectedUsers.has(participantId.toString()),
    );

    for (const participantId of offlineParticipants) {
      await this.notificationsService.create({
        userId: participantId.toString(),
        type: 'new_message',
        title: 'New Message',
        body: data.body,
        data: {
          conversationId: data.conversationId,
          messageId: message._id,
        },
      });
    }

    return message;
  }

  async isConversationParticipant(conversationId: string, userId: string) {
    const conversation = await this.conversationModel
      .findOne({
        _id: conversationId,
        participants: userId,
      })
      .exec();
    return !!conversation;
  }

  async markMessageAsRead(messageId: string, userId: string) {
    return this.messageModel
      .findByIdAndUpdate(
        messageId,
        {
          $addToSet: { readBy: userId },
        },
        { new: true },
      )
      .exec();
  }

  async getConversationMessages(conversationId: string, limit = 50, before?: Date) {
    const query = { conversationId };
    if (before) {
      query['createdAt'] = { $lt: before };
    }

    return this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}