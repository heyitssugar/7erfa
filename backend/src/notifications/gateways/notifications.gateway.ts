import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../../messaging/guards/ws-jwt.guard';
import { NotificationsService } from '../notifications.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(WsJwtGuard)
  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.sub;

    // Join user's notification room
    client.join(`notifications:${userId}`);

    // Send unread notifications count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    client.emit('notifications:count', unreadCount);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      client.leave(`notifications:${userId}`);
    }
  }

  async sendNotification(userId: string, notification: any) {
    this.server
      .to(`notifications:${userId}`)
      .emit('notifications:new', notification);
  }

  async sendNotificationCount(userId: string, count: number) {
    this.server.to(`notifications:${userId}`).emit('notifications:count', count);
  }
}
