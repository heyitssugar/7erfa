import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Address, AppointmentStatus } from '../../common/types';

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  craftsmanId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: Object, required: true })
  address: Address;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ required: true })
  durationMins: number;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'canceled', 'in_progress', 'completed', 'disputed', 'refunded'],
    default: 'pending',
  })
  status: AppointmentStatus;

  @Prop({
    type: {
      currency: { type: String, default: 'EGP' },
      subtotal: { type: Number, required: true },
      fees: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  })
  price: {
    currency: string;
    subtotal: number;
    fees: number;
    total: number;
  };

  @Prop({ type: MongooseSchema.Types.ObjectId })
  walletHoldTxnId?: MongooseSchema.Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop([String])
  photos?: string[];

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      startedAt: Date,
      lastLat: Number,
      lastLng: Number,
    },
  })
  tracking: {
    enabled: boolean;
    startedAt?: Date;
    lastLat?: number;
    lastLng?: number;
  };

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Review' })
  reviewId?: MongooseSchema.Types.ObjectId;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Create compound index for craftsman's schedule
AppointmentSchema.index({ craftsmanId: 1, scheduledAt: 1 });
// Create index for customer lookups
AppointmentSchema.index({ customerId: 1 });
// Create index for status-based queries
AppointmentSchema.index({ status: 1 });
// Create 2dsphere index for location-based queries
AppointmentSchema.index({ 'address.location': '2dsphere' });
