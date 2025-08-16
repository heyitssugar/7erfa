import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { MessagingService } from '../messaging.service';
import { SendMessageDto } from '../dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagingService: MessagingService) {}

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.sub;
    await this.messagingService.handleUserConnection(userId, client.id);

    // Join user's personal room
    client.join(`user:${userId}`);

    // Join all conversation rooms the user is part of
    const conversations = await this.messagingService.getUserConversations(userId);
    conversations.forEach((conversation) => {
      client.join(`conversation:${conversation._id}`);
    });
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      await this.messagingService.handleUserDisconnection(userId, client.id);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const userId = client.data.user.sub;
    const message = await this.messagingService.createMessage({
      senderId: userId,
      ...data,
    });

    // Broadcast to conversation room
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit('message:received', message);

    return message;
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    const userId = client.data.user.sub;
    const isParticipant = await this.messagingService.isConversationParticipant(
      conversationId,
      userId,
    );

    if (isParticipant) {
      client.join(`conversation:${conversationId}`);
      return { success: true };
    }

    return { success: false, error: 'Not authorized to join this conversation' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(`conversation:${conversationId}`);
    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = client.data.user.sub;
    await this.messagingService.markMessageAsRead(data.messageId, userId);

    // Notify other participants
    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      messageId: data.messageId,
      userId,
    });
  }
}
