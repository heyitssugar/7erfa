import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { KycStatus } from '../../common/types';

@Schema({ timestamps: true })
export class Craftsman extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop([{
    categoryId: { type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true },
    title: String,
  }])
  crafts: Array<{ categoryId: MongooseSchema.Types.ObjectId; title?: string }>;

  @Prop([{
    city: { type: String, required: true },
    area: { type: String, required: true },
    radiusKm: { type: Number, required: true },
  }])
  serviceAreas: Array<{ city: string; area: string; radiusKm: number }>;

  @Prop()
  hourlyRate?: number;

  @Prop()
  baseCalloutFee?: number;

  @Prop()
  bio?: string;

  @Prop()
  yearsExperience?: number;

  @Prop([{
    url: { type: String, required: true },
    caption: String,
  }])
  portfolio: Array<{ url: string; caption?: string }>;

  @Prop({
    type: {
      avg: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  })
  rating: { avg: number; count: number };

  @Prop([{
    dayOfWeek: { type: Number, required: true }, // 0-6
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },   // HH:mm
  }])
  availabilityRules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;

  @Prop([{
    date: { type: String, required: true }, // YYYY-MM-DD
    windows: [{
      start: { type: String, required: true }, // HH:mm
      end: { type: String, required: true },   // HH:mm
    }],
  }])
  availabilityExceptions: Array<{
    date: string;
    windows: Array<{ start: string; end: string }>;
  }>;

  @Prop({
    type: {
      status: { type: String, enum: ['unsubmitted', 'pending', 'approved', 'rejected'], default: 'unsubmitted' },
      docs: [{
        type: { type: String, required: true },
        url: { type: String, required: true },
      }],
      notes: String,
    },
  })
  kyc: {
    status: KycStatus;
    docs: Array<{ type: string; url: string }>;
    notes?: string;
  };

  @Prop({
    type: {
      planId: { type: MongooseSchema.Types.ObjectId, ref: 'Plan' },
      status: { type: String, enum: ['active', 'canceled', 'past_due'] },
      renewAt: Date,
    },
  })
  subscription?: {
    planId?: MongooseSchema.Types.ObjectId;
    status?: 'active' | 'canceled' | 'past_due';
    renewAt?: Date;
  };

  @Prop({
    type: {
      jobsCompleted: { type: Number, default: 0 },
      onTimeRate: { type: Number, default: 100 },
    },
  })
  stats: { jobsCompleted: number; onTimeRate: number };
}

export const CraftsmanSchema = SchemaFactory.createForClass(Craftsman);

// Create index for user lookups
CraftsmanSchema.index({ userId: 1 }, { unique: true });
// Create index for category-based searches
CraftsmanSchema.index({ 'crafts.categoryId': 1 });
// Create index for rating-based sorting
CraftsmanSchema.index({ 'rating.avg': -1 });
// Create compound index for location-based searches
CraftsmanSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.area': 1 });
