import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { ReminderProcessor } from './processors/reminder.processor';
import { SettlementProcessor } from './processors/settlement.processor';
import { CleanupProcessor } from './processors/cleanup.processor';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: new URL(configService.get('REDIS_URI')).hostname,
          port: parseInt(new URL(configService.get('REDIS_URI')).port),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'reminder' },
      { name: 'settlement' },
      { name: 'cleanup' },
    ),
  ],
  providers: [
    EmailProcessor,
    ReminderProcessor,
    SettlementProcessor,
    CleanupProcessor,
    JobsService,
  ],
  exports: [JobsService],
})
export class JobsModule {}
