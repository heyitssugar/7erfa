import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { Transaction } from '../../wallet/schemas/transaction.schema';
import { NotificationsService } from '../../notifications/notifications.service';

@Processor('cleanup')
export class CleanupProcessor {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Process('expired-holds')
  async handleExpiredHolds(job: Job) {
    try {
      const expiryThreshold = new Date();
      expiryThreshold.setMinutes(expiryThreshold.getMinutes() - 15);

      // Find pending appointments with expired holds
      const expiredAppointments = await this.appointmentModel
        .find({
          status: 'pending',
          createdAt: { $lt: expiryThreshold },
        })
        .populate('customerId craftsmanId')
        .exec();

      for (const appointment of expiredAppointments) {
        // Release the hold
        if (appointment.walletHoldTxnId) {
          await this.transactionModel.create({
            walletId: appointment.customerId.walletId,
            type: 'release',
            amountCents: appointment.price.total * 100,
            currency: 'EGP',
            related: {
              appointmentId: appointment._id,
              holdTransactionId: appointment.walletHoldTxnId,
            },
            status: 'succeeded',
            direction: 'in',
          });
        }

        // Update appointment status
        await this.appointmentModel.findByIdAndUpdate(appointment._id, {
          status: 'canceled',
        });

        // Notify customer
        await this.notificationsService.create({
          userId: appointment.customerId.toString(),
          type: 'appointment_expired',
          title: 'Booking Request Expired',
          body: 'Your booking request has expired. The held amount has been released back to your wallet.',
          data: { appointmentId: appointment._id },
        });

        // Notify craftsman
        await this.notificationsService.create({
          userId: appointment.craftsmanId.toString(),
          type: 'appointment_expired',
          title: 'Booking Request Expired',
          body: 'A booking request has expired due to no response.',
          data: { appointmentId: appointment._id },
        });

        this.logger.log(
          `Cleaned up expired hold for appointment ${appointment._id}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to clean up expired holds: ${error.message}`,
      );
      throw error;
    }
  }

  @Process('old-notifications')
  async handleOldNotifications(job: Job) {
    try {
      const retentionDays = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old read notifications
      const result = await this.notificationsService.deleteOldNotifications(cutoffDate);

      this.logger.log(
        `Deleted ${result.deletedCount} old notifications`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to clean up old notifications: ${error.message}`,
      );
      throw error;
    }
  }
}
