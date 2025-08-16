import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('reminder') private readonly reminderQueue: Queue,
    @InjectQueue('settlement') private readonly settlementQueue: Queue,
    @InjectQueue('cleanup') private readonly cleanupQueue: Queue,
  ) {
    this.setupRecurringJobs();
  }

  private async setupRecurringJobs() {
    // Clean up expired holds every 5 minutes
    await this.cleanupQueue.add(
      'expired-holds',
      {},
      {
        repeat: {
          every: 5 * 60 * 1000, // 5 minutes
        },
      },
    );

    // Clean up old notifications daily at midnight
    await this.cleanupQueue.add(
      'old-notifications',
      {},
      {
        repeat: {
          cron: '0 0 * * *', // Every day at midnight
        },
      },
    );
  }

  async scheduleEmail(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }) {
    return this.emailQueue.add('send', data);
  }

  async scheduleAppointmentReminder(appointmentId: string, type: '24h' | '2h') {
    return this.reminderQueue.add('appointment', { appointmentId, type });
  }

  async scheduleSettlement(appointmentId: string) {
    return this.settlementQueue.add('process', { appointmentId });
  }

  async scheduleAppointmentReminders(appointmentId: string, scheduledAt: Date) {
    // Schedule 24h reminder
    const reminder24h = new Date(scheduledAt);
    reminder24h.setHours(reminder24h.getHours() - 24);
    if (reminder24h > new Date()) {
      await this.reminderQueue.add(
        'appointment',
        { appointmentId, type: '24h' },
        { delay: reminder24h.getTime() - Date.now() },
      );
    }

    // Schedule 2h reminder
    const reminder2h = new Date(scheduledAt);
    reminder2h.setHours(reminder2h.getHours() - 2);
    if (reminder2h > new Date()) {
      await this.reminderQueue.add(
        'appointment',
        { appointmentId, type: '2h' },
        { delay: reminder2h.getTime() - Date.now() },
      );
    }
  }
}
