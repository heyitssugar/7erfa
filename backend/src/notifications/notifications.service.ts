import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: CreateNotificationDto) {
    const notification = new this.notificationModel({
      ...data,
      read: false,
    });
    await notification.save();

    // Send real-time notification
    await this.notificationsGateway.sendNotification(data.userId, notification);

    // Update unread count
    const unreadCount = await this.getUnreadCount(data.userId);
    await this.notificationsGateway.sendNotificationCount(
      data.userId,
      unreadCount,
    );

    return notification;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true },
      )
      .exec();

    if (notification) {
      // Update unread count
      const unreadCount = await this.getUnreadCount(userId);
      await this.notificationsGateway.sendNotificationCount(userId, unreadCount);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();

    // Update unread count (should be 0)
    await this.notificationsGateway.sendNotificationCount(userId, 0);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false }).exec();
  }

  async getUserNotifications(
    userId: string,
    limit = 20,
    before?: Date,
  ) {
    const query = { userId };
    if (before) {
      query['createdAt'] = { $lt: before };
    }

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async deleteOldNotifications(cutoffDate: Date) {
    return this.notificationModel
      .deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate },
      })
      .exec();
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.notificationModel
      .findOneAndDelete({ _id: notificationId, userId })
      .exec();
  }
}