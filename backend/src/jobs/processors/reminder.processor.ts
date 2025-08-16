import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../../appointments/schemas/appointment.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { JobsService } from '../jobs.service';

interface AppointmentReminderData {
  appointmentId: string;
  type: '24h' | '2h';
}

@Processor('reminder')
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
  ) {}

  @Process('appointment')
  async handleAppointmentReminder(job: Job<AppointmentReminderData>) {
    try {
      const { appointmentId, type } = job.data;

      const appointment = await this.appointmentModel
        .findById(appointmentId)
        .populate('customerId craftsmanId')
        .exec();

      if (!appointment) {
        this.logger.warn(`Appointment ${appointmentId} not found`);
        return;
      }

      // Don't send reminders for non-active appointments
      if (!['pending', 'accepted'].includes(appointment.status)) {
        return;
      }

      // Send notification to customer
      await this.notificationsService.create({
        userId: appointment.customerId.toString(),
        type: `appointment_reminder_${type}`,
        title: 'Upcoming Appointment Reminder',
        body: this.getReminderMessage(type),
        data: { appointmentId },
      });

      // Send notification to craftsman
      await this.notificationsService.create({
        userId: appointment.craftsmanId.toString(),
        type: `appointment_reminder_${type}`,
        title: 'Upcoming Appointment Reminder',
        body: this.getReminderMessage(type),
        data: { appointmentId },
      });

      // Schedule email reminders
      await this.jobsService.scheduleEmail({
        to: appointment.customerId.email,
        subject: 'Upcoming Appointment Reminder',
        template: 'appointment-reminder',
        context: {
          name: appointment.customerId.firstName,
          time: appointment.scheduledAt.toLocaleString(),
          type,
        },
      });

      await this.jobsService.scheduleEmail({
        to: appointment.craftsmanId.email,
        subject: 'Upcoming Appointment Reminder',
        template: 'appointment-reminder',
        context: {
          name: appointment.craftsmanId.firstName,
          time: appointment.scheduledAt.toLocaleString(),
          type,
        },
      });

      this.logger.log(
        `Sent ${type} reminder for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process appointment reminder: ${error.message}`,
      );
      throw error;
    }
  }

  private getReminderMessage(type: '24h' | '2h'): string {
    return type === '24h'
      ? 'You have an appointment scheduled for tomorrow'
      : 'You have an appointment in 2 hours';
  }
}
