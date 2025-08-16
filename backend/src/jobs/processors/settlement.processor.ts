import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { Transaction } from '../../wallet/schemas/transaction.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { JobsService } from '../jobs.service';

interface SettlementData {
  appointmentId: string;
}

@Processor('settlement')
export class SettlementProcessor {
  private readonly logger = new Logger(SettlementProcessor.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
  ) {}

  @Process('process')
  async handleSettlement(job: Job<SettlementData>) {
    try {
      const { appointmentId } = job.data;

      const appointment = await this.appointmentModel
        .findById(appointmentId)
        .populate('customerId craftsmanId')
        .exec();

      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found`);
        return;
      }

      // Only process completed appointments
      if (appointment.status !== 'completed') {
        return;
      }

      // Find the hold transaction
      const holdTransaction = await this.transactionModel.findById(
        appointment.walletHoldTxnId,
      );

      if (!holdTransaction) {
        this.logger.error(`Hold transaction not found for appointment ${appointmentId}`);
        return;
      }

      // Calculate platform fee
      const platformFeePercent = 0.10; // 10% platform fee
      const platformFee = Math.floor(holdTransaction.amountCents * platformFeePercent);
      const craftsmanAmount = holdTransaction.amountCents - platformFee;

      // Create capture transaction for craftsman
      const captureTransaction = await this.transactionModel.create({
        walletId: appointment.craftsmanId.walletId,
        type: 'capture',
        amountCents: craftsmanAmount,
        currency: 'EGP',
        related: {
          appointmentId: appointment._id,
          holdTransactionId: holdTransaction._id,
        },
        status: 'succeeded',
        direction: 'in',
      });

      // Create fee transaction
      await this.transactionModel.create({
        walletId: appointment.craftsmanId.walletId,
        type: 'fee',
        amountCents: platformFee,
        currency: 'EGP',
        related: {
          appointmentId: appointment._id,
          captureTransactionId: captureTransaction._id,
        },
        status: 'succeeded',
        direction: 'out',
      });

      // Send notifications
      await this.notificationsService.create({
        userId: appointment.craftsmanId.toString(),
        type: 'payment_received',
        title: 'Payment Received',
        body: `Payment of ${craftsmanAmount / 100} EGP has been credited to your wallet`,
        data: { appointmentId },
      });

      // Send email
      await this.jobsService.scheduleEmail({
        to: appointment.craftsmanId.email,
        subject: 'Payment Received',
        template: 'payment-received',
        context: {
          name: appointment.craftsmanId.firstName,
          amount: craftsmanAmount / 100,
          fee: platformFee / 100,
          appointmentId,
        },
      });

      this.logger.log(
        `Processed settlement for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process settlement: ${error.message}`,
      );
      throw error;
    }
  }
}
