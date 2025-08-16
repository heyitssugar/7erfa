import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CraftsmenModule } from './craftsmen/craftsmen.module';
import { CatalogModule } from './catalog/catalog.module';
import { SearchModule } from './search/search.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymobModule } from './paymob/paymob.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AdminModule } from './admin/admin.module';
import { DisputesModule } from './disputes/disputes.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    CraftsmenModule,
    CatalogModule,
    SearchModule,
    AvailabilityModule,
    AppointmentsModule,
    WalletModule,
    PaymobModule,
    ReviewsModule,
    MessagingModule,
    NotificationsModule,
    SubscriptionsModule,
    AdminModule,
    DisputesModule,
    JobsModule,
  ],
})
export class AppModule {}