import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import type { TransactionType, TransactionStatus, TransactionDirection } from '../../common/types';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wallet', required: true })
  walletId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ['topup', 'hold', 'capture', 'release', 'payout', 'refund', 'fee'],
    required: true,
  })
  type: TransactionType;

  @Prop({ required: true })
  amountCents: number;

  @Prop({ required: true, default: 'EGP' })
  currency: string;

  @Prop({
    type: {
      appointmentId: { type: MongooseSchema.Types.ObjectId, ref: 'Appointment' },
      paymobRef: String,
    },
  })
  related?: {
    appointmentId?: MongooseSchema.Types.ObjectId;
    paymobRef?: string;
  };

  @Prop({
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending',
  })
  status: TransactionStatus;

  @Prop({
    type: String,
    enum: ['in', 'out'],
    required: true,
  })
  direction: TransactionDirection;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Create index for wallet lookups
TransactionSchema.index({ walletId: 1 });
// Create index for chronological sorting
TransactionSchema.index({ createdAt: -1 });
// Create index for appointment-related transactions
TransactionSchema.index({ 'related.appointmentId': 1 });